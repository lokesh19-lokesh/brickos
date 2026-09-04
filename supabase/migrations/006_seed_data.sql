-- =============================================================================
-- BRICKFLOW ERP - 006_seed_data.sql
-- Default SaaS Plans, Global Units, Categories, & Demo Indian Plant Data
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SAAS SUBSCRIPTION PLANS
-- -----------------------------------------------------------------------------

INSERT INTO subscription_plans (id, name, price, billing_period, max_users, max_monthly_production, is_popular, features, status)
VALUES
    (
        'plan_trial',
        'Free Trial',
        0.00,
        'monthly',
        2,
        '50,000 Bricks',
        FALSE,
        '["Single Factory Setup", "Raw Material & Stock Tracking", "Basic Sales & Invoicing", "14-Day Full Access"]'::JSONB,
        'active'
    ),
    (
        'plan_basic',
        'Basic Plant',
        2499.00,
        'monthly',
        5,
        '2,50,000 Bricks',
        FALSE,
        '["Single Machine/Kiln Line", "Raw Material Purchases", "Stock & Inventory Ledger", "Daily Attendance & Labour Wages", "GST Invoicing & PDF Print", "WhatsApp Order Sharing", "Standard Reports"]'::JSONB,
        'active'
    ),
    (
        'plan_standard',
        'Standard Pro',
        4999.00,
        'monthly',
        15,
        '10,00,000 Bricks',
        TRUE,
        '["Multi-Machine & Multi-Kiln Chambers", "Automated Stock Balancing", "Piece-Rate & Daily Wage Payroll", "Customer Receivables & Aging", "Vendor Payables & Purchase Ledgers", "Advanced P&L and Cost Per Brick Analysis", "SMS/WhatsApp Payment Reminders", "Audit Logs & User Roles"]'::JSONB,
        'active'
    ),
    (
        'plan_enterprise',
        'Enterprise Multi-Plant',
        9999.00,
        'monthly',
        50,
        'Unlimited Bricks',
        FALSE,
        '["Multi-Factory Operations", "Dedicated Account Manager", "Custom ERP Integrations", "Weighbridge Automation Ready", "Priority 24/7 Phone Support", "Automated Daily Backup & Cloud Archival"]'::JSONB,
        'active'
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    billing_period = EXCLUDED.billing_period,
    max_users = EXCLUDED.max_users,
    max_monthly_production = EXCLUDED.max_monthly_production,
    is_popular = EXCLUDED.is_popular,
    features = EXCLUDED.features;

-- -----------------------------------------------------------------------------
-- 2. GLOBAL STANDARD UNITS
-- -----------------------------------------------------------------------------

INSERT INTO units (factory_id, name, code, symbol, is_standard)
VALUES
    (NULL, 'Pieces / Nos', 'pcs', 'Pcs', TRUE),
    (NULL, 'Metric Ton', 'ton', 'Ton', TRUE),
    (NULL, 'Cement Bags (50kg)', 'bags', 'Bags', TRUE),
    (NULL, 'Brass (100 cu.ft)', 'brass', 'Brass', TRUE),
    (NULL, 'Cubic Meter', 'cum', 'Cu.M', TRUE),
    (NULL, 'Kilogram', 'kg', 'Kg', TRUE),
    (NULL, 'Liters', 'ltr', 'Ltr', TRUE),
    (NULL, 'Truck Load', 'truck', 'Truck', TRUE)
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. GLOBAL EXPENSE CATEGORIES
-- -----------------------------------------------------------------------------

INSERT INTO expense_categories (factory_id, name, status)
VALUES
    (NULL, 'Diesel & Generator Fuel', 'active'),
    (NULL, 'Electricity & Power Bills', 'active'),
    (NULL, 'Machine Repair & Spares', 'active'),
    (NULL, 'Vehicle Maintenance & Tyres', 'active'),
    (NULL, 'Transport & Freight Charges', 'active'),
    (NULL, 'Kiln Fuel / Firewood / Coal', 'active'),
    (NULL, 'Labour Food & Mess Expenses', 'active'),
    (NULL, 'Office & Administrative', 'active'),
    (NULL, 'Miscellaneous & Petty Cash', 'active')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. SEED DEMO FACTORY & OWNER
-- -----------------------------------------------------------------------------

DO $$
DECLARE
    v_profile_id UUID := '00000000-0000-0000-0000-000000000001';
    v_factory_id UUID := '00000000-0000-0000-0000-000000000002';
    v_p1_id UUID := '10000000-0000-0000-0000-000000000001';
    v_p2_id UUID := '10000000-0000-0000-0000-000000000002';
    v_p3_id UUID := '10000000-0000-0000-0000-000000000003';
    v_p4_id UUID := '10000000-0000-0000-0000-000000000004';
    v_rm1_id UUID := '20000000-0000-0000-0000-000000000001';
    v_rm2_id UUID := '20000000-0000-0000-0000-000000000002';
    v_rm3_id UUID := '20000000-0000-0000-0000-000000000003';
    v_rm4_id UUID := '20000000-0000-0000-0000-000000000004';
    v_c1_id UUID := '30000000-0000-0000-0000-000000000001';
    v_c2_id UUID := '30000000-0000-0000-0000-000000000002';
    v_v1_id UUID := '40000000-0000-0000-0000-000000000001';
    v_v2_id UUID := '40000000-0000-0000-0000-000000000002';
    v_emp1_id UUID := '50000000-0000-0000-0000-000000000001';
    v_emp2_id UUID := '50000000-0000-0000-0000-000000000002';
    v_emp3_id UUID := '50000000-0000-0000-0000-000000000003';
    v_batch_id UUID := '60000000-0000-0000-0000-000000000001';
    v_sale_id UUID := '70000000-0000-0000-0000-000000000001';
BEGIN
    -- 1. Demo User Profile
    INSERT INTO profiles (id, full_name, email, phone, role, status)
    VALUES (v_profile_id, 'Rajesh Sharma', 'info@shreerambricks.com', '+91 85006 93113', 'factory_owner', 'active')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Demo Factory
    INSERT INTO factories (
        id, name, code, owner_id, phone, email, address, city, state, pincode,
        gst_number, factory_type, employee_count, daily_capacity, main_products, is_demo,
        bank_details, status
    ) VALUES (
        v_factory_id, 'Shree Ram Brick Industries', 'SRB-01', v_profile_id, '+91 85006 93113',
        'info@shreerambricks.com', 'Plot 45-B, Industrial Estate, Hadapsar', 'Pune', 'Maharashtra', '411028',
        '27AABCS1429B1Z8', 'Fly Ash Brick', '25-50 Workers', '35,000 Bricks / Day',
        '["4 Inch Fly Ash Brick", "6 Inch Fly Ash Brick", "8 Inch Hollow Block", "Paver Blocks"]'::JSONB,
        TRUE,
        '{"bankName": "HDFC Bank Ltd", "accountNumber": "50200084729112", "ifscCode": "HDFC0001824", "branch": "Hadapsar Pune", "upiId": "shreerambricks@hdfcbank"}'::JSONB,
        'active'
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Factory User Membership
    INSERT INTO factory_users (factory_id, user_id, role, status)
    VALUES (v_factory_id, v_profile_id, 'factory_owner', 'active')
    ON CONFLICT DO NOTHING;

    -- 4. Subscription
    INSERT INTO subscriptions (factory_id, plan_id, start_date, end_date, status, amount)
    VALUES (v_factory_id, 'plan_standard', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days', 'active', 4999.00)
    ON CONFLICT DO NOTHING;

    -- 5. Onboarding Completed
    INSERT INTO factory_onboarding (factory_id, step, completed_steps, is_completed)
    VALUES (v_factory_id, 'done', '["profile", "products", "raw_materials", "employees", "vendors", "customers"]'::JSONB, TRUE)
    ON CONFLICT (factory_id) DO NOTHING;

    -- 6. Products
    INSERT INTO products (id, factory_id, name, code, category, unit_name, hsn_code, selling_price, cost_price, minimum_stock, dimensions, status)
    VALUES 
        (v_p1_id, v_factory_id, '4 Inch Fly Ash Brick', 'FAB-4IN', 'Fly Ash Brick', 'Pcs', '681599', 4.80, 3.40, 15000, '9 x 4 x 3 inch', 'active'),
        (v_p2_id, v_factory_id, '6 Inch Fly Ash Brick', 'FAB-6IN', 'Fly Ash Brick', 'Pcs', '681599', 6.50, 4.60, 10000, '9 x 6 x 3 inch', 'active'),
        (v_p3_id, v_factory_id, '8 Inch Hollow Concrete Block', 'BLK-8IN', 'Hollow Block', 'Pcs', '681599', 32.00, 22.50, 5000, '16 x 8 x 8 inch', 'active'),
        (v_p4_id, v_factory_id, 'Heavy Duty Zig-Zag Paver Block', 'PVR-80MM', 'Paver Block', 'Pcs', '681599', 18.00, 12.00, 8000, '80mm Thickness (M-40 Grade)', 'active')
    ON CONFLICT (id) DO NOTHING;

    -- 7. Raw Materials
    INSERT INTO raw_materials (id, factory_id, name, code, unit_name, minimum_stock, average_unit_cost, status)
    VALUES
        (v_rm1_id, v_factory_id, 'NTPC Thermal Power Fly Ash', 'RM-FLYASH', 'Ton', 50.00, 450.00, 'active'),
        (v_rm2_id, v_factory_id, 'Ultratech 53-Grade OPC Cement', 'RM-CEMENT', 'Bags', 100.00, 360.00, 'active'),
        (v_rm3_id, v_factory_id, '0-10mm Washed Quarry Stone Dust', 'RM-DUST', 'Brass', 15.00, 2800.00, 'active'),
        (v_rm4_id, v_factory_id, 'Hydrated Chemical Gypsum', 'RM-GYPSUM', 'Ton', 8.00, 1200.00, 'active')
    ON CONFLICT (id) DO NOTHING;

    -- 8. Initial Raw Material Stock Transactions
    INSERT INTO raw_material_stock_transactions (factory_id, raw_material_id, transaction_type, quantity, reference_type, transaction_date, notes)
    VALUES
        (v_factory_id, v_rm1_id, 'stock_in', 120.00, 'opening_balance', CURRENT_DATE - INTERVAL '15 days', 'Opening Yard Inventory'),
        (v_factory_id, v_rm2_id, 'stock_in', 350.00, 'opening_balance', CURRENT_DATE - INTERVAL '15 days', 'Opening Warehouse Cement Bags'),
        (v_factory_id, v_rm3_id, 'stock_in', 45.00, 'opening_balance', CURRENT_DATE - INTERVAL '15 days', 'Crushed Dust Pit Opening Stock'),
        (v_factory_id, v_rm4_id, 'stock_in', 25.00, 'opening_balance', CURRENT_DATE - INTERVAL '15 days', 'Gypsum Silo Opening Stock')
    ON CONFLICT DO NOTHING;

    -- 9. Initial Finished Goods Stock Transactions
    INSERT INTO finished_stock_transactions (factory_id, product_id, batch_code, transaction_type, quantity, reference_type, transaction_date, notes)
    VALUES
        (v_factory_id, v_p1_id, 'INIT-STOCK', 'stock_in', 48500, 'opening_balance', CURRENT_DATE - INTERVAL '10 days', 'Curing Yard Stack A'),
        (v_factory_id, v_p2_id, 'INIT-STOCK', 'stock_in', 24000, 'opening_balance', CURRENT_DATE - INTERVAL '10 days', 'Curing Yard Stack B'),
        (v_factory_id, v_p3_id, 'INIT-STOCK', 'stock_in', 6200, 'opening_balance', CURRENT_DATE - INTERVAL '10 days', 'Concrete Block Yard'),
        (v_factory_id, v_p4_id, 'INIT-STOCK', 'stock_in', 14500, 'opening_balance', CURRENT_DATE - INTERVAL '10 days', 'Paver Tiles Stack')
    ON CONFLICT DO NOTHING;

    -- 10. Customers
    INSERT INTO customers (id, factory_id, name, company_name, phone, whatsapp, email, address, city, state, gst_number, credit_limit, opening_balance, status)
    VALUES
        (v_c1_id, v_factory_id, 'Mahesh Shinde', 'L&T Infrastructure Projects Ltd', '+91 98220 11223', '+91 98220 11223', 'purchase@ltinfra.com', 'Site Office, Amanora Town Centre', 'Pune', 'Maharashtra', '27AAACL1428A1ZG', 500000.00, 45000.00, 'active'),
        (v_c2_id, v_factory_id, 'Suresh Patil', 'Rohan Builders & Developers', '+91 94225 66778', '+91 94225 66778', 'suresh@rohanbuilders.in', 'Plot 12, Senapati Bapat Road', 'Pune', 'Maharashtra', '27AABCR8819Q1ZP', 300000.00, 0.00, 'active')
    ON CONFLICT (id) DO NOTHING;

    -- 11. Vendors
    INSERT INTO vendors (id, factory_id, name, company_name, phone, whatsapp, email, address, city, state, gst_number, materials_supplied, opening_balance, status)
    VALUES
        (v_v1_id, v_factory_id, 'Anand Deshmukh', 'Deccan Fly Ash Logistics', '+91 98230 44556', '+91 98230 44556', 'sales@deccanflyash.com', 'MIDC Kurkumbh Daund', 'Pune', 'Maharashtra', '27AABBD9912K1ZX', '["NTPC Thermal Power Fly Ash"]'::JSONB, 0.00, 'active'),
        (v_v2_id, v_factory_id, 'Sunil Kulkarni', 'Maha Cement Corporation', '+91 97654 33221', '+91 97654 33221', 'sunil@mahacement.com', 'Market Yard Gultekdi', 'Pune', 'Maharashtra', '27AABBM1122L1ZY', '["Ultratech 53-Grade OPC Cement"]'::JSONB, 25000.00, 'active')
    ON CONFLICT (id) DO NOTHING;

    -- 12. Employees
    INSERT INTO employees (id, factory_id, employee_code, name, phone, address, joining_date, job_type, wage_type, daily_wage, piece_rate_per_thousand, status)
    VALUES
        (v_emp1_id, v_factory_id, 'EMP-01', 'Kailash Yadav', '+91 98221 44551', 'Labour Camp, Hadapsar', '2025-02-01', 'Supervisor', 'daily', 850.00, 0.00, 'active'),
        (v_emp2_id, v_factory_id, 'EMP-02', 'Babanrao Shinde', '+91 98221 44552', 'Labour Camp, Hadapsar', '2025-02-01', 'Machine Operator', 'daily', 650.00, 0.00, 'active'),
        (v_emp3_id, v_factory_id, 'EMP-03', 'Ramesh Pawar', '+91 98221 44553', 'Labour Camp, Hadapsar', '2025-02-01', 'Mould Worker', 'piece_rate', 0.00, 350.00, 'active')
    ON CONFLICT (id) DO NOTHING;

    -- 13. Production Batch
    INSERT INTO production_batches (
        id, factory_id, batch_code, production_date, product_id, target_quantity, output_quantity, damaged_quantity,
        machine_line, supervisor_name, mix_proportion, status, quality_grade, created_by
    ) VALUES (
        v_batch_id, v_factory_id, 'BATCH-2026-0801', CURRENT_DATE - INTERVAL '2 days', v_p1_id, 12000, 11850, 150,
        'Line 1 - Automated Press', 'Kailash Yadav', 'Fly Ash 55% : Cement 12% : Dust 30% : Gypsum 3%', 'completed', 'A Grade', v_profile_id
    ) ON CONFLICT (id) DO NOTHING;

    -- 14. Sample Sale Order & Invoice
    INSERT INTO sales (
        id, factory_id, customer_id, invoice_number, sale_date, subtotal, discount, tax, grand_total, paid_amount, payment_status, delivery_details, created_by
    ) VALUES (
        v_sale_id, v_factory_id, v_c1_id, 'INV-2026-0001', CURRENT_DATE - INTERVAL '1 day', 24000.00, 0.00, 2880.00, 26880.00, 26880.00, 'paid',
        '{"vehicleNumber": "MH-12-DT-8821", "driverName": "Ramdas Mane", "driverPhone": "+91 98223 99881", "destinationAddress": "L&T Amanora Project Site"}'::JSONB,
        v_profile_id
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO invoices (
        factory_id, sale_id, invoice_number, invoice_date, due_date, subtotal, discount, taxable_amount, cgst, sgst, igst, grand_total, paid_amount, pending_amount, status, vehicle_number
    ) VALUES (
        v_factory_id, v_sale_id, 'INV-2026-0001', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '14 days', 24000.00, 0.00, 24000.00, 1440.00, 1440.00, 0.00, 26880.00, 26880.00, 0.00, 'paid', 'MH-12-DT-8821'
    ) ON CONFLICT (id) DO NOTHING;

    -- 15. Sample Operating Expense
    INSERT INTO expenses (
        factory_id, category_name, expense_date, description, amount, payment_mode, paid_by
    ) VALUES 
        (v_factory_id, 'Diesel & Generator Fuel', CURRENT_DATE - INTERVAL '3 days', '200 Litres HSD Diesel for Hydra Loader & Genset', 18400.00, 'upi', 'Plant Supervisor'),
        (v_factory_id, 'Machine Repair & Spares', CURRENT_DATE - INTERVAL '1 day', 'Hydraulic hose replacement & oil seal repair for Press Line 1', 3200.00, 'cash', 'Factory Cashier')
    ON CONFLICT DO NOTHING;

END $$;
