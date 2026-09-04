-- =============================================================================
-- BRICKFLOW ERP - 001_initial_schema.sql
-- Multi-Tenant SaaS ERP for Brick Manufacturing Factories
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. CUSTOM ENUMS & TYPES
-- -----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'super_admin',
        'factory_owner',
        'factory_manager',
        'factory_user',
        'factory_worker'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'expired', 'suspended', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE billing_period AS ENUM ('monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('paid', 'partial', 'pending', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_mode AS ENUM ('cash', 'upi', 'bank_transfer', 'cheque', 'neft_rtgs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE production_status AS ENUM ('draft', 'in_progress', 'curing', 'firing', 'completed', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE quality_grade AS ENUM ('A Grade', 'B Grade', 'Commercial', 'Scrap');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE raw_material_txn_type AS ENUM (
        'purchase',
        'production_consumption',
        'adjustment',
        'return',
        'stock_in',
        'stock_out'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE finished_stock_txn_type AS ENUM (
        'production',
        'sale',
        'damage',
        'adjustment',
        'return',
        'stock_in',
        'stock_out'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE job_type AS ENUM (
        'Supervisor',
        'Machine Operator',
        'Kiln Worker',
        'Mould Worker',
        'Loader',
        'Helper',
        'Driver',
        'Accountant',
        'Other'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE wage_type AS ENUM ('daily', 'piece_rate');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'half_day', 'leave');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE entry_type AS ENUM (
        'sale',
        'customer_payment',
        'purchase',
        'vendor_payment',
        'labour_payment',
        'expense',
        'adjustment'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE party_type AS ENUM ('customer', 'vendor', 'labour', 'expense', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------------------------
-- 2. USER PROFILES & PLATFORM USERS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'factory_owner',
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. FACTORIES (TENANTS)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS factories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    gst_number VARCHAR(50),
    logo_url TEXT,
    factory_type VARCHAR(100) DEFAULT 'Fly Ash Brick',
    employee_count VARCHAR(50) DEFAULT '10-25 Workers',
    daily_capacity VARCHAR(100) DEFAULT '20,000 Bricks / Day',
    main_products JSONB DEFAULT '[]'::JSONB,
    bank_details JSONB DEFAULT '{}'::JSONB,
    status user_status NOT NULL DEFAULT 'active',
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. FACTORY USERS (MEMBERSHIP & ROLE ASSIGNMENT)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS factory_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'factory_user',
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_factory_user UNIQUE (factory_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 5. ONBOARDING TRACKER
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS factory_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL UNIQUE REFERENCES factories(id) ON DELETE CASCADE,
    step VARCHAR(100) NOT NULL DEFAULT 'profile',
    completed_steps JSONB NOT NULL DEFAULT '[]'::JSONB,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. SUBSCRIPTION PLANS & BILLING
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    billing_period billing_period NOT NULL DEFAULT 'monthly',
    max_users INT NOT NULL DEFAULT 5 CHECK (max_users > 0),
    max_monthly_production VARCHAR(100),
    is_popular BOOLEAN DEFAULT FALSE,
    features JSONB NOT NULL DEFAULT '[]'::JSONB,
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    status subscription_status NOT NULL DEFAULT 'trial',
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    payment_reference VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode payment_mode NOT NULL DEFAULT 'upi',
    reference VARCHAR(255),
    status payment_status NOT NULL DEFAULT 'paid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. UNITS OF MEASUREMENT
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID REFERENCES factories(id) ON DELETE CASCADE, -- NULL for global units
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    is_standard BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_unit_factory_code UNIQUE (factory_id, code)
);

-- -----------------------------------------------------------------------------
-- 8. FINISHED PRODUCTS CATALOG
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    unit_name VARCHAR(50) NOT NULL DEFAULT 'Pcs',
    hsn_code VARCHAR(50) NOT NULL DEFAULT '681599',
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (selling_price >= 0),
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cost_price >= 0),
    minimum_stock INT NOT NULL DEFAULT 1000 CHECK (minimum_stock >= 0),
    dimensions VARCHAR(100),
    description TEXT,
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_factory_code UNIQUE (factory_id, code)
);

-- -----------------------------------------------------------------------------
-- 9. RAW MATERIALS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS raw_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    unit_name VARCHAR(50) NOT NULL DEFAULT 'Ton',
    minimum_stock NUMERIC(12, 2) NOT NULL DEFAULT 10.00 CHECK (minimum_stock >= 0),
    average_unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (average_unit_cost >= 0),
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_raw_material_factory_code UNIQUE (factory_id, code)
);

-- -----------------------------------------------------------------------------
-- 10. VENDORS & SUPPLIERS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    gst_number VARCHAR(50),
    materials_supplied JSONB DEFAULT '[]'::JSONB,
    opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. CUSTOMERS & CLIENTS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    gst_number VARCHAR(50),
    credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 100000.00 CHECK (credit_limit >= 0),
    opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 12. RAW MATERIAL PURCHASES & LINE ITEMS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS raw_material_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_number VARCHAR(100),
    truck_number VARCHAR(50) NOT NULL,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(50),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0 AND paid_amount <= total_amount),
    pending_amount NUMERIC(12, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_date DATE,
    payment_mode payment_mode DEFAULT 'bank_transfer',
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raw_material_purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES raw_material_purchases(id) ON DELETE CASCADE,
    raw_material_id UUID NOT NULL REFERENCES raw_materials(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    unit_name VARCHAR(50) NOT NULL DEFAULT 'Ton',
    rate NUMERIC(12, 2) NOT NULL CHECK (rate >= 0),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0)
);

-- -----------------------------------------------------------------------------
-- 13. RAW MATERIAL STOCK TRANSACTIONS (INVENTORY LEDGER)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS raw_material_stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    raw_material_id UUID NOT NULL REFERENCES raw_materials(id) ON DELETE RESTRICT,
    transaction_type raw_material_txn_type NOT NULL,
    quantity NUMERIC(12, 3) NOT NULL, -- Positive for additions (in), negative for deductions (out)
    reference_type VARCHAR(100), -- 'purchase', 'production_batch', 'manual_adjustment', 'return'
    reference_id UUID,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 14. PRODUCTION BATCHES & CONSUMPTION
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS production_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    batch_code VARCHAR(100) NOT NULL,
    production_date DATE NOT NULL DEFAULT CURRENT_DATE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    target_quantity INT NOT NULL DEFAULT 0 CHECK (target_quantity >= 0),
    output_quantity INT NOT NULL CHECK (output_quantity >= 0),
    damaged_quantity INT NOT NULL DEFAULT 0 CHECK (damaged_quantity >= 0),
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    unit_name VARCHAR(50) NOT NULL DEFAULT 'Pcs',
    machine_line VARCHAR(100) NOT NULL DEFAULT 'Line 1',
    kiln_chamber VARCHAR(100),
    supervisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    supervisor_name VARCHAR(100),
    mix_proportion VARCHAR(255),
    material_notes TEXT,
    worker_count INT NOT NULL DEFAULT 5 CHECK (worker_count >= 0),
    start_time TIME DEFAULT '08:00:00',
    end_time TIME DEFAULT '17:00:00',
    status production_status NOT NULL DEFAULT 'completed',
    quality_grade quality_grade NOT NULL DEFAULT 'A Grade',
    remarks TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_batch_factory_code UNIQUE (factory_id, batch_code)
);

CREATE TABLE IF NOT EXISTS production_material_consumption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    production_batch_id UUID NOT NULL REFERENCES production_batches(id) ON DELETE CASCADE,
    raw_material_id UUID NOT NULL REFERENCES raw_materials(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    unit_name VARCHAR(50) NOT NULL DEFAULT 'Ton'
);

CREATE TABLE IF NOT EXISTS production_workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    production_batch_id UUID NOT NULL REFERENCES production_batches(id) ON DELETE CASCADE,
    employee_id UUID, -- Optional foreign key to employees
    role VARCHAR(100),
    hours_worked NUMERIC(5, 2) NOT NULL DEFAULT 8.00 CHECK (hours_worked >= 0)
);

-- -----------------------------------------------------------------------------
-- 15. FINISHED GOODS STOCK TRANSACTIONS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS finished_stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    batch_id UUID REFERENCES production_batches(id) ON DELETE SET NULL,
    batch_code VARCHAR(100),
    transaction_type finished_stock_txn_type NOT NULL,
    quantity INT NOT NULL, -- Positive for additions (production/return), negative for deductions (sale/damage)
    reference_type VARCHAR(100), -- 'production_batch', 'sale_order', 'damage_report', 'manual_adjustment'
    reference_id UUID,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 16. EMPLOYEES & WORKFORCE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    job_type job_type NOT NULL DEFAULT 'Machine Operator',
    wage_type wage_type NOT NULL DEFAULT 'daily',
    daily_wage NUMERIC(10, 2) NOT NULL DEFAULT 500.00 CHECK (daily_wage >= 0),
    piece_rate_per_thousand NUMERIC(10, 2) DEFAULT 0.00 CHECK (piece_rate_per_thousand >= 0),
    aadhar_number VARCHAR(50),
    emergency_contact VARCHAR(50),
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_employee_factory_code UNIQUE (factory_id, employee_code)
);

-- -----------------------------------------------------------------------------
-- 17. ATTENDANCE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status NOT NULL DEFAULT 'present',
    overtime_hours NUMERIC(4, 2) NOT NULL DEFAULT 0.00 CHECK (overtime_hours >= 0),
    overtime_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (overtime_amount >= 0),
    units_produced INT DEFAULT 0 CHECK (units_produced >= 0),
    daily_wage_earned NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (daily_wage_earned >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_attendance_day UNIQUE (factory_id, employee_id, attendance_date)
);

-- -----------------------------------------------------------------------------
-- 18. WAGES & WAGE PAYMENTS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    period VARCHAR(100) NOT NULL, -- e.g. "August 2026 - Week 4"
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    present_days NUMERIC(4, 1) NOT NULL DEFAULT 0 CHECK (present_days >= 0),
    half_days INT NOT NULL DEFAULT 0 CHECK (half_days >= 0),
    absent_days INT NOT NULL DEFAULT 0 CHECK (absent_days >= 0),
    overtime_hours NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (overtime_hours >= 0),
    base_wage NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (base_wage >= 0),
    overtime_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (overtime_amount >= 0),
    piece_rate_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (piece_rate_amount >= 0),
    advance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (advance_amount >= 0),
    deduction_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (deduction_amount >= 0),
    net_payable NUMERIC(12, 2) NOT NULL CHECK (net_payable >= 0),
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0 AND paid_amount <= net_payable),
    pending_amount NUMERIC(12, 2) GENERATED ALWAYS AS (net_payable - paid_amount) STORED,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wage_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    wage_record_id UUID REFERENCES wage_records(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode payment_mode NOT NULL DEFAULT 'cash',
    reference VARCHAR(255),
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 19. SALES & SALE ITEMS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(100) NOT NULL,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
    grand_total NUMERIC(12, 2) NOT NULL CHECK (grand_total >= 0),
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0 AND paid_amount <= grand_total),
    pending_amount NUMERIC(12, 2) GENERATED ALWAYS AS (grand_total - paid_amount) STORED,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    delivery_details JSONB NOT NULL DEFAULT '{}'::JSONB,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sale_factory_invoice UNIQUE (factory_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    batch_id UUID REFERENCES production_batches(id) ON DELETE SET NULL,
    batch_code VARCHAR(100),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_name VARCHAR(50) NOT NULL DEFAULT 'Pcs',
    rate NUMERIC(12, 2) NOT NULL CHECK (rate >= 0),
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 12.00 CHECK (tax_percent >= 0),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0)
);

-- -----------------------------------------------------------------------------
-- 20. GST INVOICES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL UNIQUE REFERENCES sales(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    customer_snapshot JSONB NOT NULL DEFAULT '{}'::JSONB,
    items_snapshot JSONB NOT NULL DEFAULT '[]'::JSONB,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    taxable_amount NUMERIC(12, 2) NOT NULL CHECK (taxable_amount >= 0),
    cgst NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cgst >= 0),
    sgst NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (sgst >= 0),
    igst NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (igst >= 0),
    grand_total NUMERIC(12, 2) NOT NULL CHECK (grand_total >= 0),
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    pending_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (pending_amount >= 0),
    status payment_status NOT NULL DEFAULT 'pending',
    pdf_url TEXT,
    terms_and_conditions JSONB DEFAULT '[]'::JSONB,
    vehicle_number VARCHAR(50),
    eway_bill_number VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_invoice_factory_number UNIQUE (factory_id, invoice_number)
);

-- -----------------------------------------------------------------------------
-- 21. CUSTOMER & VENDOR PAYMENTS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS customer_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode payment_mode NOT NULL DEFAULT 'upi',
    reference VARCHAR(255),
    invoice_ref VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    purchase_id UUID REFERENCES raw_material_purchases(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode payment_mode NOT NULL DEFAULT 'bank_transfer',
    reference VARCHAR(255),
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 22. EXPENSES & CATEGORIES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID REFERENCES factories(id) ON DELETE CASCADE, -- NULL for default categories
    name VARCHAR(100) NOT NULL,
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_mode payment_mode NOT NULL DEFAULT 'cash',
    paid_by VARCHAR(100) NOT NULL DEFAULT 'Factory Cashier',
    recipient_name VARCHAR(100),
    reference VARCHAR(255),
    attachment_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 23. FINANCIAL DOUBLE-ENTRY LEDGER
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    entry_type entry_type NOT NULL,
    reference_type VARCHAR(100) NOT NULL, -- 'sale', 'customer_payment', 'purchase', 'vendor_payment', 'wage_payment', 'expense'
    reference_id UUID NOT NULL,
    party_type party_type NOT NULL,
    party_id UUID,
    party_name VARCHAR(255),
    debit NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (debit >= 0),
    credit NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (credit >= 0),
    description TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 24. NOTIFICATIONS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'low_stock', 'payment_due', 'wages_pending', 'subscription', 'production', 'system'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    reference_type VARCHAR(100),
    reference_id UUID,
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 25. AUDIT LOGS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    user_role user_role,
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'PAYMENT', 'STOCK_ADJUSTMENT'
    module VARCHAR(100) NOT NULL,
    record_id VARCHAR(100),
    record_title VARCHAR(255),
    details TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 26. DEMO ACCOUNTS TRACKER
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS demo_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID NOT NULL UNIQUE REFERENCES factories(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 27. COMPREHENSIVE INDEXES FOR FAST QUERYING
-- -----------------------------------------------------------------------------

-- Profiles & Factories
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_factory_users_factory ON factory_users(factory_id);
CREATE INDEX IF NOT EXISTS idx_factory_users_user ON factory_users(user_id);

-- Products & Raw Materials
CREATE INDEX IF NOT EXISTS idx_products_factory ON products(factory_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(factory_id, status);
CREATE INDEX IF NOT EXISTS idx_raw_materials_factory ON raw_materials(factory_id);

-- Purchases & Stock
CREATE INDEX IF NOT EXISTS idx_rm_purchases_factory_date ON raw_material_purchases(factory_id, purchase_date);
CREATE INDEX IF NOT EXISTS idx_rm_purchases_vendor ON raw_material_purchases(vendor_id);
CREATE INDEX IF NOT EXISTS idx_rm_stock_txns_factory_material ON raw_material_stock_transactions(factory_id, raw_material_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_finished_stock_txns_factory_prod ON finished_stock_transactions(factory_id, product_id, transaction_date);

-- Production
CREATE INDEX IF NOT EXISTS idx_production_batches_factory_date ON production_batches(factory_id, production_date);
CREATE INDEX IF NOT EXISTS idx_production_batches_product ON production_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_production_consumption_batch ON production_material_consumption(production_batch_id);

-- Employees & Wages
CREATE INDEX IF NOT EXISTS idx_employees_factory ON employees(factory_id);
CREATE INDEX IF NOT EXISTS idx_attendance_factory_date ON attendance(factory_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_wage_records_factory ON wage_records(factory_id, period_start, period_end);

-- Sales & Invoices
CREATE INDEX IF NOT EXISTS idx_sales_factory_date ON sales(factory_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_factory_date ON invoices(factory_id, invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_sale ON invoices(sale_id);

-- Payments & Ledger
CREATE INDEX IF NOT EXISTS idx_customer_payments_factory ON customer_payments(factory_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_factory ON vendor_payments(factory_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_factory_date ON expenses(factory_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_ledger_factory_date ON ledger_entries(factory_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_notifications_factory_user ON notifications(factory_id, user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_factory ON audit_logs(factory_id, created_at);
