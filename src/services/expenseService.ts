import { dbStore } from './mockDatabase';
import { Expense, Payment } from '@/types';
import { generateId } from '@/utils/formatters';

export const expenseService = {
  async getExpenses(factoryId: string): Promise<Expense[]> {
    await new Promise(res => setTimeout(res, 50));
    const expenses = dbStore.get('expenses');
    return expenses.filter(e => e.factoryId === factoryId);
  },

  async createExpense(factoryId: string, payload: Omit<Expense, 'id' | 'factoryId' | 'createdAt'>): Promise<Expense> {
    await new Promise(res => setTimeout(res, 100));
    const expenses = dbStore.get('expenses');
    const payments = dbStore.get('payments');

    const newExpense: Expense = {
      ...payload,
      id: generateId('exp'),
      factoryId,
      createdAt: new Date().toISOString(),
    };

    // Log in payments ledger as expense payout
    payments.unshift({
      id: generateId('pay'),
      factoryId,
      date: payload.date,
      partyType: 'expense',
      partyId: newExpense.id,
      partyName: `${payload.category} - ${payload.recipientName || payload.description.substring(0, 30)}`,
      paymentType: 'payment',
      amount: payload.amount,
      paymentMode: payload.paymentMode,
      reference: payload.reference,
      notes: payload.description,
      createdAt: new Date().toISOString(),
    });

    dbStore.set('payments', [...payments]);
    dbStore.set('expenses', [newExpense, ...expenses]);

    dbStore.addAuditLog(
      factoryId,
      'usr_current',
      payload.paidBy || 'Accountant',
      'factory_user',
      'Expenses',
      'CREATE',
      newExpense.id,
      payload.category,
      `Recorded expense ₹${payload.amount} for ${payload.description}`
    );

    return newExpense;
  },

  async deleteExpense(id: string): Promise<void> {
    await new Promise(res => setTimeout(res, 100));
    const expenses = dbStore.get('expenses');
    dbStore.set('expenses', expenses.filter(e => e.id !== id));
  }
};

export const paymentService = {
  async getPayments(factoryId: string): Promise<Payment[]> {
    await new Promise(res => setTimeout(res, 50));
    const payments = dbStore.get('payments');
    return payments.filter(p => p.factoryId === factoryId);
  },

  async createPayment(factoryId: string, payload: Omit<Payment, 'id' | 'factoryId' | 'createdAt'>): Promise<Payment> {
    await new Promise(res => setTimeout(res, 100));
    const payments = dbStore.get('payments');
    const customers = dbStore.get('customers');
    const vendors = dbStore.get('vendors');

    const newPayment: Payment = {
      ...payload,
      id: generateId('pay'),
      factoryId,
      createdAt: new Date().toISOString(),
    };

    // If customer receipt, reduce customer receivable
    if (payload.partyType === 'customer') {
      const cIndex = customers.findIndex(c => c.id === payload.partyId);
      if (cIndex !== -1) {
        customers[cIndex].totalPaid += payload.amount;
        customers[cIndex].totalPending = Math.max(0, customers[cIndex].totalPending - payload.amount);
        customers[cIndex].currentBalance = Math.max(0, customers[cIndex].currentBalance - payload.amount);
        dbStore.set('customers', [...customers]);
      }
    }

    // If vendor payment, reduce vendor payable
    if (payload.partyType === 'vendor') {
      const vIndex = vendors.findIndex(v => v.id === payload.partyId);
      if (vIndex !== -1) {
        vendors[vIndex].totalPaid += payload.amount;
        vendors[vIndex].totalPending = Math.max(0, vendors[vIndex].totalPending - payload.amount);
        vendors[vIndex].currentBalance = Math.max(0, vendors[vIndex].currentBalance - payload.amount);
        dbStore.set('vendors', [...vendors]);
      }
    }

    dbStore.set('payments', [newPayment, ...payments]);

    dbStore.addAuditLog(
      factoryId,
      'usr_current',
      'Accountant',
      'factory_user',
      'Payments',
      'PAYMENT',
      newPayment.id,
      payload.partyName,
      `Processed ${payload.paymentType} of ₹${payload.amount} for ${payload.partyName} via ${payload.paymentMode.toUpperCase()}`
    );

    return newPayment;
  }
};
