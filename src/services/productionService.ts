import { dbStore } from './mockDatabase';
import { ProductionBatch, StockTransaction } from '@/types';
import { generateId } from '@/utils/formatters';

export const productionService = {
  async getBatches(factoryId: string): Promise<ProductionBatch[]> {
    await new Promise(res => setTimeout(res, 50));
    const batches = dbStore.get('productionBatches');
    return batches.filter(b => b.factoryId === factoryId);
  },

  async getBatchById(id: string): Promise<ProductionBatch | null> {
    const batches = dbStore.get('productionBatches');
    return batches.find(b => b.id === id) || null;
  },

  async createBatch(factoryId: string, payload: Omit<ProductionBatch, 'id' | 'factoryId' | 'createdAt'>): Promise<ProductionBatch> {
    await new Promise(res => setTimeout(res, 150));
    const batches = dbStore.get('productionBatches');
    const products = dbStore.get('products');
    const rawMaterials = dbStore.get('rawMaterials');
    const stockTxns = dbStore.get('stockTransactions');

    const newBatch: ProductionBatch = {
      ...payload,
      id: generateId('batch'),
      factoryId,
      createdAt: new Date().toISOString(),
    };

    // 1. If batch is completed or created with output > 0, update finished goods stock
    const prodIndex = products.findIndex(p => p.id === payload.productId);
    if (prodIndex !== -1 && (newBatch.status === 'completed' || newBatch.status === 'curing' || newBatch.status === 'in_progress')) {
      const prod = products[prodIndex];
      const newStock = prod.currentStock + newBatch.outputQuantity;
      prod.currentStock = newStock;
      products[prodIndex] = prod;
      dbStore.set('products', [...products]);

      // Stock transaction entry
      const txn: StockTransaction = {
        id: generateId('stk'),
        factoryId,
        date: newBatch.productionDate,
        productId: newBatch.productId,
        productName: newBatch.productName,
        batchCode: newBatch.batchCode,
        transactionType: 'production',
        quantityIn: newBatch.outputQuantity,
        quantityOut: 0,
        balance: newStock,
        referenceId: newBatch.id,
        referenceType: 'production_batch',
        notes: `Production Batch ${newBatch.batchCode} on ${newBatch.machineLine}`,
        createdBy: newBatch.supervisorName || 'Supervisor',
        createdAt: new Date().toISOString(),
      };
      dbStore.set('stockTransactions', [txn, ...stockTxns]);
    }

    // 2. Automatically deduct consumed raw materials
    if (newBatch.materialsUsed && newBatch.materialsUsed.length > 0) {
      newBatch.materialsUsed.forEach(mat => {
        const rmIndex = rawMaterials.findIndex(r => r.id === mat.materialId);
        if (rmIndex !== -1) {
          const rm = rawMaterials[rmIndex];
          rm.currentStock = Math.max(0, rm.currentStock - mat.quantity);
          rm.totalConsumed += mat.quantity;
          rawMaterials[rmIndex] = rm;
        }
      });
      dbStore.set('rawMaterials', [...rawMaterials]);
    }

    dbStore.set('productionBatches', [newBatch, ...batches]);
    dbStore.addAuditLog(
      factoryId,
      'usr_current',
      newBatch.supervisorName || 'Supervisor',
      'factory_manager',
      'Production',
      'CREATE',
      newBatch.id,
      `Batch ${newBatch.batchCode}`,
      `Recorded ${newBatch.outputQuantity} ${newBatch.unit} of ${newBatch.productName}. Raw materials deducted.`
    );

    return newBatch;
  },

  async updateBatchStatus(id: string, status: ProductionBatch['status']): Promise<ProductionBatch> {
    await new Promise(res => setTimeout(res, 100));
    const batches = dbStore.get('productionBatches');
    const index = batches.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Batch not found');

    const updated = { ...batches[index], status };
    batches[index] = updated;
    dbStore.set('productionBatches', [...batches]);

    dbStore.addAuditLog(
      updated.factoryId,
      'usr_current',
      'Plant Manager',
      'factory_manager',
      'Production',
      'STATUS_CHANGE',
      updated.id,
      `Batch ${updated.batchCode}`,
      `Changed batch status to ${status}`
    );

    return updated;
  }
};
