import { dbStore } from './mockDatabase';
import { SaleOrder, Invoice, StockTransaction, Payment, Customer } from '@/types';
import { generateId } from '@/utils/formatters';

export const salesService = {
  async getSales(factoryId: string): Promise<SaleOrder[]> {
    await new Promise(res => setTimeout(res, 50));
    const sales = dbStore.get('saleOrders');
    return sales.filter(s => s.factoryId === factoryId);
  },

  async getSaleById(id: string): Promise<SaleOrder | null> {
    const sales = dbStore.get('saleOrders');
    return sales.find(s => s.id === id) || null;
  },

  async createSale(
    factoryId: string,
    payload: Omit<SaleOrder, 'id' | 'factoryId' | 'createdAt' | 'pendingAmount' | 'paymentStatus'> & { 
      paidAmount: number;
      paymentMode?: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
      invoiceDueDate?: string;
    }
  ): Promise<{ saleOrder: SaleOrder; invoice: Invoice }> {
    await new Promise(res => setTimeout(res, 200));
    const sales = dbStore.get('saleOrders');
    const invoices = dbStore.get('invoices');
    const products = dbStore.get('products');
    const customers = dbStore.get('customers');
    const stockTxns = dbStore.get('stockTransactions');
    const payments = dbStore.get('payments');

    const paidAmount = Number(payload.paidAmount) || 0;
    const pendingAmount = Math.max(0, payload.grandTotal - paidAmount);
    const paymentStatus: SaleOrder['paymentStatus'] = pendingAmount === 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending');

    const newSale: SaleOrder = {
      ...payload,
      id: generateId('so'),
      factoryId,
      paidAmount,
      pendingAmount,
      paymentStatus,
      createdAt: new Date().toISOString(),
    };

    // 1. Deduct finished product stock for all line items & record in stock transactions
    payload.items.forEach(item => {
      const prodIndex = products.findIndex(p => p.id === item.productId);
      if (prodIndex !== -1) {
        const prod = products[prodIndex];
        prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
        products[prodIndex] = prod;

        const txn: StockTransaction = {
          id: generateId('stk'),
          factoryId,
          date: payload.saleDate,
          productId: item.productId,
          productName: item.productName,
          batchCode: item.batchCode,
          transactionType: 'sale',
          quantityIn: 0,
          quantityOut: item.quantity,
          balance: prod.currentStock,
          referenceId: newSale.id,
          referenceType: 'sales_order',
          notes: `Sale Dispatch to ${payload.customerName} (Inv #${payload.invoiceNumber})`,
          createdBy: 'Sales Desk',
          createdAt: new Date().toISOString(),
        };
        stockTxns.unshift(txn);
      }
    });
    dbStore.set('products', [...products]);
    dbStore.set('stockTransactions', [...stockTxns]);

    // 2. Update Customer balance
    const custIndex = customers.findIndex(c => c.id === payload.customerId);
    let customerAddress = 'Site Delivery';
    if (custIndex !== -1) {
      const cust = customers[custIndex];
      cust.totalSales += payload.grandTotal;
      cust.totalPaid += paidAmount;
      cust.totalPending += pendingAmount;
      cust.currentBalance += pendingAmount;
      customerAddress = cust.address;
      customers[custIndex] = cust;
      dbStore.set('customers', [...customers]);
    }

    // 3. Generate GST Tax Invoice
    const taxRate = payload.items[0]?.taxPercent || 12;
    const isInterState = payload.customerGst && !payload.customerGst.startsWith('27'); // 27 = Maharashtra
    const cgst = isInterState ? 0 : payload.taxTotal / 2;
    const sgst = isInterState ? 0 : payload.taxTotal / 2;
    const igst = isInterState ? payload.taxTotal : 0;

    const newInvoice: Invoice = {
      id: generateId('inv'),
      factoryId,
      invoiceNumber: payload.invoiceNumber,
      saleOrderId: newSale.id,
      invoiceDate: payload.saleDate,
      dueDate: payload.invoiceDueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customer: {
        id: payload.customerId,
        name: payload.customerName,
        company: custIndex !== -1 ? customers[custIndex].companyName : undefined,
        phone: payload.customerPhone,
        address: customerAddress,
        gstNumber: payload.customerGst,
      },
      items: payload.items.map(item => ({
        productId: item.productId,
        name: item.productName,
        hsnCode: item.hsnCode || '681599',
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        amount: item.amount,
        discount: item.discount || 0,
        taxRate: item.taxPercent,
        taxAmount: (item.amount * item.taxPercent) / 100,
        total: item.amount + (item.amount * item.taxPercent) / 100,
      })),
      subtotal: payload.subtotal,
      discount: payload.discountTotal,
      taxableAmount: payload.subtotal - payload.discountTotal,
      cgst,
      sgst,
      igst,
      grandTotal: payload.grandTotal,
      paidAmount,
      pendingAmount,
      status: paymentStatus === 'paid' ? 'paid' : (paymentStatus === 'partial' ? 'partial' : 'pending'),
      termsAndConditions: [
        'Payment terms: Net 15 days.',
        'Goods once sold and unloaded at site will not be taken back.',
        'Maximum permissible transit/unloading breakage is 2% as per brick industry standards.',
        'Interest @ 18% p.a. will be levied on overdue payments beyond credit period.',
      ],
      vehicleNumber: payload.deliveryDetails.vehicleNumber,
      createdAt: new Date().toISOString(),
    };

    // 4. Record payment if paidAmount > 0
    if (paidAmount > 0) {
      payments.unshift({
        id: generateId('pay'),
        factoryId,
        date: payload.saleDate,
        partyType: 'customer',
        partyId: payload.customerId,
        partyName: payload.customerName,
        paymentType: 'receipt',
        amount: paidAmount,
        paymentMode: payload.paymentMode || 'upi',
        reference: `Advance/Receipt for Inv #${payload.invoiceNumber}`,
        invoiceRef: payload.invoiceNumber,
        notes: payload.notes || `Received payment against dispatch`,
        createdAt: new Date().toISOString(),
      });
      dbStore.set('payments', [...payments]);
    }

    dbStore.set('saleOrders', [newSale, ...sales]);
    dbStore.set('invoices', [newInvoice, ...invoices]);

    dbStore.addAuditLog(
      factoryId,
      'usr_current',
      'Factory Owner',
      'factory_owner',
      'Sales & Invoices',
      'CREATE',
      newSale.id,
      `Invoice #${newSale.invoiceNumber}`,
      `Created sale order & invoice for ${newSale.customerName}: Total ₹${newSale.grandTotal}, Paid ₹${paidAmount}, Pending ₹${pendingAmount}. Stock deducted.`
    );

    return { saleOrder: newSale, invoice: newInvoice };
  }
};

export const invoiceService = {
  async getInvoices(factoryId: string): Promise<Invoice[]> {
    await new Promise(res => setTimeout(res, 50));
    const invoices = dbStore.get('invoices');
    return invoices.filter(i => i.factoryId === factoryId);
  },

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const invoices = dbStore.get('invoices');
    return invoices.find(i => i.id === id || i.invoiceNumber === id) || null;
  },

  async recordInvoicePayment(invoiceId: string, amount: number, paymentMode: Payment['paymentMode'], reference?: string): Promise<Invoice> {
    await new Promise(res => setTimeout(res, 100));
    const invoices = dbStore.get('invoices');
    const sales = dbStore.get('saleOrders');
    const customers = dbStore.get('customers');
    const payments = dbStore.get('payments');

    const invIndex = invoices.findIndex(i => i.id === invoiceId);
    if (invIndex === -1) throw new Error('Invoice not found');

    const invoice = invoices[invIndex];
    invoice.paidAmount += amount;
    invoice.pendingAmount = Math.max(0, invoice.grandTotal - invoice.paidAmount);
    invoice.status = invoice.pendingAmount === 0 ? 'paid' : 'partial';

    // Update sale order
    const saleIndex = sales.findIndex(s => s.id === invoice.saleOrderId);
    if (saleIndex !== -1) {
      sales[saleIndex].paidAmount = invoice.paidAmount;
      sales[saleIndex].pendingAmount = invoice.pendingAmount;
      sales[saleIndex].paymentStatus = invoice.status === 'paid' ? 'paid' : 'partial';
      dbStore.set('saleOrders', [...sales]);
    }

    // Update customer balance
    const custIndex = customers.findIndex(c => c.id === invoice.customer.id);
    if (custIndex !== -1) {
      customers[custIndex].totalPaid += amount;
      customers[custIndex].totalPending = Math.max(0, customers[custIndex].totalPending - amount);
      customers[custIndex].currentBalance = Math.max(0, customers[custIndex].currentBalance - amount);
      dbStore.set('customers', [...customers]);
    }

    // Record payment receipt
    payments.unshift({
      id: generateId('pay'),
      factoryId: invoice.factoryId,
      date: new Date().toISOString().split('T')[0],
      partyType: 'customer',
      partyId: invoice.customer.id,
      partyName: invoice.customer.name,
      paymentType: 'receipt',
      amount,
      paymentMode,
      reference: reference || `Receipt for Inv #${invoice.invoiceNumber}`,
      invoiceRef: invoice.invoiceNumber,
      notes: `Payment against invoice ${invoice.invoiceNumber}`,
      createdAt: new Date().toISOString(),
    });
    dbStore.set('payments', [...payments]);

    invoices[invIndex] = invoice;
    dbStore.set('invoices', [...invoices]);

    return invoice;
  }
};
