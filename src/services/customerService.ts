import { dbStore } from './mockDatabase';
import { Customer, Vendor } from '@/types';
import { generateId } from '@/utils/formatters';

export const customerService = {
  async getCustomers(factoryId: string): Promise<Customer[]> {
    await new Promise(res => setTimeout(res, 50));
    const customers = dbStore.get('customers');
    return customers.filter(c => c.factoryId === factoryId);
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const customers = dbStore.get('customers');
    return customers.find(c => c.id === id) || null;
  },

  async createCustomer(factoryId: string, payload: Omit<Customer, 'id' | 'factoryId' | 'createdAt' | 'currentBalance' | 'totalSales' | 'totalPaid' | 'totalPending'>): Promise<Customer> {
    await new Promise(res => setTimeout(res, 100));
    const customers = dbStore.get('customers');
    const openingBal = Number(payload.openingBalance) || 0;

    const newCust: Customer = {
      ...payload,
      id: generateId('cust'),
      factoryId,
      openingBalance: openingBal,
      currentBalance: openingBal,
      totalSales: 0,
      totalPaid: 0,
      totalPending: openingBal,
      createdAt: new Date().toISOString(),
    };

    dbStore.set('customers', [newCust, ...customers]);
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
    await new Promise(res => setTimeout(res, 50));
    const vendors = dbStore.get('vendors');
    return vendors.filter(v => v.factoryId === factoryId);
  },

  async getVendorById(id: string): Promise<Vendor | null> {
    const vendors = dbStore.get('vendors');
    return vendors.find(v => v.id === id) || null;
  },

  async createVendor(factoryId: string, payload: Omit<Vendor, 'id' | 'factoryId' | 'createdAt' | 'currentBalance' | 'totalPurchases' | 'totalPaid' | 'totalPending'>): Promise<Vendor> {
    await new Promise(res => setTimeout(res, 100));
    const vendors = dbStore.get('vendors');
    const openingBal = Number(payload.openingBalance) || 0;

    const newVendor: Vendor = {
      ...payload,
      id: generateId('ven'),
      factoryId,
      openingBalance: openingBal,
      currentBalance: openingBal,
      totalPurchases: 0,
      totalPaid: 0,
      totalPending: openingBal,
      createdAt: new Date().toISOString(),
    };

    dbStore.set('vendors', [newVendor, ...vendors]);
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
    return updated;
  },

  async getVendorTransactions(vendorId: string) {
    const purchases = dbStore.get('purchases').filter(p => p.vendorId === vendorId);
    const payments = dbStore.get('payments').filter(p => p.partyId === vendorId && p.partyType === 'vendor');
    return { purchases, payments };
  }
};
