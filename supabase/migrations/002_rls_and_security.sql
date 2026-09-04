-- =============================================================================
-- BRICKFLOW ERP - 002_rls_and_security.sql
-- Row Level Security (RLS) & Tenant Isolation Policies
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SECURITY DEFINER HELPER FUNCTIONS
-- -----------------------------------------------------------------------------

-- Check if current authenticated user is a platform super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE auth_user_id = auth.uid() 
          AND role = 'super_admin' 
          AND status = 'active'
    );
$$;

-- Get all factory IDs the current user belongs to with active status
CREATE OR REPLACE FUNCTION get_user_factory_ids()
RETURNS TABLE (factory_id UUID)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT fu.factory_id
    FROM factory_users fu
    JOIN profiles p ON p.id = fu.user_id
    WHERE p.auth_user_id = auth.uid()
      AND fu.status = 'active';
$$;

-- Check if current user has access to a specific factory
CREATE OR REPLACE FUNCTION has_factory_access(target_factory_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT is_super_admin() OR EXISTS (
        SELECT 1 
        FROM factory_users fu
        JOIN profiles p ON p.id = fu.user_id
        WHERE p.auth_user_id = auth.uid()
          AND fu.factory_id = target_factory_id
          AND fu.status = 'active'
    );
$$;

-- Check if current user is owner or manager in a specific factory
CREATE OR REPLACE FUNCTION is_factory_admin(target_factory_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT is_super_admin() OR EXISTS (
        SELECT 1 
        FROM factory_users fu
        JOIN profiles p ON p.id = fu.user_id
        WHERE p.auth_user_id = auth.uid()
          AND fu.factory_id = target_factory_id
          AND fu.role IN ('factory_owner', 'factory_manager')
          AND fu.status = 'active'
    );
$$;

-- -----------------------------------------------------------------------------
-- 2. ENABLE RLS ON ALL TABLES
-- -----------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_material_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_material_purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_material_stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_material_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE finished_stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE wage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE wage_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_accounts ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3. PROFILES POLICIES
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth_user_id = auth.uid() OR is_super_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth_user_id = auth.uid() OR is_super_admin())
    WITH CHECK (auth_user_id = auth.uid() OR is_super_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth_user_id = auth.uid() OR is_super_admin());

-- -----------------------------------------------------------------------------
-- 4. FACTORIES & FACTORY USERS POLICIES
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Factory users can view own factory" ON factories;
CREATE POLICY "Factory users can view own factory"
    ON factories FOR SELECT
    TO authenticated
    USING (has_factory_access(id));

DROP POLICY IF EXISTS "Factory admins can update own factory" ON factories;
CREATE POLICY "Factory admins can update own factory"
    ON factories FOR UPDATE
    TO authenticated
    USING (is_factory_admin(id))
    WITH CHECK (is_factory_admin(id));

DROP POLICY IF EXISTS "Super admins have full access to factories" ON factories;
CREATE POLICY "Super admins have full access to factories"
    ON factories FOR ALL
    TO authenticated
    USING (is_super_admin());

-- Factory Users (Memberships)
DROP POLICY IF EXISTS "Factory users can view members" ON factory_users;
CREATE POLICY "Factory users can view members"
    ON factory_users FOR SELECT
    TO authenticated
    USING (has_factory_access(factory_id));

DROP POLICY IF EXISTS "Factory admins can manage members" ON factory_users;
CREATE POLICY "Factory admins can manage members"
    ON factory_users FOR ALL
    TO authenticated
    USING (is_factory_admin(factory_id))
    WITH CHECK (is_factory_admin(factory_id));

-- -----------------------------------------------------------------------------
-- 5. ONBOARDING & SUBSCRIPTIONS POLICIES
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Tenant onboarding access" ON factory_onboarding;
CREATE POLICY "Tenant onboarding access"
    ON factory_onboarding FOR ALL
    TO authenticated
    USING (has_factory_access(factory_id))
    WITH CHECK (has_factory_access(factory_id));

DROP POLICY IF EXISTS "Public can view active subscription plans" ON subscription_plans;
CREATE POLICY "Public can view active subscription plans"
    ON subscription_plans FOR SELECT
    TO authenticated, anon
    USING (status = 'active' OR is_super_admin());

DROP POLICY IF EXISTS "Super admins manage subscription plans" ON subscription_plans;
CREATE POLICY "Super admins manage subscription plans"
    ON subscription_plans FOR ALL
    TO authenticated
    USING (is_super_admin());

DROP POLICY IF EXISTS "Tenants view own subscription" ON subscriptions;
CREATE POLICY "Tenants view own subscription"
    ON subscriptions FOR SELECT
    TO authenticated
    USING (has_factory_access(factory_id));

DROP POLICY IF EXISTS "Super admins manage subscriptions" ON subscriptions;
CREATE POLICY "Super admins manage subscriptions"
    ON subscriptions FOR ALL
    TO authenticated
    USING (is_super_admin());

DROP POLICY IF EXISTS "Tenants view subscription payments" ON subscription_payments;
CREATE POLICY "Tenants view subscription payments"
    ON subscription_payments FOR SELECT
    TO authenticated
    USING (has_factory_access(factory_id));

-- -----------------------------------------------------------------------------
-- 6. UNITS POLICIES
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "View standard or factory units" ON units;
CREATE POLICY "View standard or factory units"
    ON units FOR SELECT
    TO authenticated
    USING (factory_id IS NULL OR has_factory_access(factory_id));

DROP POLICY IF EXISTS "Manage factory units" ON units;
CREATE POLICY "Manage factory units"
    ON units FOR ALL
    TO authenticated
    USING (factory_id IS NOT NULL AND has_factory_access(factory_id))
    WITH CHECK (factory_id IS NOT NULL AND has_factory_access(factory_id));

-- -----------------------------------------------------------------------------
-- 7. TENANT ISOLATION POLICIES FOR OPERATIONAL MODULES
-- -----------------------------------------------------------------------------

-- Helper Macro / Policy Generator for standard tenant tables
-- (Products, Raw Materials, Vendors, Customers, Purchases, Production, Stock, Employees, Attendance, Wages, Sales, Invoices, Payments, Expenses, Ledger, Notifications, Audit, Demo)

-- PRODUCTS
DROP POLICY IF EXISTS "Tenant products access" ON products;
CREATE POLICY "Tenant products access" ON products FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

-- RAW MATERIALS
DROP POLICY IF EXISTS "Tenant raw_materials access" ON raw_materials;
CREATE POLICY "Tenant raw_materials access" ON raw_materials FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

-- VENDORS
DROP POLICY IF EXISTS "Tenant vendors access" ON vendors;
CREATE POLICY "Tenant vendors access" ON vendors FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

-- CUSTOMERS
DROP POLICY IF EXISTS "Tenant customers access" ON customers;
CREATE POLICY "Tenant customers access" ON customers FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

-- RAW MATERIAL PURCHASES & ITEMS
DROP POLICY IF EXISTS "Tenant rm_purchases access" ON raw_material_purchases;
CREATE POLICY "Tenant rm_purchases access" ON raw_material_purchases FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

DROP POLICY IF EXISTS "Tenant rm_purchase_items access" ON raw_material_purchase_items;
CREATE POLICY "Tenant rm_purchase_items access" ON raw_material_purchase_items FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM raw_material_purchases p WHERE p.id = purchase_id AND has_factory_access(p.factory_id)))
    WITH CHECK (EXISTS (SELECT 1 FROM raw_material_purchases p WHERE p.id = purchase_id AND has_factory_access(p.factory_id)));

-- RAW MATERIAL STOCK TRANSACTIONS
DROP POLICY IF EXISTS "Tenant rm_stock_txns access" ON raw_material_stock_transactions;
CREATE POLICY "Tenant rm_stock_txns access" ON raw_material_stock_transactions FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

-- PRODUCTION BATCHES, CONSUMPTION & WORKERS
DROP POLICY IF EXISTS "Tenant production_batches access" ON production_batches;
CREATE POLICY "Tenant production_batches access" ON production_batches FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

DROP POLICY IF EXISTS "Tenant production_consumption access" ON production_material_consumption;
CREATE POLICY "Tenant production_consumption access" ON production_material_consumption FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

DROP POLICY IF EXISTS "Tenant production_workers access" ON production_workers;
CREATE POLICY "Tenant production_workers access" ON production_workers FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

-- FINISHED GOODS STOCK TRANSACTIONS
DROP POLICY IF EXISTS "Tenant finished_stock_txns access" ON finished_stock_transactions;
CREATE POLICY "Tenant finished_stock_txns access" ON finished_stock_transactions FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

-- EMPLOYEES & ATTENDANCE
DROP POLICY IF EXISTS "Tenant employees access" ON employees;
CREATE POLICY "Tenant employees access" ON employees FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

DROP POLICY IF EXISTS "Tenant attendance access" ON attendance;
CREATE POLICY "Tenant attendance access" ON attendance FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

-- WAGES & WAGE PAYMENTS
DROP POLICY IF EXISTS "Tenant wage_records access" ON wage_records;
CREATE POLICY "Tenant wage_records access" ON wage_records FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

DROP POLICY IF EXISTS "Tenant wage_payments access" ON wage_payments;
CREATE POLICY "Tenant wage_payments access" ON wage_payments FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

-- SALES & SALE ITEMS
DROP POLICY IF EXISTS "Tenant sales access" ON sales;
CREATE POLICY "Tenant sales access" ON sales FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

DROP POLICY IF EXISTS "Tenant sale_items access" ON sale_items;
CREATE POLICY "Tenant sale_items access" ON sale_items FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM sales s WHERE s.id = sale_id AND has_factory_access(s.factory_id)))
    WITH CHECK (EXISTS (SELECT 1 FROM sales s WHERE s.id = sale_id AND has_factory_access(s.factory_id)));

-- INVOICES
DROP POLICY IF EXISTS "Tenant invoices access" ON invoices;
CREATE POLICY "Tenant invoices access" ON invoices FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

-- CUSTOMER & VENDOR PAYMENTS
DROP POLICY IF EXISTS "Tenant customer_payments access" ON customer_payments;
CREATE POLICY "Tenant customer_payments access" ON customer_payments FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

DROP POLICY IF EXISTS "Tenant vendor_payments access" ON vendor_payments;
CREATE POLICY "Tenant vendor_payments access" ON vendor_payments FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

-- EXPENSES & CATEGORIES
DROP POLICY IF EXISTS "Tenant expense_categories access" ON expense_categories;
CREATE POLICY "Tenant expense_categories access" ON expense_categories FOR ALL TO authenticated
    USING (factory_id IS NULL OR has_factory_access(factory_id))
    WITH CHECK (factory_id IS NOT NULL AND has_factory_access(factory_id));

DROP POLICY IF EXISTS "Tenant expenses access" ON expenses;
CREATE POLICY "Tenant expenses access" ON expenses FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

-- FINANCIAL LEDGER
DROP POLICY IF EXISTS "Tenant ledger access" ON ledger_entries;
CREATE POLICY "Tenant ledger access" ON ledger_entries FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

-- NOTIFICATIONS & AUDIT LOGS
DROP POLICY IF EXISTS "Tenant notifications access" ON notifications;
CREATE POLICY "Tenant notifications access" ON notifications FOR ALL TO authenticated
    USING (has_factory_access(factory_id)) WITH CHECK (has_factory_access(factory_id));

DROP POLICY IF EXISTS "Tenant audit_logs access" ON audit_logs;
CREATE POLICY "Tenant audit_logs access" ON audit_logs FOR ALL TO authenticated
    USING (has_factory_access(factory_id) OR is_super_admin())
    WITH CHECK (has_factory_access(factory_id) OR is_super_admin());

-- DEMO ACCOUNTS
DROP POLICY IF EXISTS "Demo accounts access" ON demo_accounts;
CREATE POLICY "Demo accounts access" ON demo_accounts FOR ALL TO authenticated
    USING (has_factory_access(factory_id) OR is_super_admin())
    WITH CHECK (has_factory_access(factory_id) OR is_super_admin());
