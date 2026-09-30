import { dbStore } from './mockDatabase';
import { ProductionBatch, StockTransaction } from '@/types';
import { generateId, generateUuid } from '@/utils/formatters';

export const productionService = {
  async getBatches(factoryId: string): Promise<ProductionBatch[]> {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await (supabase as any)
        .from('production_batches')
        .select('*')
        .eq('factory_id', factoryId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const liveBatches: ProductionBatch[] = data.map((b: any) => ({
          id: b.id,
          factoryId: b.factory_id,
          batchCode: b.batch_code,
          productionDate: b.production_date,
          productId: b.product_id,
          productName: 'Fly Ash Brick',
          targetQuantity: Number(b.target_quantity) || 0,
          outputQuantity: Number(b.output_quantity) || 0,
          damagedQuantity: Number(b.damaged_quantity) || 0,
          unit: b.unit_name || 'Pcs',
          machineLine: b.machine_line || 'Automatic Line 1',
          kilnChamber: b.kiln_chamber || 'Chamber 1',
          supervisorName: b.supervisor_name || 'Plant Supervisor',
          mixProportion: b.mix_proportion || 'Standard Mix (60-20-20)',
          workersCount: Number(b.worker_count) || 8,
          status: b.status || 'completed',
          qualityGrade: b.quality_grade || 'A Grade',
          remarks: b.remarks || '',
          materialsUsed: [],
          workersInvolved: [],
          createdAt: b.created_at || new Date().toISOString(),
        }));
        const others = dbStore.get('productionBatches').filter(b => b.factoryId !== factoryId);
        dbStore.set('productionBatches', [...liveBatches, ...others]);
        return liveBatches;
      }
    } catch (e) {
      console.warn('Production batches live fetch notice:', e);
    }
    const batches = dbStore.get('productionBatches');
    return batches.filter(b => b.factoryId === factoryId);
  },

  async getBatchById(id: string): Promise<ProductionBatch | null> {
    const batches = dbStore.get('productionBatches');
    return batches.find(b => b.id === id) || null;
  },

  async createBatch(factoryId: string, payload: Omit<ProductionBatch, 'id' | 'factoryId' | 'createdAt'>): Promise<ProductionBatch> {
    const batches = dbStore.get('productionBatches');
    const products = dbStore.get('products');
    const rawMaterials = dbStore.get('rawMaterials');
    const stockTxns = dbStore.get('stockTransactions');

    const newBatch: ProductionBatch = {
      ...payload,
      id: generateUuid(),
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

    // Push batch to Supabase Database
    import('./supabaseSync').then(({ supabaseSync }) => {
      supabaseSync.pushProductionBatchToDatabase(newBatch);
    });

    dbStore.addAuditLog(
      factoryId,
      'usr_current',
      newBatch.supervisorName || 'Factory Owner',
      'factory_owner',
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

    import('@/lib/supabase').then(({ supabase }) => {
      (supabase as any).from('production_batches').update({ status }).eq('id', id).then();
    });

    dbStore.addAuditLog(
      updated.factoryId,
      'usr_current',
      'Factory Owner',
      'factory_owner',
      'Production',
      'STATUS_CHANGE',
      updated.id,
      `Batch ${updated.batchCode}`,
      `Changed batch status to ${status}`
    );

    return updated;
  }
};
