import { dbStore } from './mockDatabase';
import { Expense, Payment } from '@/types';
import { generateId, generateUuid } from '@/utils/formatters';

export const expenseService = {
  async getExpenses(factoryId: string): Promise<Expense[]> {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await (supabase as any)
        .from('expenses')
        .select('*')
        .eq('factory_id', factoryId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const liveExpenses: Expense[] = data.map((e: any) => ({
          id: e.id,
          factoryId: e.factory_id,
          date: e.expense_date,
          category: e.category_name as any,
          description: e.description,
          amount: Number(e.amount) || 0,
          paymentMode: e.payment_mode as any,
          paidBy: e.paid_by || 'Supervisor',
          recipientName: e.recipient_name,
          notes: e.notes,
          createdAt: e.created_at || new Date().toISOString(),
        }));
        const others = dbStore.get('expenses').filter(e => e.factoryId !== factoryId);
        dbStore.set('expenses', [...liveExpenses, ...others]);
        return liveExpenses;
      }
    } catch (e) {
      console.warn('Expense live fetch notice:', e);
    }
    const expenses = dbStore.get('expenses');
    return expenses.filter(e => e.factoryId === factoryId);
  },

  async createExpense(factoryId: string, payload: Omit<Expense, 'id' | 'factoryId' | 'createdAt'>): Promise<Expense> {
    const expenses = dbStore.get('expenses');
    const payments = dbStore.get('payments');

    const newExpense: Expense = {
      ...payload,
      id: generateUuid(),
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

    import('./supabaseSync').then(({ supabaseSync }) => {
      supabaseSync.pushExpenseToDatabase(newExpense);
    });

    dbStore.addAuditLog(
      factoryId,
      'usr_current',
      payload.paidBy || 'Factory Owner',
      'factory_owner',
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
    import('@/lib/supabase').then(({ supabase }) => {
      supabase.from('expenses').delete().eq('id', id).then();
    });
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
      'Factory Owner',
      'factory_owner',
      'Payments',
      'PAYMENT',
      newPayment.id,
      payload.partyName,
      `Processed ${payload.paymentType} of ₹${payload.amount} for ${payload.partyName} via ${payload.paymentMode.toUpperCase()}`
    );

    return newPayment;
  }
};
