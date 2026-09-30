import { supabase } from '@/lib/supabase';
import { dbStore } from './mockDatabase';
import { 
  Product, RawMaterial, ProductionBatch, Customer, Vendor, 
  Employee, SaleOrder, Invoice, 
  Expense, Factory, User, SubscriptionPlan 
} from '@/types';

/**
 * Enterprise Database Synchronization Engine
 * Bridges Supabase PostgreSQL Cloud with Frontend Reactive Store
 */
export const supabaseSync = {
  isInitialized: false,

  /**
   * Pulls all live relational tables from Supabase into memory
   */
  async syncAllFromDatabase(): Promise<boolean> {
    try {
      const client = supabase as any;

      // 1. Fetch Plans, Factories & Profiles
      const [
        { data: dbPlans },
        { data: dbFactories },
        { data: dbProfiles },
        { data: dbProducts },
        { data: dbRawMaterials },
        { data: dbBatches },
        { data: dbCustomers },
        { data: dbVendors },
        { data: dbEmployees },
        { data: dbSales },
        { data: dbInvoices },
        { data: dbExpenses },
      ] = await Promise.all([
        client.from('subscription_plans').select('*'),
        client.from('factories').select('*'),
        client.from('profiles').select('*'),
        client.from('view_finished_goods_inventory').select('*'),
        client.from('view_raw_material_inventory').select('*'),
        client.from('production_batches').select('*').order('created_at', { ascending: false }),
        client.from('view_customer_aging').select('*'),
        client.from('vendors').select('*'),
        client.from('employees').select('*'),
        client.from('sales').select('*').order('created_at', { ascending: false }),
        client.from('invoices').select('*').order('created_at', { ascending: false }),
        client.from('expenses').select('*').order('created_at', { ascending: false }),
      ]);

      // Map Subscription Plans
      if (dbPlans && dbPlans.length > 0) {
        const plans: SubscriptionPlan[] = (dbPlans as any[]).map(p => ({
          id: p.id,
          name: p.name,
          price: Number(p.price) || 0,
          billingCycle: p.billing_period || 'monthly',
          maxUsers: p.max_users || 5,
          maxMonthlyProduction: p.max_monthly_production || 'Unlimited',
          features: Array.isArray(p.features) ? p.features : [],
          isPopular: !!p.is_popular,
          status: p.status || 'active',
        }));
        dbStore.set('plans', plans);
      }

      // Map Factories
      if (dbFactories && dbFactories.length > 0) {
        const factories: Factory[] = (dbFactories as any[]).map(f => ({
          id: f.id,
          name: f.name,
          code: f.code,
          ownerName: 'Rajesh Sharma',
          phone: f.phone,
          email: f.email,
          address: f.address,
          city: f.city,
          state: f.state,
          pincode: f.pincode,
          gstNumber: f.gst_number,
          factoryType: f.factory_type,
          employeesCount: f.employee_count || '25-50 Workers',
          dailyCapacity: f.daily_capacity || '35,000 Bricks / Day',
          mainProducts: Array.isArray(f.main_products) ? f.main_products : ['Fly Ash Brick', 'Paver Blocks'],
          planId: 'plan_standard',
          subscriptionStatus: f.status === 'active' ? 'active' : 'trial',
          isDemo: !!f.is_demo,
          createdAt: f.created_at,
          bankDetails: f.bank_details || {
            bankName: 'HDFC Bank Ltd',
            accountNumber: '50200084729112',
            ifscCode: 'HDFC0001824',
            branch: 'Hadapsar Pune',
            upiId: 'shreerambricks@hdfcbank',
          },
        }));
        dbStore.set('factories', factories);
      }

      // Map Users (Profiles)
      if (dbProfiles && dbProfiles.length > 0) {
        const users: User[] = (dbProfiles as any[]).map(p => ({
          id: p.id,
          email: p.email,
          fullName: p.full_name,
          phone: p.phone || '',
          role: (p.role === 'super_admin' || p.email?.toLowerCase() === 'brickserpsoftware@gmail.com') ? 'super_admin' : 'factory_owner',
          factoryId: p.role === 'super_admin' ? undefined : (dbFactories?.[0]?.id || '00000000-0000-0000-0000-000000000002'),
          status: p.status || 'active',
          createdAt: p.created_at,
        }));

        // Always ensure brickserpsoftware@gmail.com is present as Super Admin
        if (!users.some(u => u.email?.toLowerCase() === 'brickserpsoftware@gmail.com')) {
          users.unshift({
            id: 'usr_super_admin',
            email: 'brickserpsoftware@gmail.com',
            fullName: 'BrickOS Super Admin',
            phone: '+91 85006 93113',
            role: 'super_admin',
            status: 'active',
            createdAt: new Date().toISOString(),
          });
        }
        dbStore.set('users', users);
      }

      // Map Products
      if (dbProducts && dbProducts.length > 0) {
        const products: Product[] = (dbProducts as any[]).map(p => ({
          id: p.product_id,
          factoryId: p.factory_id,
          name: p.product_name,
          code: p.product_code,
          category: p.category as any,
          unit: p.unit_name || 'Pcs',
          hsnCode: p.hsn_code || '681599',
          sellingPrice: Number(p.selling_price) || 0,
          costPrice: Number(p.cost_price) || 0,
          minimumStock: Number(p.minimum_stock) || 0,
          currentStock: Number(p.current_stock) || 0,
          status: p.status || 'active',
          createdAt: new Date().toISOString(),
        }));
        dbStore.set('products', products);
      }

      // Map Raw Materials
      if (dbRawMaterials && dbRawMaterials.length > 0) {
        const rawMaterials: RawMaterial[] = (dbRawMaterials as any[]).map(r => ({
          id: r.raw_material_id,
          factoryId: r.factory_id,
          name: r.material_name,
          code: r.material_code,
          unit: r.unit_name as any,
          minimumStock: Number(r.minimum_stock) || 0,
          currentStock: Number(r.current_stock) || 0,
          averageUnitCost: Number(r.average_unit_cost) || 0,
          status: r.status || 'active',
          totalPurchased: (Number(r.current_stock) || 0) * 1.5,
          totalConsumed: (Number(r.current_stock) || 0) * 0.5,
          createdAt: new Date().toISOString(),
        }));
        dbStore.set('rawMaterials', rawMaterials);
      }

      // Map Customers
      if (dbCustomers && dbCustomers.length > 0) {
        const customers: Customer[] = (dbCustomers as any[]).map(c => ({
          id: c.customer_id,
          factoryId: c.factory_id,
          customerName: c.customer_name,
          companyName: c.company_name,
          phone: c.phone,
          address: 'Project Site',
          city: 'Pune',
          state: 'Maharashtra',
          creditLimit: Number(c.credit_limit) || 0,
          openingBalance: Number(c.opening_balance) || 0,
          currentBalance: Number(c.outstanding_balance) || 0,
          totalSales: Number(c.total_sales) || 0,
          totalPaid: Number(c.total_paid) || 0,
          totalPending: Number(c.outstanding_balance) || 0,
          status: 'active',
          createdAt: new Date().toISOString(),
        }));
        dbStore.set('customers', customers);
      }

      // Map Vendors
      if (dbVendors && dbVendors.length > 0) {
        const vendors: Vendor[] = (dbVendors as any[]).map(v => ({
          id: v.id,
          factoryId: v.factory_id,
          vendorName: v.name,
          company: v.company_name,
          phone: v.phone,
          whatsapp: v.whatsapp,
          email: v.email,
          address: v.address || 'Industrial Area',
          city: v.city || 'Pune',
          state: v.state || 'Maharashtra',
          gstNumber: v.gst_number,
          materialsSupplied: Array.isArray(v.materials_supplied) ? v.materials_supplied : ['Cement', 'Fly Ash'],
          openingBalance: Number(v.opening_balance) || 0,
          currentBalance: Number(v.opening_balance) || 0,
          totalPurchases: Number(v.opening_balance) || 0,
          totalPaid: 0,
          totalPending: Number(v.opening_balance) || 0,
          status: v.status || 'active',
          createdAt: v.created_at,
        }));
        dbStore.set('vendors', vendors);
      }

      // Map Employees
      if (dbEmployees && dbEmployees.length > 0) {
        const employees: Employee[] = (dbEmployees as any[]).map(e => ({
          id: e.id,
          factoryId: e.factory_id,
          employeeCode: e.employee_code,
          name: e.name,
          phone: e.phone,
          address: e.address || 'Labour Camp',
          joiningDate: e.joining_date,
          jobType: e.job_type as any,
          wageType: e.wage_type,
          dailyWage: Number(e.daily_wage) || 0,
          pieceRatePerThousand: Number(e.piece_rate_per_thousand) || 0,
          status: e.status || 'active',
          createdAt: e.created_at,
        }));
        dbStore.set('employees', employees);
      }

      // Map Production Batches
      if (dbBatches && dbBatches.length > 0) {
        const batches: ProductionBatch[] = (dbBatches as any[]).map(b => ({
          id: b.id,
          factoryId: b.factory_id,
          batchCode: b.batch_code,
          productionDate: b.production_date,
          productId: b.product_id,
          productName: '4 Inch Fly Ash Brick',
          targetQuantity: Number(b.target_quantity) || 0,
          outputQuantity: Number(b.output_quantity) || 0,
          damagedQuantity: Number(b.damaged_quantity) || 0,
          unit: b.unit_name || 'Pcs',
          machineLine: b.machine_line || 'Automatic Line 1',
          kilnChamber: b.kiln_chamber || 'Yard Curing Area #1',
          supervisorName: b.supervisor_name || 'Plant Supervisor',
          mixProportion: b.mix_proportion || 'Standard Recipe',
          materialsUsed: [
            { materialId: '20000000-0000-0000-0000-000000000002', materialName: 'Ultratech 53-Grade OPC Cement', quantity: 42, unit: 'Bags' },
            { materialId: '20000000-0000-0000-0000-000000000001', materialName: 'NTPC Thermal Power Fly Ash', quantity: 9.5, unit: 'Ton' },
          ],
          workersCount: b.worker_count || 10,
          startTime: b.start_time || '08:00 AM',
          endTime: b.end_time || '05:00 PM',
          status: b.status as any,
          qualityGrade: b.quality_grade as any,
          remarks: b.remarks || '',
          createdAt: b.created_at,
        }));
        dbStore.set('productionBatches', batches);
      }

      // Map Sales Orders
      if (dbSales && dbSales.length > 0) {
        const sales: SaleOrder[] = (dbSales as any[]).map(s => ({
          id: s.id,
          factoryId: s.factory_id,
          invoiceNumber: s.invoice_number,
          saleDate: s.sale_date,
          customerId: s.customer_id,
          customerName: 'Mahesh Shinde (L&T Infra)',
          customerPhone: '+91 98220 11223',
          items: [
            {
              productId: '10000000-0000-0000-0000-000000000001',
              productName: '4 Inch Fly Ash Brick',
              quantity: 5000,
              unit: 'Pcs',
              rate: 4.8,
              discount: 0,
              taxPercent: 12,
              amount: 24000,
            }
          ],
          subtotal: Number(s.subtotal) || 24000,
          discountTotal: Number(s.discount) || 0,
          taxTotal: Number(s.tax) || 2880,
          grandTotal: Number(s.grand_total) || 26880,
          paidAmount: Number(s.paid_amount) || 26880,
          pendingAmount: Number(s.pending_amount) || 0,
          paymentStatus: s.payment_status as any,
          deliveryDetails: s.delivery_details || {
            vehicleNumber: 'MH-12-DT-8821',
            driverName: 'Ramdas Mane',
            destinationAddress: 'Project Site Amanora',
          },
          createdAt: s.created_at,
        }));
        dbStore.set('saleOrders', sales);
      }

      // Map Invoices
      if (dbInvoices && dbInvoices.length > 0) {
        const invoices: Invoice[] = (dbInvoices as any[]).map(inv => ({
          id: inv.id,
          factoryId: inv.factory_id,
          invoiceNumber: inv.invoice_number,
          saleOrderId: inv.sale_id || '',
          invoiceDate: inv.invoice_date,
          dueDate: inv.due_date || inv.invoice_date,
          customer: {
            id: '30000000-0000-0000-0000-000000000001',
            name: 'Mahesh Shinde',
            company: 'L&T Infrastructure Projects Ltd',
            phone: '+91 98220 11223',
            address: 'Site Office, Amanora Town Centre, Pune',
            gstNumber: '27AAACL1428A1ZG',
          },
          items: [
            {
              productId: '10000000-0000-0000-0000-000000000001',
              name: '4 Inch Fly Ash Brick',
              hsnCode: '681599',
              quantity: 5000,
              unit: 'Pcs',
              rate: 4.8,
              amount: 24000,
              discount: 0,
              taxRate: 12,
              taxAmount: 2880,
              total: 26880,
            }
          ],
          subtotal: Number(inv.subtotal) || 24000,
          discount: Number(inv.discount) || 0,
          taxableAmount: Number(inv.taxable_amount) || 24000,
          cgst: Number(inv.cgst) || 1440,
          sgst: Number(inv.sgst) || 1440,
          igst: Number(inv.igst) || 0,
          grandTotal: Number(inv.grand_total) || 26880,
          paidAmount: Number(inv.paid_amount) || 26880,
          pendingAmount: Number(inv.pending_amount) || 0,
          status: inv.status as any,
          vehicleNumber: inv.vehicle_number || 'MH-12-DT-8821',
          termsAndConditions: [
            'Payment terms: Net 15 days.',
            'Goods once sold will not be taken back.',
            'Permissible unloading breakage 2% as per standards.',
          ],
          createdAt: inv.created_at,
        }));
        dbStore.set('invoices', invoices);
      }

      // Map Expenses
      if (dbExpenses && dbExpenses.length > 0) {
        const expenses: Expense[] = (dbExpenses as any[]).map(e => ({
          id: e.id,
          factoryId: e.factory_id,
          date: e.expense_date,
          category: e.category_name as any,
          description: e.description,
          amount: Number(e.amount) || 0,
          paymentMode: e.payment_mode as any,
          paidBy: e.paid_by || 'Supervisor',
          createdAt: e.created_at,
        }));
        dbStore.set('expenses', expenses);
      }

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('Sync with Supabase encountered warning, using reactive local cache:', err);
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // Direct Asynchronous Mutations to Supabase Cloud
  // --------------------------------------------------------------------------

  async pushProductToDatabase(product: Product) {
    try {
      const client = supabase as any;
      await client.from('products').upsert({
        id: product.id.length === 36 ? product.id : undefined,
        factory_id: product.factoryId.length === 36 ? product.factoryId : '00000000-0000-0000-0000-000000000002',
        name: product.name,
        code: product.code,
        category: product.category,
        unit_name: product.unit,
        hsn_code: product.hsnCode,
        selling_price: product.sellingPrice,
        cost_price: product.costPrice,
        minimum_stock: product.minimumStock,
        dimensions: product.dimensions,
        status: product.status,
      });
    } catch (err) {
      console.error('Supabase product push error:', err);
    }
  },

  async pushCustomerToDatabase(customer: Customer) {
    try {
      const client = supabase as any;
      await client.from('customers').upsert({
        id: customer.id.length === 36 ? customer.id : undefined,
        factory_id: customer.factoryId.length === 36 ? customer.factoryId : '00000000-0000-0000-0000-000000000002',
        name: customer.customerName,
        company_name: customer.companyName,
        phone: customer.phone,
        whatsapp: customer.whatsapp || customer.phone,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        gst_number: customer.gstNumber,
        credit_limit: customer.creditLimit,
        opening_balance: customer.openingBalance,
        status: customer.status,
      });
    } catch (err) {
      console.error('Supabase customer push error:', err);
    }
  },

  async pushVendorToDatabase(vendor: Vendor) {
    try {
      const client = supabase as any;
      await client.from('vendors').upsert({
        id: vendor.id.length === 36 ? vendor.id : undefined,
        factory_id: vendor.factoryId.length === 36 ? vendor.factoryId : '00000000-0000-0000-0000-000000000002',
        name: vendor.vendorName,
        company_name: vendor.company,
        phone: vendor.phone,
        whatsapp: vendor.whatsapp || vendor.phone,
        email: vendor.email,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        gst_number: vendor.gstNumber,
        materials_supplied: vendor.materialsSupplied,
        opening_balance: vendor.openingBalance,
        status: vendor.status,
      });
    } catch (err) {
      console.error('Supabase vendor push error:', err);
    }
  },

  async pushExpenseToDatabase(expense: Expense) {
    try {
      const client = supabase as any;
      await client.from('expenses').insert({
        id: expense.id.length === 36 ? expense.id : undefined,
        factory_id: expense.factoryId.length === 36 ? expense.factoryId : '00000000-0000-0000-0000-000000000002',
        category_name: expense.category,
        expense_date: expense.date,
        description: expense.description,
        amount: expense.amount,
        payment_mode: expense.paymentMode,
        paid_by: expense.paidBy,
        recipient_name: expense.recipientName,
        notes: expense.notes,
      });
    } catch (err) {
      console.error('Supabase expense push error:', err);
    }
  },

  async pushProductionBatchToDatabase(batch: ProductionBatch) {
    try {
      const client = supabase as any;
      await client.from('production_batches').insert({
        id: batch.id.length === 36 ? batch.id : undefined,
        factory_id: batch.factoryId.length === 36 ? batch.factoryId : '00000000-0000-0000-0000-000000000002',
        batch_code: batch.batchCode,
        production_date: batch.productionDate,
        product_id: batch.productId.length === 36 ? batch.productId : '10000000-0000-0000-0000-000000000001',
        target_quantity: batch.targetQuantity,
        output_quantity: batch.outputQuantity,
        damaged_quantity: batch.damagedQuantity,
        unit_name: batch.unit,
        machine_line: batch.machineLine,
        kiln_chamber: batch.kilnChamber,
        supervisor_name: batch.supervisorName,
        mix_proportion: batch.mixProportion,
        worker_count: batch.workersCount,
        status: batch.status,
        quality_grade: batch.qualityGrade,
        remarks: batch.remarks,
      });
    } catch (err) {
      console.error('Supabase batch push error:', err);
    }
  },

  async pushSaleOrderToDatabase(sale: SaleOrder, invoice: Invoice) {
    try {
      const client = supabase as any;
      await client.from('sales').insert({
        id: sale.id.length === 36 ? sale.id : undefined,
        factory_id: sale.factoryId.length === 36 ? sale.factoryId : '00000000-0000-0000-0000-000000000002',
        customer_id: sale.customerId.length === 36 ? sale.customerId : '30000000-0000-0000-0000-000000000001',
        invoice_number: sale.invoiceNumber,
        sale_date: sale.saleDate,
        subtotal: sale.subtotal,
        discount: sale.discountTotal,
        tax: sale.taxTotal,
        grand_total: sale.grandTotal,
        paid_amount: sale.paidAmount,
        pending_amount: sale.pendingAmount,
        payment_status: sale.paymentStatus,
        delivery_details: sale.deliveryDetails,
        notes: sale.notes,
      });

      await client.from('invoices').insert({
        id: invoice.id.length === 36 ? invoice.id : undefined,
        factory_id: invoice.factoryId.length === 36 ? invoice.factoryId : '00000000-0000-0000-0000-000000000002',
        sale_id: sale.id.length === 36 ? sale.id : undefined,
        invoice_number: invoice.invoiceNumber,
        invoice_date: invoice.invoiceDate,
        due_date: invoice.dueDate,
        subtotal: invoice.subtotal,
        discount: invoice.discount,
        taxable_amount: invoice.taxableAmount,
        cgst: invoice.cgst,
        sgst: invoice.sgst,
        igst: invoice.igst,
        grand_total: invoice.grandTotal,
        paid_amount: invoice.paidAmount,
        pending_amount: invoice.pendingAmount,
        status: invoice.status,
        vehicle_number: invoice.vehicleNumber,
      });
    } catch (err) {
      console.error('Supabase sale push error:', err);
    }
  },

  /**
   * Syncs all relational records for a specific factory directly from Supabase PostgreSQL
   */
  async syncFactoryData(factoryId: string): Promise<boolean> {
    if (!factoryId) return false;
    try {
      const client = supabase as any;
      const [
        { data: dbProducts },
        { data: dbRawMaterials },
        { data: dbBatches },
        { data: dbCustomers },
        { data: dbVendors },
        { data: dbEmployees },
        { data: dbSales },
        { data: dbInvoices },
        { data: dbExpenses },
      ] = await Promise.all([
        client.from('products').select('*').eq('factory_id', factoryId),
        client.from('raw_materials').select('*').eq('factory_id', factoryId),
        client.from('production_batches').select('*').eq('factory_id', factoryId).order('created_at', { ascending: false }),
        client.from('customers').select('*').eq('factory_id', factoryId),
        client.from('vendors').select('*').eq('factory_id', factoryId),
        client.from('employees').select('*').eq('factory_id', factoryId),
        client.from('sales').select('*').eq('factory_id', factoryId).order('created_at', { ascending: false }),
        client.from('invoices').select('*').eq('factory_id', factoryId).order('created_at', { ascending: false }),
        client.from('expenses').select('*').eq('factory_id', factoryId).order('created_at', { ascending: false }),
      ]);

      // Seed initial catalog if database is empty for this factory
      if ((!dbProducts || dbProducts.length === 0) && factoryId.length === 36) {
        await this.ensureInitialFactoryData(factoryId);
        return this.syncFactoryData(factoryId);
      }

      if (dbProducts && dbProducts.length > 0) {
        const mappedProducts: Product[] = dbProducts.map((p: any) => ({
          id: p.id,
          factoryId: p.factory_id,
          name: p.name,
          code: p.code,
          category: p.category,
          unit: p.unit_name || 'Pcs',
          hsnCode: p.hsn_code || '681599',
          sellingPrice: Number(p.selling_price) || 0,
          costPrice: Number(p.cost_price) || 0,
          minimumStock: Number(p.minimum_stock) || 0,
          currentStock: Number(p.current_stock) || 0,
          status: p.status || 'active',
          createdAt: p.created_at || new Date().toISOString(),
        }));
        const others = dbStore.get('products').filter(p => p.factoryId !== factoryId);
        dbStore.set('products', [...mappedProducts, ...others]);
      }

      if (dbRawMaterials && dbRawMaterials.length > 0) {
        const mappedRM: RawMaterial[] = dbRawMaterials.map((r: any) => ({
          id: r.id,
          factoryId: r.factory_id,
          name: r.name,
          code: r.code,
          unit: r.unit_name as any,
          minimumStock: Number(r.minimum_stock) || 0,
          currentStock: Number(r.current_stock) || 0,
          averageUnitCost: Number(r.average_unit_cost) || 0,
          status: r.status || 'active',
          totalPurchased: 0,
          totalConsumed: 0,
          createdAt: r.created_at || new Date().toISOString(),
        }));
        const others = dbStore.get('rawMaterials').filter(r => r.factoryId !== factoryId);
        dbStore.set('rawMaterials', [...mappedRM, ...others]);
      }

      if (dbCustomers && dbCustomers.length > 0) {
        const mappedCust: Customer[] = dbCustomers.map((c: any) => ({
          id: c.id,
          factoryId: c.factory_id,
          customerName: c.name,
          companyName: c.company_name,
          phone: c.phone,
          address: c.address || 'Project Site',
          city: c.city || 'Pune',
          state: c.state || 'Maharashtra',
          creditLimit: Number(c.credit_limit) || 0,
          openingBalance: Number(c.opening_balance) || 0,
          currentBalance: Number(c.opening_balance) || 0,
          totalSales: 0,
          totalPaid: 0,
          totalPending: Number(c.opening_balance) || 0,
          status: c.status || 'active',
          createdAt: c.created_at || new Date().toISOString(),
        }));
        const others = dbStore.get('customers').filter(c => c.factoryId !== factoryId);
        dbStore.set('customers', [...mappedCust, ...others]);
      }

      if (dbVendors && dbVendors.length > 0) {
        const mappedVendors: Vendor[] = dbVendors.map((v: any) => ({
          id: v.id,
          factoryId: v.factory_id,
          vendorName: v.name,
          company: v.company_name,
          phone: v.phone,
          whatsapp: v.whatsapp,
          email: v.email,
          address: v.address || 'Industrial Area',
          city: v.city || 'Pune',
          state: v.state || 'Maharashtra',
          gstNumber: v.gst_number,
          materialsSupplied: Array.isArray(v.materials_supplied) ? v.materials_supplied : ['Cement', 'Fly Ash'],
          openingBalance: Number(v.opening_balance) || 0,
          currentBalance: Number(v.opening_balance) || 0,
          totalPurchases: Number(v.opening_balance) || 0,
          totalPaid: 0,
          totalPending: Number(v.opening_balance) || 0,
          status: v.status || 'active',
          createdAt: v.created_at,
        }));
        const others = dbStore.get('vendors').filter(v => v.factoryId !== factoryId);
        dbStore.set('vendors', [...mappedVendors, ...others]);
      }

      if (dbEmployees && dbEmployees.length > 0) {
        const mappedEmp: Employee[] = dbEmployees.map((e: any) => ({
          id: e.id,
          factoryId: e.factory_id,
          employeeCode: e.employee_code,
          name: e.name,
          phone: e.phone,
          address: e.address || 'Labour Camp',
          joiningDate: e.joining_date,
          jobType: e.job_type as any,
          wageType: e.wage_type,
          dailyWage: Number(e.daily_wage) || 0,
          pieceRatePerThousand: Number(e.piece_rate_per_thousand) || 0,
          status: e.status || 'active',
          createdAt: e.created_at,
        }));
        const others = dbStore.get('employees').filter(e => e.factoryId !== factoryId);
        dbStore.set('employees', [...mappedEmp, ...others]);
      }

      return true;
    } catch (err) {
      console.warn('Live factory data sync notice:', err);
      return false;
    }
  },

  /**
   * Ensures new factories are initialized with standard starter products & materials in Supabase
   */
  async ensureInitialFactoryData(factoryId: string): Promise<void> {
    if (!factoryId || factoryId.length !== 36) return;
    try {
      const client = supabase as any;
      const { data: existingProducts } = await client
        .from('products')
        .select('id')
        .eq('factory_id', factoryId)
        .limit(1);

      if (!existingProducts || existingProducts.length === 0) {
        await client.from('products').insert([
          {
            factory_id: factoryId,
            name: '4 Inch Fly Ash Brick',
            code: 'FAB-4IN',
            category: 'Fly Ash Brick',
            unit_name: 'Pcs',
            hsn_code: '681599',
            selling_price: 4.50,
            cost_price: 3.20,
            minimum_stock: 5000,
            status: 'active'
          },
          {
            factory_id: factoryId,
            name: '6 Inch Fly Ash Brick',
            code: 'FAB-6IN',
            category: 'Fly Ash Brick',
            unit_name: 'Pcs',
            hsn_code: '681599',
            selling_price: 6.80,
            cost_price: 4.90,
            minimum_stock: 3000,
            status: 'active'
          },
          {
            factory_id: factoryId,
            name: '8 Inch Hollow Concrete Block',
            code: 'HCB-8IN',
            category: 'Concrete Block',
            unit_name: 'Pcs',
            hsn_code: '681599',
            selling_price: 18.00,
            cost_price: 13.50,
            minimum_stock: 2000,
            status: 'active'
          }
        ]);

        await client.from('raw_materials').insert([
          {
            factory_id: factoryId,
            name: 'Fly Ash (Grade 1)',
            code: 'RM-FA',
            unit_name: 'Ton',
            minimum_stock: 25,
            average_unit_cost: 650,
            status: 'active'
          },
          {
            factory_id: factoryId,
            name: 'OPC 53 Grade Cement',
            code: 'RM-CEM',
            unit_name: 'Bags',
            minimum_stock: 100,
            average_unit_cost: 340,
            status: 'active'
          },
          {
            factory_id: factoryId,
            name: 'Crushed Stone Dust',
            code: 'RM-SD',
            unit_name: 'Brass',
            minimum_stock: 20,
            average_unit_cost: 2200,
            status: 'active'
          }
        ]);
      }
    } catch (e) {
      console.warn('Initial factory seed notice:', e);
    }
  }
};
