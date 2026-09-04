-- =============================================================================
-- BRICKFLOW ERP - 004_reporting_views.sql
-- Financial & Operational Analytical Views & Reporting Functions
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. RAW MATERIAL INVENTORY VIEW
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW view_raw_material_inventory AS
SELECT 
    rm.id AS raw_material_id,
    rm.factory_id,
    rm.name AS material_name,
    rm.code AS material_code,
    rm.unit_name,
    rm.minimum_stock,
    rm.average_unit_cost,
    rm.status,
    COALESCE(SUM(st.quantity), 0.000) AS current_stock,
    (COALESCE(SUM(st.quantity), 0.000) * rm.average_unit_cost) AS total_valuation,
    CASE 
        WHEN COALESCE(SUM(st.quantity), 0.000) <= rm.minimum_stock THEN TRUE 
        ELSE FALSE 
    END AS is_low_stock
FROM raw_materials rm
LEFT JOIN raw_material_stock_transactions st ON st.raw_material_id = rm.id
GROUP BY rm.id, rm.factory_id, rm.name, rm.code, rm.unit_name, rm.minimum_stock, rm.average_unit_cost, rm.status;

-- -----------------------------------------------------------------------------
-- 2. FINISHED GOODS INVENTORY VIEW
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW view_finished_goods_inventory AS
SELECT 
    p.id AS product_id,
    p.factory_id,
    p.name AS product_name,
    p.code AS product_code,
    p.category,
    p.unit_name,
    p.hsn_code,
    p.selling_price,
    p.cost_price,
    p.minimum_stock,
    p.status,
    COALESCE(SUM(fst.quantity), 0)::INT AS current_stock,
    (COALESCE(SUM(fst.quantity), 0) * p.cost_price) AS total_inventory_cost_value,
    (COALESCE(SUM(fst.quantity), 0) * p.selling_price) AS total_inventory_sales_value,
    CASE 
        WHEN COALESCE(SUM(fst.quantity), 0) <= p.minimum_stock THEN TRUE 
        ELSE FALSE 
    END AS is_low_stock
FROM products p
LEFT JOIN finished_stock_transactions fst ON fst.product_id = p.id
GROUP BY p.id, p.factory_id, p.name, p.code, p.category, p.unit_name, p.hsn_code, p.selling_price, p.cost_price, p.minimum_stock, p.status;

-- -----------------------------------------------------------------------------
-- 3. MONTHLY PRODUCTION STATS VIEW
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW view_monthly_production_stats AS
SELECT 
    b.factory_id,
    TO_CHAR(b.production_date, 'YYYY-MM') AS month_year,
    b.product_id,
    p.name AS product_name,
    p.category,
    COUNT(b.id) AS total_batches,
    SUM(b.target_quantity) AS total_target_quantity,
    SUM(b.output_quantity) AS total_output_quantity,
    SUM(b.damaged_quantity) AS total_damaged_quantity,
    ROUND((SUM(b.damaged_quantity)::NUMERIC / NULLIF(SUM(b.output_quantity + b.damaged_quantity), 0) * 100), 2) AS damage_percentage
FROM production_batches b
JOIN products p ON p.id = b.product_id
GROUP BY b.factory_id, TO_CHAR(b.production_date, 'YYYY-MM'), b.product_id, p.name, p.category;

-- -----------------------------------------------------------------------------
-- 4. CUSTOMER AGING & RECEIVABLES VIEW
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW view_customer_aging AS
SELECT 
    c.id AS customer_id,
    c.factory_id,
    c.name AS customer_name,
    c.company_name,
    c.phone,
    c.credit_limit,
    c.opening_balance,
    COALESCE(SUM(s.grand_total), 0.00) AS total_sales,
    COALESCE((SELECT SUM(cp.amount) FROM customer_payments cp WHERE cp.customer_id = c.id), 0.00) AS total_paid,
    (c.opening_balance + COALESCE(SUM(s.grand_total), 0.00) - COALESCE((SELECT SUM(cp.amount) FROM customer_payments cp WHERE cp.customer_id = c.id), 0.00)) AS outstanding_balance,
    COALESCE(SUM(CASE WHEN s.sale_date >= CURRENT_DATE - INTERVAL '15 days' THEN s.pending_amount ELSE 0.00 END), 0.00) AS aging_0_15_days,
    COALESCE(SUM(CASE WHEN s.sale_date >= CURRENT_DATE - INTERVAL '30 days' AND s.sale_date < CURRENT_DATE - INTERVAL '15 days' THEN s.pending_amount ELSE 0.00 END), 0.00) AS aging_16_30_days,
    COALESCE(SUM(CASE WHEN s.sale_date >= CURRENT_DATE - INTERVAL '60 days' AND s.sale_date < CURRENT_DATE - INTERVAL '30 days' THEN s.pending_amount ELSE 0.00 END), 0.00) AS aging_31_60_days,
    COALESCE(SUM(CASE WHEN s.sale_date < CURRENT_DATE - INTERVAL '60 days' THEN s.pending_amount ELSE 0.00 END), 0.00) AS aging_over_60_days
FROM customers c
LEFT JOIN sales s ON s.customer_id = c.id
GROUP BY c.id, c.factory_id, c.name, c.company_name, c.phone, c.credit_limit, c.opening_balance;

-- -----------------------------------------------------------------------------
-- 5. PROFIT & LOSS ANALYTICAL REPORT FUNCTION
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_factory_profit_and_loss(
    p_factory_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_total_revenue NUMERIC(12, 2) := 0.00;
    v_rm_purchases_cost NUMERIC(12, 2) := 0.00;
    v_labour_wages_cost NUMERIC(12, 2) := 0.00;
    v_operating_expenses NUMERIC(12, 2) := 0.00;
    v_diesel_expenses NUMERIC(12, 2) := 0.00;
    v_electricity_expenses NUMERIC(12, 2) := 0.00;
    v_repair_expenses NUMERIC(12, 2) := 0.00;
    v_kiln_fuel_expenses NUMERIC(12, 2) := 0.00;
    v_cogs NUMERIC(12, 2) := 0.00;
    v_gross_profit NUMERIC(12, 2) := 0.00;
    v_net_operating_profit NUMERIC(12, 2) := 0.00;
    v_total_bricks_produced INT := 0;
    v_cost_per_brick NUMERIC(6, 2) := 0.00;
BEGIN
    -- 1. Total Sales Revenue
    SELECT COALESCE(SUM(grand_total), 0.00) INTO v_total_revenue
    FROM sales
    WHERE factory_id = p_factory_id
      AND sale_date BETWEEN p_start_date AND p_end_date;

    -- 2. Raw Material Purchases Cost
    SELECT COALESCE(SUM(total_amount), 0.00) INTO v_rm_purchases_cost
    FROM raw_material_purchases
    WHERE factory_id = p_factory_id
      AND purchase_date BETWEEN p_start_date AND p_end_date;

    -- 3. Labour Wages Paid / Payable
    SELECT COALESCE(SUM(net_payable), 0.00) INTO v_labour_wages_cost
    FROM wage_records
    WHERE factory_id = p_factory_id
      AND period_start >= p_start_date AND period_end <= p_end_date;

    -- 4. Categorized Operating Expenses
    SELECT 
        COALESCE(SUM(amount), 0.00),
        COALESCE(SUM(CASE WHEN category_name ILIKE '%diesel%' THEN amount ELSE 0 END), 0.00),
        COALESCE(SUM(CASE WHEN category_name ILIKE '%elect%' THEN amount ELSE 0 END), 0.00),
        COALESCE(SUM(CASE WHEN category_name ILIKE '%repair%' OR category_name ILIKE '%maint%' THEN amount ELSE 0 END), 0.00),
        COALESCE(SUM(CASE WHEN category_name ILIKE '%fuel%' OR category_name ILIKE '%kiln%' THEN amount ELSE 0 END), 0.00)
    INTO 
        v_operating_expenses,
        v_diesel_expenses,
        v_electricity_expenses,
        v_repair_expenses,
        v_kiln_fuel_expenses
    FROM expenses
    WHERE factory_id = p_factory_id
      AND expense_date BETWEEN p_start_date AND p_end_date;

    -- 5. Total Bricks Produced
    SELECT COALESCE(SUM(output_quantity), 0) INTO v_total_bricks_produced
    FROM production_batches
    WHERE factory_id = p_factory_id
      AND production_date BETWEEN p_start_date AND p_end_date;

    -- 6. P&L Math
    v_cogs := v_rm_purchases_cost + v_labour_wages_cost + v_diesel_expenses + v_electricity_expenses + v_kiln_fuel_expenses;
    v_gross_profit := v_total_revenue - v_cogs;
    v_net_operating_profit := v_total_revenue - (v_rm_purchases_cost + v_labour_wages_cost + v_operating_expenses);
    
    IF v_total_bricks_produced > 0 THEN
        v_cost_per_brick := ROUND(((v_cogs + v_operating_expenses) / v_total_bricks_produced)::NUMERIC, 2);
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'period', jsonb_build_object('start_date', p_start_date, 'end_date', p_end_date),
        'metrics', jsonb_build_object(
            'total_revenue', v_total_revenue,
            'raw_material_cost', v_rm_purchases_cost,
            'labour_cost', v_labour_wages_cost,
            'operating_expenses', v_operating_expenses,
            'diesel_power_cost', (v_diesel_expenses + v_electricity_expenses + v_kiln_fuel_expenses),
            'cogs', v_cogs,
            'gross_profit', v_gross_profit,
            'net_operating_profit', v_net_operating_profit,
            'total_bricks_produced', v_total_bricks_produced,
            'cost_per_brick', v_cost_per_brick
        )
    );
END;
$$;
