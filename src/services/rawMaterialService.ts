import { dbStore } from './mockDatabase';
import { RawMaterial, RawMaterialPurchase, Vendor } from '@/types';
import { generateId, generateUuid } from '@/utils/formatters';

export const rawMaterialService = {
  async getRawMaterials(factoryId: string): Promise<RawMaterial[]> {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await (supabase as any)
        .from('raw_materials')
        .select('*')
        .eq('factory_id', factoryId);

      if (!error && data && data.length > 0) {
        const liveRM: RawMaterial[] = data.map((r: any) => ({
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
        dbStore.set('rawMaterials', [...liveRM, ...others]);
        return liveRM;
      }
    } catch (e) {
      console.warn('Raw materials live fetch notice:', e);
    }
    const rawMaterials = dbStore.get('rawMaterials');
    return rawMaterials.filter(r => r.factoryId === factoryId);
  },

  async getRawMaterialById(id: string): Promise<RawMaterial | null> {
    const rawMaterials = dbStore.get('rawMaterials');
    return rawMaterials.find(r => r.id === id) || null;
  },

  async createRawMaterial(factoryId: string, payload: Omit<RawMaterial, 'id' | 'factoryId' | 'createdAt' | 'totalPurchased' | 'totalConsumed'>): Promise<RawMaterial> {
    const rawMaterials = dbStore.get('rawMaterials');
    const newRM: RawMaterial = {
      ...payload,
      id: generateUuid(),
      factoryId,
      totalPurchased: payload.currentStock || 0,
      totalConsumed: 0,
      createdAt: new Date().toISOString(),
    };

    dbStore.set('rawMaterials', [newRM, ...rawMaterials]);

    // Push to Supabase Database
    import('@/lib/supabase').then(({ supabase }) => {
      (supabase as any).from('raw_materials').insert({
        id: newRM.id,
        factory_id: factoryId,
        name: newRM.name,
        code: newRM.code,
        unit_name: newRM.unit,
        minimum_stock: newRM.minimumStock,
        average_unit_cost: newRM.averageUnitCost,
        status: newRM.status,
      }).then();
    });

    dbStore.addAuditLog(factoryId, 'usr_current', 'User', 'factory_owner', 'Raw Materials', 'CREATE', newRM.id, newRM.name, `Added new raw material ${newRM.name} (${newRM.code})`);

    return newRM;
  },

  async updateRawMaterial(id: string, updates: Partial<RawMaterial>): Promise<RawMaterial> {
    await new Promise(res => setTimeout(res, 100));
    const rawMaterials = dbStore.get('rawMaterials');
    const index = rawMaterials.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Raw material not found');

    const updated = { ...rawMaterials[index], ...updates };
    rawMaterials[index] = updated;
    dbStore.set('rawMaterials', [...rawMaterials]);
    return updated;
  },

  async getPurchases(factoryId: string): Promise<RawMaterialPurchase[]> {
    await new Promise(res => setTimeout(res, 50));
    const purchases = dbStore.get('purchases');
    return purchases.filter(p => p.factoryId === factoryId);
  },

  async createPurchase(factoryId: string, payload: Omit<RawMaterialPurchase, 'id' | 'factoryId' | 'createdAt' | 'pendingAmount' | 'paymentStatus'> & { paidAmount: number }): Promise<RawMaterialPurchase> {
    await new Promise(res => setTimeout(res, 150));
    const purchases = dbStore.get('purchases');
    const rawMaterials = dbStore.get('rawMaterials');
    const vendors = dbStore.get('vendors');
    const payments = dbStore.get('payments');

    const totalAmount = payload.totalAmount || (payload.quantity * payload.rate);
    const paidAmount = Number(payload.paidAmount) || 0;
    const pendingAmount = Math.max(0, totalAmount - paidAmount);
    const paymentStatus = pendingAmount === 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending');

    const newPurchase: RawMaterialPurchase = {
      ...payload,
      id: generateId('pur'),
      factoryId,
      totalAmount,
      paidAmount,
      pendingAmount,
      paymentStatus,
      createdAt: new Date().toISOString(),
    };

    // 1. Update Raw Material Stock & Totals
    const rmIndex = rawMaterials.findIndex(r => r.id === payload.materialId);
    if (rmIndex !== -1) {
      const rm = rawMaterials[rmIndex];
      rm.currentStock += payload.quantity;
      rm.totalPurchased += payload.quantity;
      // Recalculate moving average cost
      rm.averageUnitCost = Math.round(((rm.averageUnitCost * (rm.currentStock - payload.quantity)) + (payload.rate * payload.quantity)) / rm.currentStock);
      rawMaterials[rmIndex] = rm;
      dbStore.set('rawMaterials', [...rawMaterials]);
    }

    // 2. Update Vendor Balance & Totals
    const vIndex = vendors.findIndex(v => v.id === payload.vendorId);
    if (vIndex !== -1) {
      const v = vendors[vIndex];
      v.totalPurchases += totalAmount;
      v.totalPaid += paidAmount;
      v.totalPending += pendingAmount;
      v.currentBalance += pendingAmount;
      vendors[vIndex] = v;
      dbStore.set('vendors', [...vendors]);
    }

    // 3. If paidAmount > 0, record in payments ledger
    if (paidAmount > 0) {
      payments.unshift({
        id: generateId('pay'),
        factoryId,
        date: payload.purchaseDate,
        partyType: 'vendor',
        partyId: payload.vendorId,
        partyName: payload.vendorName,
        paymentType: 'payment',
        amount: paidAmount,
        paymentMode: payload.paymentMode,
        reference: `Purchase PO Ref: ${newPurchase.truckNumber || 'Direct PO'}`,
        notes: payload.notes || `Advance/Payment for purchase of ${payload.quantity} ${payload.unit} ${payload.materialName}`,
        createdAt: new Date().toISOString(),
      });
      dbStore.set('payments', [...payments]);
    }

    dbStore.set('purchases', [newPurchase, ...purchases]);
    dbStore.addAuditLog(factoryId, 'usr_current', 'User', 'factory_owner', 'Raw Materials', 'CREATE', newPurchase.id, `PO #${newPurchase.truckNumber || newPurchase.id}`, `Purchased ${newPurchase.quantity} ${newPurchase.unit} ${newPurchase.materialName} from ${newPurchase.vendorName}. Paid ₹${paidAmount}, Pending ₹${pendingAmount}`);

    return newPurchase;
  },

  async getMaterialAnalytics(materialId: string) {
    const rm = await this.getRawMaterialById(materialId);
    if (!rm) throw new Error('Raw material not found');

    const purchases = dbStore.get('purchases').filter(p => p.materialId === materialId);
    const batches = dbStore.get('productionBatches').filter(b => 
      b.materialsUsed.some(m => m.materialId === materialId)
    );

    const consumptionHistory = batches.map(b => {
      const used = b.materialsUsed.find(m => m.materialId === materialId);
      return {
        date: b.productionDate,
        batchCode: b.batchCode,
        productName: b.productName,
        quantity: used?.quantity || 0,
        unit: used?.unit || rm.unit,
      };
    });

    return {
      material: rm,
      currentValue: rm.currentStock * rm.averageUnitCost,
      purchases,
      consumptionHistory,
    };
  }
};
