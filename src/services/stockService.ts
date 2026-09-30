import { dbStore } from './mockDatabase';
import { StockTransaction, StockTransactionType, Product } from '@/types';
import { generateUuid } from '@/utils/formatters';

export const stockService = {
  async getStockTransactions(factoryId: string): Promise<StockTransaction[]> {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await (supabase as any)
        .from('finished_stock_transactions')
        .select('*')
        .eq('factory_id', factoryId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const products = dbStore.get('products');
        const liveTxns: StockTransaction[] = data.map((t: any) => {
          const prod = products.find(p => p.id === t.product_id);
          const isStockIn = t.transaction_type === 'stock_in' || t.transaction_type === 'production' || t.transaction_type === 'return';
          return {
            id: t.id,
            factoryId: t.factory_id,
            date: t.transaction_date,
            productId: t.product_id,
            productName: prod?.name || 'Manufactured Item',
            batchCode: t.batch_code,
            transactionType: t.transaction_type,
            quantityIn: isStockIn ? Number(t.quantity) || 0 : 0,
            quantityOut: !isStockIn ? Number(t.quantity) || 0 : 0,
            balance: Number(t.quantity) || 0,
            notes: t.notes,
            createdBy: t.created_by || 'Plant System',
            createdAt: t.created_at,
          };
        });
        const others = dbStore.get('stockTransactions').filter(t => t.factoryId !== factoryId);
        dbStore.set('stockTransactions', [...liveTxns, ...others]);
        return liveTxns;
      }
    } catch (e) {
      console.warn('Stock transactions live fetch notice:', e);
    }
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
      id: generateUuid(),
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

    // Push to Supabase Database
    import('@/lib/supabase').then(({ supabase }) => {
      (supabase as any).from('finished_stock_transactions').insert({
        id: newTxn.id,
        factory_id: factoryId,
        product_id: productId,
        transaction_type: adjustmentType,
        quantity: qtyIn > 0 ? qtyIn : qtyOut,
        transaction_date: newTxn.date,
        notes,
      }).then();
    });

    dbStore.addAuditLog(
      factoryId,
      'usr_current',
      createdBy,
      'factory_owner',
      'Stock',
      'UPDATE',
      newTxn.id,
      prod.name,
      `Stock adjustment (${adjustmentType}): ${qtyIn > 0 ? `+${qtyIn}` : `-${qtyOut}`} ${prod.unit}. New balance: ${prod.currentStock}`
    );

    return newTxn;
  }
};
