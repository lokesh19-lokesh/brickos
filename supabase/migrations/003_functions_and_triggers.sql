-- =============================================================================
-- BRICKFLOW ERP - 003_functions_and_triggers.sql
-- Business Functions, Atomic Transactions, & Automated Triggers
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. UPDATED_AT TIMESTAMP TRIGGER FUNCTION
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply updated_at trigger to relevant tables
DO $$ 
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename IN (
              'profiles', 'factories', 'factory_users', 'factory_onboarding', 
              'subscription_plans', 'subscriptions', 'products', 'raw_materials', 
              'vendors', 'customers', 'raw_material_purchases', 'production_batches', 
              'employees', 'attendance', 'wage_records', 'sales', 'invoices', 
              'expenses', 'demo_accounts'
          )
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON %I;', tbl);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();', tbl);
    END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 2. STOCK & BALANCE CALCULATION FUNCTIONS
-- -----------------------------------------------------------------------------

-- Current Raw Material Stock (sum of all transactions)
CREATE OR REPLACE FUNCTION get_raw_material_stock(p_factory_id UUID, p_material_id UUID)
RETURNS NUMERIC
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT COALESCE(SUM(quantity), 0.00)
    FROM raw_material_stock_transactions
    WHERE factory_id = p_factory_id
      AND raw_material_id = p_material_id;
$$;

-- Current Finished Goods Stock (sum of all transactions)
CREATE OR REPLACE FUNCTION get_finished_stock(p_factory_id UUID, p_product_id UUID)
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT COALESCE(SUM(quantity), 0)::INT
    FROM finished_stock_transactions
    WHERE factory_id = p_factory_id
      AND product_id = p_product_id;
$$;

-- Current Customer Outstanding Balance
CREATE OR REPLACE FUNCTION get_customer_balance(p_factory_id UUID, p_customer_id UUID)
RETURNS NUMERIC
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        COALESCE(c.opening_balance, 0.00) 
        + COALESCE((SELECT SUM(grand_total) FROM sales WHERE factory_id = p_factory_id AND customer_id = p_customer_id), 0.00)
        - COALESCE((SELECT SUM(amount) FROM customer_payments WHERE factory_id = p_factory_id AND customer_id = p_customer_id), 0.00)
    FROM customers c
    WHERE c.id = p_customer_id AND c.factory_id = p_factory_id;
$$;

-- Current Vendor Outstanding Balance
CREATE OR REPLACE FUNCTION get_vendor_balance(p_factory_id UUID, p_vendor_id UUID)
RETURNS NUMERIC
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        COALESCE(v.opening_balance, 0.00) 
        + COALESCE((SELECT SUM(total_amount) FROM raw_material_purchases WHERE factory_id = p_factory_id AND vendor_id = p_vendor_id), 0.00)
        - COALESCE((SELECT SUM(amount) FROM vendor_payments WHERE factory_id = p_factory_id AND vendor_id = p_vendor_id), 0.00)
    FROM vendors v
    WHERE v.id = p_vendor_id AND v.factory_id = p_factory_id;
$$;

-- Sequential Invoice Number Generator
CREATE OR REPLACE FUNCTION generate_invoice_number(p_factory_id UUID)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    curr_year VARCHAR;
    next_seq INT;
    new_inv VARCHAR;
BEGIN
    curr_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COUNT(*) + 1 INTO next_seq
    FROM invoices
    WHERE factory_id = p_factory_id
      AND TO_CHAR(invoice_date, 'YYYY') = curr_year;
    
    new_inv := 'INV-' || curr_year || '-' || LPAD(next_seq::TEXT, 4, '0');
    RETURN new_inv;
END;
$$;

-- -----------------------------------------------------------------------------
-- 3. COMPLETE PRODUCTION TRANSACTION (ATOMIC)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION complete_production(
    p_factory_id UUID,
    p_batch_code VARCHAR,
    p_production_date DATE,
    p_product_id UUID,
    p_target_quantity INT,
    p_output_quantity INT,
    p_damaged_quantity INT,
    p_machine_line VARCHAR,
    p_kiln_chamber VARCHAR,
    p_supervisor_name VARCHAR,
    p_mix_proportion VARCHAR,
    p_quality_grade quality_grade,
    p_consumptions JSONB, -- Array of { raw_material_id: UUID, quantity: NUMERIC, unit_name: VARCHAR }
    p_workers JSONB,      -- Array of { employee_id?: UUID, role: VARCHAR, hours_worked: NUMERIC }
    p_remarks TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_user_name VARCHAR;
    v_batch_id UUID;
    v_prod_name VARCHAR;
    v_item JSONB;
    v_curr_rm_stock NUMERIC;
    v_req_qty NUMERIC;
    v_rm_name VARCHAR;
BEGIN
    -- 1. Authorization check
    IF NOT has_factory_access(p_factory_id) THEN
        RETURN jsonb_build_object('success', false, 'error', jsonb_build_object('code', 'UNAUTHORIZED', 'message', 'You do not have access to this factory.'));
    END IF;

    SELECT p.id, p.full_name INTO v_user_id, v_user_name
    FROM profiles p
    WHERE p.auth_user_id = auth.uid();

    SELECT name INTO v_prod_name FROM products WHERE id = p_product_id AND factory_id = p_factory_id;
    IF v_prod_name IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', jsonb_build_object('code', 'PRODUCT_NOT_FOUND', 'message', 'Product does not exist.'));
    END IF;

    -- 2. Validate Raw Material availability
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_consumptions)
    LOOP
        v_req_qty := (v_item->>'quantity')::NUMERIC;
        SELECT name INTO v_rm_name FROM raw_materials WHERE id = (v_item->>'raw_material_id')::UUID AND factory_id = p_factory_id;
        v_curr_rm_stock := get_raw_material_stock(p_factory_id, (v_item->>'raw_material_id')::UUID);

        IF v_curr_rm_stock < v_req_qty THEN
            RETURN jsonb_build_object(
                'success', false, 
                'error', jsonb_build_object(
                    'code', 'INSUFFICIENT_RAW_MATERIAL', 
                    'message', format('Insufficient stock for %s. Available: %s, Required: %s', v_rm_name, v_curr_rm_stock, v_req_qty)
                )
            );
        END IF;
    END LOOP;

    -- 3. Create Production Batch
    INSERT INTO production_batches (
        factory_id, batch_code, production_date, product_id,
        target_quantity, output_quantity, damaged_quantity,
        machine_line, kiln_chamber, supervisor_name,
        mix_proportion, status, quality_grade, remarks, created_by
    ) VALUES (
        p_factory_id, p_batch_code, p_production_date, p_product_id,
        p_target_quantity, p_output_quantity, p_damaged_quantity,
        COALESCE(p_machine_line, 'Line 1'), p_kiln_chamber, p_supervisor_name,
        p_mix_proportion, 'completed', COALESCE(p_quality_grade, 'A Grade'), p_remarks, v_user_id
    ) RETURNING id INTO v_batch_id;

    -- 4. Record Material Consumption & Deduct Raw Material Stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_consumptions)
    LOOP
        INSERT INTO production_material_consumption (
            factory_id, production_batch_id, raw_material_id, quantity, unit_name
        ) VALUES (
            p_factory_id, v_batch_id, (v_item->>'raw_material_id')::UUID, (v_item->>'quantity')::NUMERIC, COALESCE(v_item->>'unit_name', 'Ton')
        );

        INSERT INTO raw_material_stock_transactions (
            factory_id, raw_material_id, transaction_type, quantity,
            reference_type, reference_id, transaction_date, notes, created_by
        ) VALUES (
            p_factory_id, (v_item->>'raw_material_id')::UUID, 'production_consumption',
            -ABS((v_item->>'quantity')::NUMERIC), 'production_batch', v_batch_id,
            p_production_date, format('Batch %s (%s Pcs %s)', p_batch_code, p_output_quantity, v_prod_name), v_user_id
        );
    END LOOP;

    -- 5. Add Finished Goods Stock (Output Quantity)
    IF p_output_quantity > 0 THEN
        INSERT INTO finished_stock_transactions (
            factory_id, product_id, batch_id, batch_code,
            transaction_type, quantity, reference_type, reference_id,
            transaction_date, notes, created_by
        ) VALUES (
            p_factory_id, p_product_id, v_batch_id, p_batch_code,
            'production', p_output_quantity, 'production_batch', v_batch_id,
            p_production_date, format('Production Batch %s', p_batch_code), v_user_id
        );
    END IF;

    -- Record damage stock transaction if damaged > 0
    IF p_damaged_quantity > 0 THEN
        INSERT INTO finished_stock_transactions (
            factory_id, product_id, batch_id, batch_code,
            transaction_type, quantity, reference_type, reference_id,
            transaction_date, notes, created_by
        ) VALUES (
            p_factory_id, p_product_id, v_batch_id, p_batch_code,
            'damage', -ABS(p_damaged_quantity), 'damage_report', v_batch_id,
            p_production_date, format('Breakage in batch %s', p_batch_code), v_user_id
        );
    END IF;

    -- 6. Record Production Workers
    IF p_workers IS NOT NULL AND jsonb_array_length(p_workers) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_workers)
        LOOP
            INSERT INTO production_workers (
                factory_id, production_batch_id, employee_id, role, hours_worked
            ) VALUES (
                p_factory_id, v_batch_id, 
                NULLIF(v_item->>'employee_id', '')::UUID,
                COALESCE(v_item->>'role', 'Machine Worker'),
                COALESCE((v_item->>'hours_worked')::NUMERIC, 8.00)
            );
        END LOOP;
    END IF;

    -- 7. Audit Log
    INSERT INTO audit_logs (
        factory_id, user_id, user_name, action, module, record_id, record_title, details
    ) VALUES (
        p_factory_id, v_user_id, v_user_name, 'CREATE', 'PRODUCTION',
        v_batch_id::TEXT, format('Batch %s', p_batch_code),
        format('Produced %s units of %s with %s damaged', p_output_quantity, v_prod_name, p_damaged_quantity)
    );

    RETURN jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'batch_id', v_batch_id,
            'batch_code', p_batch_code,
            'output_quantity', p_output_quantity
        ),
        'message', 'Production batch logged and stock updated successfully.'
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. COMPLETE SALE TRANSACTION (ATOMIC)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION complete_sale(
    p_factory_id UUID,
    p_customer_id UUID,
    p_sale_date DATE,
    p_items JSONB, -- Array of { product_id: UUID, batch_id?: UUID, batch_code?: VARCHAR, quantity: INT, rate: NUMERIC, discount?: NUMERIC, tax_percent?: NUMERIC }
    p_delivery_details JSONB, -- { vehicle_number, driver_name, driver_phone, destination_address }
    p_paid_amount NUMERIC DEFAULT 0.00,
    p_payment_mode payment_mode DEFAULT 'upi',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_user_name VARCHAR;
    v_sale_id UUID;
    v_invoice_id UUID;
    v_invoice_num VARCHAR;
    v_cust RECORD;
    v_item JSONB;
    v_prod RECORD;
    v_curr_stock INT;
    v_subtotal NUMERIC(12, 2) := 0.00;
    v_discount_total NUMERIC(12, 2) := 0.00;
    v_tax_total NUMERIC(12, 2) := 0.00;
    v_grand_total NUMERIC(12, 2) := 0.00;
    v_item_amt NUMERIC(12, 2);
    v_item_tax NUMERIC(12, 2);
    v_item_qty INT;
    v_item_rate NUMERIC(12, 2);
    v_item_disc NUMERIC(12, 2);
    v_item_tax_pct NUMERIC(5, 2);
    v_pay_status payment_status;
    v_is_interstate BOOLEAN;
    v_cgst NUMERIC(12, 2);
    v_sgst NUMERIC(12, 2);
    v_igst NUMERIC(12, 2);
BEGIN
    -- 1. Authorization check
    IF NOT has_factory_access(p_factory_id) THEN
        RETURN jsonb_build_object('success', false, 'error', jsonb_build_object('code', 'UNAUTHORIZED', 'message', 'Unauthorized.'));
    END IF;

    SELECT p.id, p.full_name INTO v_user_id, v_user_name
    FROM profiles p WHERE p.auth_user_id = auth.uid();

    SELECT * INTO v_cust FROM customers WHERE id = p_customer_id AND factory_id = p_factory_id;
    IF v_cust.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', jsonb_build_object('code', 'CUSTOMER_NOT_FOUND', 'message', 'Customer not found.'));
    END IF;

    -- 2. Validate Finished Stock Availability
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_item_qty := (v_item->>'quantity')::INT;
        SELECT * INTO v_prod FROM products WHERE id = (v_item->>'product_id')::UUID AND factory_id = p_factory_id;
        
        IF v_prod.id IS NULL THEN
            RETURN jsonb_build_object('success', false, 'error', jsonb_build_object('code', 'PRODUCT_NOT_FOUND', 'message', 'Product in sale items not found.'));
        END IF;

        v_curr_stock := get_finished_stock(p_factory_id, v_prod.id);
        IF v_curr_stock < v_item_qty THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', jsonb_build_object(
                    'code', 'INSUFFICIENT_STOCK',
                    'message', format('Insufficient stock for %s. Available: %s, Requested: %s', v_prod.name, v_curr_stock, v_item_qty)
                )
            );
        END IF;

        v_item_rate := (v_item->>'rate')::NUMERIC;
        v_item_disc := COALESCE((v_item->>'discount')::NUMERIC, 0.00);
        v_item_tax_pct := COALESCE((v_item->>'tax_percent')::NUMERIC, 12.00);
        v_item_amt := (v_item_qty * v_item_rate) - v_item_disc;
        v_item_tax := (v_item_amt * v_item_tax_pct) / 100.0;

        v_subtotal := v_subtotal + (v_item_qty * v_item_rate);
        v_discount_total := v_discount_total + v_item_disc;
        v_tax_total := v_tax_total + v_item_tax;
    END LOOP;

    v_grand_total := (v_subtotal - v_discount_total) + v_tax_total;
    p_paid_amount := LEAST(COALESCE(p_paid_amount, 0.00), v_grand_total);
    
    IF p_paid_amount >= v_grand_total THEN
        v_pay_status := 'paid';
    ELSIF p_paid_amount > 0 THEN
        v_pay_status := 'partial';
    ELSE
        v_pay_status := 'pending';
    END IF;

    v_invoice_num := generate_invoice_number(p_factory_id);

    -- 3. Insert Sale
    INSERT INTO sales (
        factory_id, customer_id, invoice_number, sale_date,
        subtotal, discount, tax, grand_total, paid_amount,
        payment_status, delivery_details, notes, created_by
    ) VALUES (
        p_factory_id, p_customer_id, v_invoice_num, p_sale_date,
        v_subtotal, v_discount_total, v_tax_total, v_grand_total, p_paid_amount,
        v_pay_status, COALESCE(p_delivery_details, '{}'::JSONB), p_notes, v_user_id
    ) RETURNING id INTO v_sale_id;

    -- 4. Insert Sale Items & Deduct Finished Stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_item_qty := (v_item->>'quantity')::INT;
        v_item_rate := (v_item->>'rate')::NUMERIC;
        v_item_disc := COALESCE((v_item->>'discount')::NUMERIC, 0.00);
        v_item_tax_pct := COALESCE((v_item->>'tax_percent')::NUMERIC, 12.00);
        v_item_amt := (v_item_qty * v_item_rate) - v_item_disc;

        SELECT * INTO v_prod FROM products WHERE id = (v_item->>'product_id')::UUID;

        INSERT INTO sale_items (
            sale_id, product_id, batch_id, batch_code,
            quantity, unit_name, rate, discount, tax_percent, amount
        ) VALUES (
            v_sale_id, v_prod.id, 
            NULLIF(v_item->>'batch_id', '')::UUID,
            v_item->>'batch_code',
            v_item_qty, v_prod.unit_name, v_item_rate, v_item_disc, v_item_tax_pct, v_item_amt
        );

        INSERT INTO finished_stock_transactions (
            factory_id, product_id, batch_id, batch_code,
            transaction_type, quantity, reference_type, reference_id,
            transaction_date, notes, created_by
        ) VALUES (
            p_factory_id, v_prod.id, NULLIF(v_item->>'batch_id', '')::UUID, v_item->>'batch_code',
            'sale', -ABS(v_item_qty), 'sales_order', v_sale_id,
            p_sale_date, format('Sale Dispatch to %s (Inv #%s)', v_cust.name, v_invoice_num), v_user_id
        );
    END LOOP;

    -- 5. Generate Tax Invoice
    v_is_interstate := (v_cust.gst_number IS NOT NULL AND NOT v_cust.gst_number LIKE '27%'); -- 27 = Maharashtra default
    IF v_is_interstate THEN
        v_cgst := 0.00;
        v_sgst := 0.00;
        v_igst := v_tax_total;
    ELSE
        v_cgst := v_tax_total / 2.0;
        v_sgst := v_tax_total / 2.0;
        v_igst := 0.00;
    END IF;

    INSERT INTO invoices (
        factory_id, sale_id, invoice_number, invoice_date, due_date,
        customer_snapshot, items_snapshot, subtotal, discount,
        taxable_amount, cgst, sgst, igst, grand_total,
        paid_amount, pending_amount, status, vehicle_number
    ) VALUES (
        p_factory_id, v_sale_id, v_invoice_num, p_sale_date, p_sale_date + INTERVAL '15 days',
        to_jsonb(v_cust), p_items, v_subtotal, v_discount_total,
        (v_subtotal - v_discount_total), v_cgst, v_sgst, v_igst, v_grand_total,
        p_paid_amount, (v_grand_total - p_paid_amount), v_pay_status,
        p_delivery_details->>'vehicle_number'
    ) RETURNING id INTO v_invoice_id;

    -- 6. Record Double-Entry Ledger for Sale (Receivable Debit)
    INSERT INTO ledger_entries (
        factory_id, entry_date, entry_type, reference_type, reference_id,
        party_type, party_id, party_name, debit, credit, description, created_by
    ) VALUES (
        p_factory_id, p_sale_date, 'sale', 'sale', v_sale_id,
        'customer', v_cust.id, v_cust.name, v_grand_total, 0.00,
        format('Sale Invoice #%s - Dispatch to %s', v_invoice_num, v_cust.name), v_user_id
    );

    -- 7. Record Payment Receipt if paid_amount > 0
    IF p_paid_amount > 0 THEN
        INSERT INTO customer_payments (
            factory_id, customer_id, sale_id, amount, payment_date,
            payment_mode, reference, invoice_ref, created_by
        ) VALUES (
            p_factory_id, v_cust.id, v_sale_id, p_paid_amount, p_sale_date,
            p_payment_mode, format('Advance/Receipt for %s', v_invoice_num), v_invoice_num, v_user_id
        );

        INSERT INTO ledger_entries (
            factory_id, entry_date, entry_type, reference_type, reference_id,
            party_type, party_id, party_name, debit, credit, description, created_by
        ) VALUES (
            p_factory_id, p_sale_date, 'customer_payment', 'sale', v_sale_id,
            'customer', v_cust.id, v_cust.name, 0.00, p_paid_amount,
            format('Payment received for Invoice #%s via %s', v_invoice_num, p_payment_mode), v_user_id
        );
    END IF;

    -- 8. Audit Log
    INSERT INTO audit_logs (
        factory_id, user_id, user_name, action, module, record_id, record_title, details
    ) VALUES (
        p_factory_id, v_user_id, v_user_name, 'CREATE', 'SALES',
        v_sale_id::TEXT, format('Invoice %s', v_invoice_num),
        format('Sale of ₹%s dispatched to %s with paid amount ₹%s', v_grand_total, v_cust.name, p_paid_amount)
    );

    RETURN jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'sale_id', v_sale_id,
            'invoice_id', v_invoice_id,
            'invoice_number', v_invoice_num,
            'grand_total', v_grand_total,
            'paid_amount', p_paid_amount,
            'pending_amount', (v_grand_total - p_paid_amount)
        ),
        'message', 'Sale dispatched and invoice generated successfully.'
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- 5. RECORD CUSTOMER PAYMENT FUNCTION
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION record_customer_payment(
    p_factory_id UUID,
    p_customer_id UUID,
    p_sale_id UUID DEFAULT NULL,
    p_amount NUMERIC DEFAULT 0.00,
    p_payment_date DATE DEFAULT CURRENT_DATE,
    p_payment_mode payment_mode DEFAULT 'upi',
    p_reference VARCHAR DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_user_name VARCHAR;
    v_cust RECORD;
    v_pay_id UUID;
    v_inv_ref VARCHAR := NULL;
    v_sale RECORD;
BEGIN
    IF NOT has_factory_access(p_factory_id) THEN
        RETURN jsonb_build_object('success', false, 'error', jsonb_build_object('code', 'UNAUTHORIZED', 'message', 'Unauthorized.'));
    END IF;

    SELECT p.id, p.full_name INTO v_user_id, v_user_name FROM profiles p WHERE p.auth_user_id = auth.uid();
    SELECT * INTO v_cust FROM customers WHERE id = p_customer_id AND factory_id = p_factory_id;

    IF v_cust.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', jsonb_build_object('code', 'CUSTOMER_NOT_FOUND', 'message', 'Customer not found.'));
    END IF;

    IF p_sale_id IS NOT NULL THEN
        SELECT * INTO v_sale FROM sales WHERE id = p_sale_id AND factory_id = p_factory_id;
        IF v_sale.id IS NOT NULL THEN
            v_inv_ref := v_sale.invoice_number;
            -- Update sale paid amount
            UPDATE sales 
            SET paid_amount = LEAST(paid_amount + p_amount, grand_total),
                payment_status = CASE 
                    WHEN paid_amount + p_amount >= grand_total THEN 'paid'::payment_status
                    ELSE 'partial'::payment_status
                END
            WHERE id = p_sale_id;

            -- Update invoice
            UPDATE invoices
            SET paid_amount = LEAST(paid_amount + p_amount, grand_total),
                pending_amount = GREATEST(0, grand_total - (paid_amount + p_amount)),
                status = CASE 
                    WHEN paid_amount + p_amount >= grand_total THEN 'paid'::payment_status
                    ELSE 'partial'::payment_status
                END
            WHERE sale_id = p_sale_id;
        END IF;
    END IF;

    -- Insert payment record
    INSERT INTO customer_payments (
        factory_id, customer_id, sale_id, amount, payment_date,
        payment_mode, reference, invoice_ref, notes, created_by
    ) VALUES (
        p_factory_id, p_customer_id, p_sale_id, p_amount, p_payment_date,
        p_payment_mode, p_reference, v_inv_ref, p_notes, v_user_id
    ) RETURNING id INTO v_pay_id;

    -- Record Ledger Credit
    INSERT INTO ledger_entries (
        factory_id, entry_date, entry_type, reference_type, reference_id,
        party_type, party_id, party_name, debit, credit, description, created_by
    ) VALUES (
        p_factory_id, p_payment_date, 'customer_payment', 'customer_payment', v_pay_id,
        'customer', v_cust.id, v_cust.name, 0.00, p_amount,
        format('Payment receipt of ₹%s from %s via %s', p_amount, v_cust.name, p_payment_mode), v_user_id
    );

    -- Audit Log
    INSERT INTO audit_logs (
        factory_id, user_id, user_name, action, module, record_id, record_title, details
    ) VALUES (
        p_factory_id, v_user_id, v_user_name, 'PAYMENT', 'PAYMENTS',
        v_pay_id::TEXT, format('Payment from %s', v_cust.name),
        format('Received ₹%s via %s (Ref: %s)', p_amount, p_payment_mode, p_reference)
    );

    RETURN jsonb_build_object(
        'success', true,
        'data', jsonb_build_object('payment_id', v_pay_id, 'amount', p_amount),
        'message', 'Customer payment recorded successfully.'
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- 6. RECORD VENDOR PAYMENT FUNCTION
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION record_vendor_payment(
    p_factory_id UUID,
    p_vendor_id UUID,
    p_purchase_id UUID DEFAULT NULL,
    p_amount NUMERIC DEFAULT 0.00,
    p_payment_date DATE DEFAULT CURRENT_DATE,
    p_payment_mode payment_mode DEFAULT 'bank_transfer',
    p_reference VARCHAR DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_user_name VARCHAR;
    v_vendor RECORD;
    v_pay_id UUID;
BEGIN
    IF NOT has_factory_access(p_factory_id) THEN
        RETURN jsonb_build_object('success', false, 'error', jsonb_build_object('code', 'UNAUTHORIZED', 'message', 'Unauthorized.'));
    END IF;

    SELECT p.id, p.full_name INTO v_user_id, v_user_name FROM profiles p WHERE p.auth_user_id = auth.uid();
    SELECT * INTO v_vendor FROM vendors WHERE id = p_vendor_id AND factory_id = p_factory_id;

    IF v_vendor.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', jsonb_build_object('code', 'VENDOR_NOT_FOUND', 'message', 'Vendor not found.'));
    END IF;

    IF p_purchase_id IS NOT NULL THEN
        UPDATE raw_material_purchases
        SET paid_amount = LEAST(paid_amount + p_amount, total_amount),
            payment_status = CASE 
                WHEN paid_amount + p_amount >= total_amount THEN 'paid'::payment_status
                ELSE 'partial'::payment_status
            END,
            payment_date = p_payment_date
        WHERE id = p_purchase_id;
    END IF;

    INSERT INTO vendor_payments (
        factory_id, vendor_id, purchase_id, amount, payment_date,
        payment_mode, reference, notes, created_by
    ) VALUES (
        p_factory_id, p_vendor_id, p_purchase_id, p_amount, p_payment_date,
        p_payment_mode, p_reference, p_notes, v_user_id
    ) RETURNING id INTO v_pay_id;

    -- Record Ledger Debit
    INSERT INTO ledger_entries (
        factory_id, entry_date, entry_type, reference_type, reference_id,
        party_type, party_id, party_name, debit, credit, description, created_by
    ) VALUES (
        p_factory_id, p_payment_date, 'vendor_payment', 'vendor_payment', v_pay_id,
        'vendor', v_vendor.id, v_vendor.name, p_amount, 0.00,
        format('Payment disbursement of ₹%s to %s via %s', p_amount, v_vendor.name, p_payment_mode), v_user_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'data', jsonb_build_object('payment_id', v_pay_id, 'amount', p_amount),
        'message', 'Vendor payment recorded successfully.'
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- 7. FACTORY REGISTRATION FUNCTION (ATOMIC ONBOARDING)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION register_factory(
    p_auth_user_id UUID,
    p_full_name VARCHAR,
    p_email VARCHAR,
    p_phone VARCHAR,
    p_factory_name VARCHAR,
    p_factory_code VARCHAR,
    p_factory_type VARCHAR DEFAULT 'Fly Ash Brick',
    p_city VARCHAR DEFAULT 'Pune',
    p_state VARCHAR DEFAULT 'Maharashtra',
    p_address VARCHAR DEFAULT 'Industrial Area',
    p_pincode VARCHAR DEFAULT '411001',
    p_gst_number VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id UUID;
    v_factory_id UUID;
    v_code VARCHAR;
BEGIN
    -- 1. Create or update profile
    INSERT INTO profiles (auth_user_id, full_name, email, phone, role, status)
    VALUES (p_auth_user_id, p_full_name, p_email, p_phone, 'factory_owner', 'active')
    ON CONFLICT (email) DO UPDATE 
    SET auth_user_id = EXCLUDED.auth_user_id, full_name = EXCLUDED.full_name, phone = EXCLUDED.phone
    RETURNING id INTO v_profile_id;

    -- 2. Generate unique factory code if not provided
    v_code := COALESCE(p_factory_code, 'FAC-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)));

    -- 3. Create Factory
    INSERT INTO factories (
        name, code, owner_id, phone, email, address, city, state,
        pincode, gst_number, factory_type, status
    ) VALUES (
        p_factory_name, v_code, v_profile_id, p_phone, p_email,
        p_address, p_city, p_state, p_pincode, p_gst_number, p_factory_type, 'active'
    ) RETURNING id INTO v_factory_id;

    -- 4. Create Factory User Membership
    INSERT INTO factory_users (factory_id, user_id, role, status)
    VALUES (v_factory_id, v_profile_id, 'factory_owner', 'active');

    -- 5. Create 14-Day Free Trial Subscription
    INSERT INTO subscriptions (
        factory_id, plan_id, start_date, end_date, status, amount
    ) VALUES (
        v_factory_id, 'plan_trial', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', 'trial', 0.00
    );

    -- 6. Initialize Onboarding State
    INSERT INTO factory_onboarding (
        factory_id, step, completed_steps, is_completed
    ) VALUES (
        v_factory_id, 'products', '["profile"]'::JSONB, FALSE
    );

    -- 7. Create Standard Default Units for Factory
    INSERT INTO units (factory_id, name, code, symbol, is_standard)
    VALUES 
        (v_factory_id, 'Pieces', 'pcs', 'Pcs', TRUE),
        (v_factory_id, 'Metric Ton', 'ton', 'Ton', TRUE),
        (v_factory_id, 'Bags', 'bags', 'Bags', TRUE),
        (v_factory_id, 'Brass', 'brass', 'Brass', TRUE),
        (v_factory_id, 'Truck Load', 'truck', 'Truck', TRUE),
        (v_factory_id, 'Cubic Meter', 'cum', 'Cu.M', TRUE);

    -- 8. Audit Log
    INSERT INTO audit_logs (
        factory_id, user_id, user_name, action, module, record_id, record_title, details
    ) VALUES (
        v_factory_id, v_profile_id, p_full_name, 'CREATE', 'FACTORY',
        v_factory_id::TEXT, p_factory_name, 'Factory registered with 14-day Free Trial'
    );

    RETURN jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'factory_id', v_factory_id,
            'factory_code', v_code,
            'user_id', v_profile_id
        ),
        'message', 'Factory created and onboarded successfully.'
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- 8. LOW STOCK NOTIFICATION TRIGGER
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_on_low_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_curr_stock NUMERIC;
    v_min_stock NUMERIC;
    v_name VARCHAR;
BEGIN
    IF TG_TABLE_NAME = 'raw_material_stock_transactions' THEN
        SELECT name, minimum_stock INTO v_name, v_min_stock FROM raw_materials WHERE id = NEW.raw_material_id;
        v_curr_stock := get_raw_material_stock(NEW.factory_id, NEW.raw_material_id);
        
        IF v_curr_stock <= v_min_stock THEN
            INSERT INTO notifications (
                factory_id, type, title, message, severity, reference_type, reference_id
            ) VALUES (
                NEW.factory_id, 'low_stock',
                format('Low Stock: %s', v_name),
                format('Current stock of %s is %s (Min threshold: %s). Order replenishment from vendor.', v_name, v_curr_stock, v_min_stock),
                'warning', 'raw_material', NEW.raw_material_id
            );
        END IF;
    ELSIF TG_TABLE_NAME = 'finished_stock_transactions' THEN
        SELECT name, minimum_stock INTO v_name, v_min_stock FROM products WHERE id = NEW.product_id;
        v_curr_stock := get_finished_stock(NEW.factory_id, NEW.product_id);
        
        IF v_curr_stock <= v_min_stock THEN
            INSERT INTO notifications (
                factory_id, type, title, message, severity, reference_type, reference_id
            ) VALUES (
                NEW.factory_id, 'low_stock',
                format('Low Finished Stock: %s', v_name),
                format('Finished stock of %s is down to %s units (Threshold: %s units). Schedule production batch.', v_name, v_curr_stock, v_min_stock),
                'warning', 'product', NEW.product_id
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_rm_low_stock ON raw_material_stock_transactions;
CREATE TRIGGER trg_notify_rm_low_stock
    AFTER INSERT ON raw_material_stock_transactions
    FOR EACH ROW EXECUTE FUNCTION notify_on_low_stock();

DROP TRIGGER IF EXISTS trg_notify_finished_low_stock ON finished_stock_transactions;
CREATE TRIGGER trg_notify_finished_low_stock
    AFTER INSERT ON finished_stock_transactions
    FOR EACH ROW EXECUTE FUNCTION notify_on_low_stock();
