import { 
  User, Factory, SubscriptionPlan, Product, RawMaterial, RawMaterialPurchase, 
  ProductionBatch, StockTransaction, Employee, AttendanceRecord, WageSlip, 
  Customer, Vendor, SaleOrder, Invoice, Expense, Payment, NotificationItem, 
  AuditLogItem 
} from '@/types';
import { generateUuid } from '@/utils/formatters';

const STORAGE_KEY = 'brickflow_erp_db_v1';

export interface DatabaseSchema {
  users: User[];
  factories: Factory[];
  plans: SubscriptionPlan[];
  products: Product[];
  rawMaterials: RawMaterial[];
  purchases: RawMaterialPurchase[];
  productionBatches: ProductionBatch[];
  stockTransactions: StockTransaction[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  wageSlips: WageSlip[];
  customers: Customer[];
  vendors: Vendor[];
  saleOrders: SaleOrder[];
  invoices: Invoice[];
  expenses: Expense[];
  payments: Payment[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
}

const EMPTY_SCHEMA: DatabaseSchema = {
  users: [],
  factories: [],
  plans: [],
  products: [],
  rawMaterials: [],
  purchases: [],
  productionBatches: [],
  stockTransactions: [],
  employees: [],
  attendance: [],
  wageSlips: [],
  customers: [],
  vendors: [],
  saleOrders: [],
  invoices: [],
  expenses: [],
  payments: [],
  notifications: [],
  auditLogs: [],
};

/**
 * Enterprise Database Reactive Cache Store
 * Zero static data, zero localStorage persistence of database entities.
 * Fully hydrated directly from Supabase PostgreSQL Cloud.
 */
class DatabaseStore {
  private db: DatabaseSchema;
  private listeners: Set<() => void> = new Set();
  private syncInProgress = false;

  constructor() {
    // Purge any legacy static mock data stored in client browser
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // ignore storage errors
      }
    }

    this.db = { ...EMPTY_SCHEMA };

    // Fetch live tables directly from Supabase PostgreSQL
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.syncFromSupabase();
      }, 10);
    }
  }

  public async syncFromSupabase(): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;
    try {
      const { supabaseSync } = await import('./supabaseSync');
      await supabaseSync.syncAllFromDatabase();
      this.notifyListeners();
    } catch (e) {
      console.warn('Supabase live database sync:', e);
    } finally {
      this.syncInProgress = false;
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (e) {
        console.error('Error notifying DB listener:', e);
      }
    });
  }

  public resetToDefault(): void {
    this.db = { ...EMPTY_SCHEMA };
    this.syncFromSupabase();
  }

  public reset(): void {
    this.resetToDefault();
  }

  public exportJSON(): string {
    return JSON.stringify(this.db, null, 2);
  }

  public importJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      this.db = parsed;
      this.notifyListeners();
      return true;
    } catch (e) {
      console.error('Error importing JSON into DB:', e);
      return false;
    }
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.db[key] || ([] as unknown as DatabaseSchema[K]);
  }

  public set<K extends keyof DatabaseSchema>(key: K, data: DatabaseSchema[K]): void {
    this.db[key] = data;
    this.notifyListeners();
  }

  public addAuditLog(
    factoryId: string, 
    userId: string, 
    userName: string, 
    userRole: any, 
    module: string, 
    action: any, 
    recordId: string, 
    recordTitle: string, 
    details: string
  ): void {
    const log: AuditLogItem = {
      id: generateUuid(),
      factoryId,
      userId,
      userName,
      userRole,
      module,
      action,
      recordId,
      recordTitle,
      details,
      timestamp: new Date().toISOString(),
    };
    this.db.auditLogs.unshift(log);
    this.notifyListeners();

    // Push to Supabase audit_logs table
    import('@/lib/supabase').then(({ supabase }) => {
      (supabase as any).from('audit_logs').insert({
        id: log.id,
        factory_id: factoryId.length === 36 ? factoryId : undefined,
        user_id: userId.length === 36 ? userId : undefined,
        user_name: userName,
        action,
        module,
        record_id: recordId,
        record_title: recordTitle,
        details,
      }).then();
    });
  }
}

export const dbStore = new DatabaseStore();
