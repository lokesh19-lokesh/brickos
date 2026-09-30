import { dbStore } from './mockDatabase';
import { Customer, Vendor } from '@/types';
import { generateUuid } from '@/utils/formatters';

export const customerService = {
  async getCustomers(factoryId: string): Promise<Customer[]> {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await (supabase as any)
        .from('customers')
        .select('*')
        .eq('factory_id', factoryId);

      if (!error && data && data.length > 0) {
        const liveCustomers: Customer[] = data.map((c: any) => ({
          id: c.id,
          factoryId: c.factory_id,
          customerName: c.name,
          companyName: c.company_name,
          phone: c.phone,
          whatsapp: c.whatsapp,
          email: c.email,
          address: c.address || '',
          city: c.city || '',
          state: c.state || '',
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
        dbStore.set('customers', [...liveCustomers, ...others]);
        return liveCustomers;
      }
    } catch (e) {
      console.warn('Customer live fetch notice:', e);
    }
    const customers = dbStore.get('customers');
    return customers.filter(c => c.factoryId === factoryId);
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const customers = dbStore.get('customers');
    return customers.find(c => c.id === id) || null;
  },

  async createCustomer(factoryId: string, payload: Omit<Customer, 'id' | 'factoryId' | 'createdAt' | 'currentBalance' | 'totalSales' | 'totalPaid' | 'totalPending'>): Promise<Customer> {
    const customers = dbStore.get('customers');
    const openingBal = Number(payload.openingBalance) || 0;

    const newCust: Customer = {
      ...payload,
      id: generateUuid(),
      factoryId,
      openingBalance: openingBal,
      currentBalance: openingBal,
      totalSales: 0,
      totalPaid: 0,
      totalPending: openingBal,
      createdAt: new Date().toISOString(),
    };

    dbStore.set('customers', [newCust, ...customers]);

    // Push to Supabase Database
    import('./supabaseSync').then(({ supabaseSync }) => {
      supabaseSync.pushCustomerToDatabase(newCust);
    });

    dbStore.addAuditLog(factoryId, 'usr_current', 'Owner', 'factory_owner', 'Customers', 'CREATE', newCust.id, newCust.customerName, `Created customer ${newCust.customerName} (${newCust.companyName || 'Individual'}) with opening balance ₹${openingBal}`);

    return newCust;
  },

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    await new Promise(res => setTimeout(res, 100));
    const customers = dbStore.get('customers');
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');

    const updated = { ...customers[index], ...updates };
    customers[index] = updated;
    dbStore.set('customers', [...customers]);

    import('@/lib/supabase').then(({ supabase }) => {
      (supabase as any).from('customers').update({
        name: updated.customerName,
        phone: updated.phone,
        credit_limit: updated.creditLimit,
        status: updated.status,
      }).eq('id', updated.id).then();
    });

    return updated;
  },

  async getCustomerTransactions(customerId: string) {
    const invoices = dbStore.get('invoices').filter(i => i.customer.id === customerId);
    const payments = dbStore.get('payments').filter(p => p.partyId === customerId && p.partyType === 'customer');
    return { invoices, payments };
  }
};

export const vendorService = {
  async getVendors(factoryId: string): Promise<Vendor[]> {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await (supabase as any)
        .from('vendors')
        .select('*')
        .eq('factory_id', factoryId);

      if (!error && data && data.length > 0) {
        const liveVendors: Vendor[] = data.map((v: any) => ({
          id: v.id,
          factoryId: v.factory_id,
          vendorName: v.name,
          company: v.company_name,
          phone: v.phone,
          whatsapp: v.whatsapp,
          email: v.email,
          address: v.address || '',
          city: v.city || '',
          state: v.state || '',
          gstNumber: v.gst_number,
          materialsSupplied: Array.isArray(v.materials_supplied) ? v.materials_supplied : [],
          openingBalance: Number(v.opening_balance) || 0,
          currentBalance: Number(v.opening_balance) || 0,
          totalPurchases: Number(v.opening_balance) || 0,
          totalPaid: 0,
          totalPending: Number(v.opening_balance) || 0,
          status: v.status || 'active',
          createdAt: v.created_at,
        }));
        const others = dbStore.get('vendors').filter(v => v.factoryId !== factoryId);
        dbStore.set('vendors', [...liveVendors, ...others]);
        return liveVendors;
      }
    } catch (e) {
      console.warn('Vendor live fetch notice:', e);
    }
    const vendors = dbStore.get('vendors');
    return vendors.filter(v => v.factoryId === factoryId);
  },

  async getVendorById(id: string): Promise<Vendor | null> {
    const vendors = dbStore.get('vendors');
    return vendors.find(v => v.id === id) || null;
  },

  async createVendor(factoryId: string, payload: Omit<Vendor, 'id' | 'factoryId' | 'createdAt' | 'currentBalance' | 'totalPurchases' | 'totalPaid' | 'totalPending'>): Promise<Vendor> {
    const vendors = dbStore.get('vendors');
    const openingBal = Number(payload.openingBalance) || 0;

    const newVendor: Vendor = {
      ...payload,
      id: generateUuid(),
      factoryId,
      openingBalance: openingBal,
      currentBalance: openingBal,
      totalPurchases: 0,
      totalPaid: 0,
      totalPending: openingBal,
      createdAt: new Date().toISOString(),
    };

    dbStore.set('vendors', [newVendor, ...vendors]);

    import('./supabaseSync').then(({ supabaseSync }) => {
      supabaseSync.pushVendorToDatabase(newVendor);
    });

    dbStore.addAuditLog(factoryId, 'usr_current', 'Owner', 'factory_owner', 'Vendors', 'CREATE', newVendor.id, newVendor.vendorName, `Added vendor ${newVendor.vendorName} (${newVendor.company})`);

    return newVendor;
  },

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
    await new Promise(res => setTimeout(res, 100));
    const vendors = dbStore.get('vendors');
    const index = vendors.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Vendor not found');

    const updated = { ...vendors[index], ...updates };
    vendors[index] = updated;
    dbStore.set('vendors', [...vendors]);

    import('@/lib/supabase').then(({ supabase }) => {
      (supabase as any).from('vendors').update({
        name: updated.vendorName,
        phone: updated.phone,
        status: updated.status,
      }).eq('id', updated.id).then();
    });

    return updated;
  },

  async getVendorTransactions(vendorId: string) {
    const purchases = dbStore.get('purchases').filter(p => p.vendorId === vendorId);
    const payments = dbStore.get('payments').filter(p => p.partyId === vendorId && p.partyType === 'vendor');
    return { purchases, payments };
  }
};
