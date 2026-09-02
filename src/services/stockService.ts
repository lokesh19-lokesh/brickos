import { dbStore } from './mockDatabase';
import { StockTransaction, StockTransactionType, Product } from '@/types';
import { generateId } from '@/utils/formatters';

export const stockService = {
  async getStockTransactions(factoryId: string): Promise<StockTransaction[]> {
    await new Promise(res => setTimeout(res, 50));
    const txns = dbStore.get('stockTransactions');
    return txns.filter(t => t.factoryId === factoryId);
  },

  async adjustStock(
    factoryId: string,
    productId: string,
    adjustmentType: 'adjustment' | 'damage' | 'return' | 'stock_in' | 'stock_out',
    quantity: number,
    notes: string,
    createdBy = 'Plant Manager'
  ): Promise<StockTransaction> {
    await new Promise(res => setTimeout(res, 100));
    const products = dbStore.get('products');
    const stockTxns = dbStore.get('stockTransactions');

    const prodIndex = products.findIndex(p => p.id === productId);
    if (prodIndex === -1) throw new Error('Product not found');

    const prod = products[prodIndex];
    let qtyIn = 0;
    let qtyOut = 0;

    if (adjustmentType === 'stock_in' || adjustmentType === 'return') {
      qtyIn = quantity;
      prod.currentStock += quantity;
    } else if (adjustmentType === 'damage' || adjustmentType === 'stock_out') {
      qtyOut = quantity;
      prod.currentStock = Math.max(0, prod.currentStock - quantity);
    } else {
      // Manual adjustment
      if (quantity >= 0) {
        qtyIn = quantity;
        prod.currentStock += quantity;
      } else {
        qtyOut = Math.abs(quantity);
        prod.currentStock = Math.max(0, prod.currentStock - qtyOut);
      }
    }

    products[prodIndex] = prod;
    dbStore.set('products', [...products]);

    const newTxn: StockTransaction = {
      id: generateId('stk'),
      factoryId,
      date: new Date().toISOString().split('T')[0],
      productId,
      productName: prod.name,
      transactionType: adjustmentType,
      quantityIn: qtyIn,
      quantityOut: qtyOut,
      balance: prod.currentStock,
      notes,
      createdBy,
      createdAt: new Date().toISOString(),
    };

    dbStore.set('stockTransactions', [newTxn, ...stockTxns]);
    dbStore.addAuditLog(
      factoryId,
      'usr_current',
      createdBy,
      'factory_manager',
      'Stock',
      'UPDATE',
      newTxn.id,
      prod.name,
      `Stock adjustment (${adjustmentType}): ${qtyIn > 0 ? `+${qtyIn}` : `-${qtyOut}`} ${prod.unit}. New balance: ${prod.currentStock}`
    );

    return newTxn;
  }
};
