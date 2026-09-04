export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'super_admin' | 'factory_owner' | 'factory_manager' | 'factory_user' | 'factory_worker';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'suspended' | 'cancelled';
export type BillingPeriod = 'monthly' | 'yearly';
export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'cancelled';
export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'neft_rtgs';
export type ProductionStatus = 'draft' | 'in_progress' | 'curing' | 'firing' | 'completed' | 'rejected';
export type QualityGrade = 'A Grade' | 'B Grade' | 'Commercial' | 'Scrap';
export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave';
export type JobType = 'Supervisor' | 'Machine Operator' | 'Kiln Worker' | 'Mould Worker' | 'Loader' | 'Helper' | 'Driver' | 'Accountant' | 'Other';
export type WageType = 'daily' | 'piece_rate';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          status: UserStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      factories: {
        Row: {
          id: string;
          name: string;
          code: string;
          owner_id: string | null;
          phone: string;
          email: string;
          address: string;
          city: string;
          state: string;
          pincode: string;
          country: string;
          gst_number: string | null;
          logo_url: string | null;
          factory_type: string | null;
          employee_count: string | null;
          daily_capacity: string | null;
          main_products: Json | null;
          bank_details: Json | null;
          status: UserStatus;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['factories']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['factories']['Insert']>;
      };
      factory_users: {
        Row: {
          id: string;
          factory_id: string;
          user_id: string;
          role: UserRole;
          status: UserStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['factory_users']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['factory_users']['Insert']>;
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          price: number;
          billing_period: BillingPeriod;
          max_users: number;
          max_monthly_production: string | null;
          is_popular: boolean;
          features: Json;
          status: UserStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Database['public']['Tables']['subscription_plans']['Row'];
        Update: Partial<Database['public']['Tables']['subscription_plans']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          factory_id: string;
          plan_id: string;
          start_date: string;
          end_date: string;
          status: SubscriptionStatus;
          amount: number;
          payment_reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          factory_id: string;
          name: string;
          code: string;
          category: string;
          unit_id: string | null;
          unit_name: string;
          hsn_code: string;
          selling_price: number;
          cost_price: number;
          minimum_stock: number;
          dimensions: string | null;
          description: string | null;
          status: UserStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      raw_materials: {
        Row: {
          id: string;
          factory_id: string;
          name: string;
          code: string;
          unit_id: string | null;
          unit_name: string;
          minimum_stock: number;
          average_unit_cost: number;
          status: UserStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['raw_materials']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['raw_materials']['Insert']>;
      };
      vendors: {
        Row: {
          id: string;
          factory_id: string;
          name: string;
          company_name: string | null;
          phone: string;
          whatsapp: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          gst_number: string | null;
          materials_supplied: Json | null;
          opening_balance: number;
          status: UserStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vendors']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['vendors']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          factory_id: string;
          name: string;
          company_name: string | null;
          phone: string;
          whatsapp: string | null;
          email: string | null;
          address: string;
          city: string | null;
          state: string | null;
          gst_number: string | null;
          credit_limit: number;
          opening_balance: number;
          status: UserStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      production_batches: {
        Row: {
          id: string;
          factory_id: string;
          batch_code: string;
          production_date: string;
          product_id: string;
          target_quantity: number;
          output_quantity: number;
          damaged_quantity: number;
          unit_id: string | null;
          unit_name: string;
          machine_line: string;
          kiln_chamber: string | null;
          supervisor_id: string | null;
          supervisor_name: string | null;
          mix_proportion: string | null;
          material_notes: string | null;
          worker_count: number;
          start_time: string | null;
          end_time: string | null;
          status: ProductionStatus;
          quality_grade: QualityGrade;
          remarks: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['production_batches']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['production_batches']['Insert']>;
      };
      sales: {
        Row: {
          id: string;
          factory_id: string;
          customer_id: string;
          invoice_number: string;
          sale_date: string;
          subtotal: number;
          discount: number;
          tax: number;
          grand_total: number;
          paid_amount: number;
          pending_amount: number;
          payment_status: PaymentStatus;
          delivery_details: Json;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'pending_amount' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sales']['Insert']>;
      };
      invoices: {
        Row: {
          id: string;
          factory_id: string;
          sale_id: string;
          invoice_number: string;
          invoice_date: string;
          due_date: string;
          customer_snapshot: Json;
          items_snapshot: Json;
          subtotal: number;
          discount: number;
          taxable_amount: number;
          cgst: number;
          sgst: number;
          igst: number;
          grand_total: number;
          paid_amount: number;
          pending_amount: number;
          status: PaymentStatus;
          pdf_url: string | null;
          terms_and_conditions: Json | null;
          vehicle_number: string | null;
          eway_bill_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
      expenses: {
        Row: {
          id: string;
          factory_id: string;
          category_id: string | null;
          category_name: string;
          expense_date: string;
          description: string;
          amount: number;
          payment_mode: PaymentMode;
          paid_by: string;
          recipient_name: string | null;
          reference: string | null;
          attachment_url: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>;
      };
      ledger_entries: {
        Row: {
          id: string;
          factory_id: string;
          entry_date: string;
          entry_type: string;
          reference_type: string;
          reference_id: string;
          party_type: string;
          party_id: string | null;
          party_name: string | null;
          debit: number;
          credit: number;
          description: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ledger_entries']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ledger_entries']['Insert']>;
      };
    };
    Functions: {
      get_raw_material_stock: {
        Args: { p_factory_id: string; p_material_id: string };
        Returns: number;
      };
      get_finished_stock: {
        Args: { p_factory_id: string; p_product_id: string };
        Returns: number;
      };
      get_customer_balance: {
        Args: { p_factory_id: string; p_customer_id: string };
        Returns: number;
      };
      get_vendor_balance: {
        Args: { p_factory_id: string; p_vendor_id: string };
        Returns: number;
      };
      complete_production: {
        Args: {
          p_factory_id: string;
          p_batch_code: string;
          p_production_date: string;
          p_product_id: string;
          p_target_quantity: number;
          p_output_quantity: number;
          p_damaged_quantity: number;
          p_machine_line: string;
          p_kiln_chamber: string | null;
          p_supervisor_name: string;
          p_mix_proportion: string | null;
          p_quality_grade: QualityGrade;
          p_consumptions: Json;
          p_workers: Json;
          p_remarks?: string | null;
        };
        Returns: Json;
      };
      complete_sale: {
        Args: {
          p_factory_id: string;
          p_customer_id: string;
          p_sale_date: string;
          p_items: Json;
          p_delivery_details: Json;
          p_paid_amount?: number;
          p_payment_mode?: PaymentMode;
          p_notes?: string | null;
        };
        Returns: Json;
      };
      record_customer_payment: {
        Args: {
          p_factory_id: string;
          p_customer_id: string;
          p_sale_id?: string | null;
          p_amount: number;
          p_payment_date?: string;
          p_payment_mode?: PaymentMode;
          p_reference?: string | null;
          p_notes?: string | null;
        };
        Returns: Json;
      };
      record_vendor_payment: {
        Args: {
          p_factory_id: string;
          p_vendor_id: string;
          p_purchase_id?: string | null;
          p_amount: number;
          p_payment_date?: string;
          p_payment_mode?: PaymentMode;
          p_reference?: string | null;
          p_notes?: string | null;
        };
        Returns: Json;
      };
      register_factory: {
        Args: {
          p_auth_user_id: string;
          p_full_name: string;
          p_email: string;
          p_phone: string;
          p_factory_name: string;
          p_factory_code?: string | null;
          p_factory_type?: string;
          p_city?: string;
          p_state?: string;
          p_address?: string;
          p_pincode?: string;
          p_gst_number?: string | null;
        };
        Returns: Json;
      };
      get_factory_profit_and_loss: {
        Args: {
          p_factory_id: string;
          p_start_date: string;
          p_end_date: string;
        };
        Returns: Json;
      };
    };
  };
}
