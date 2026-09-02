import { dbStore } from './mockDatabase';
import { formatINR } from '@/utils/formatters';
import { Factory, Product } from '@/types';

export const reportService = {
  async getDashboardKPIs(factoryId: string) {
    await new Promise(res => setTimeout(res, 50));
    const products = dbStore.get('products').filter(p => p.factoryId === factoryId);
    const rawMaterials = dbStore.get('rawMaterials').filter(r => r.factoryId === factoryId);
    const batches = dbStore.get('productionBatches').filter(b => b.factoryId === factoryId);
    const sales = dbStore.get('saleOrders').filter(s => s.factoryId === factoryId);
    const customers = dbStore.get('customers').filter(c => c.factoryId === factoryId);
    const vendors = dbStore.get('vendors').filter(v => v.factoryId === factoryId);
    const expenses = dbStore.get('expenses').filter(e => e.factoryId === factoryId);
    const attendance = dbStore.get('attendance').filter(a => a.factoryId === factoryId);
    const wageSlips = dbStore.get('wageSlips').filter(w => w.factoryId === factoryId);

    const todayStr = '2026-09-02'; // Current application date

    // 1. Production KPIs
    const todayBatches = batches.filter(b => b.productionDate === todayStr);
    const todayProduction = todayBatches.reduce((acc, b) => acc + b.outputQuantity, 0);
    const monthlyProduction = batches.reduce((acc, b) => acc + b.outputQuantity, 0);

    // 2. Sales KPIs
    const todaySalesOrders = sales.filter(s => s.saleDate === todayStr);
    const todaySales = todaySalesOrders.reduce((acc, s) => acc + s.grandTotal, 0);
    const monthlySales = sales.reduce((acc, s) => acc + s.grandTotal, 0);

    // 3. Stock KPIs
    const finishedStockQuantity = products.reduce((acc, p) => acc + p.currentStock, 0);
    const finishedStockValue = products.reduce((acc, p) => acc + (p.currentStock * p.sellingPrice), 0);
    const rawMaterialStockValue = rawMaterials.reduce((acc, r) => acc + (r.currentStock * r.averageUnitCost), 0);

    // 4. Receivables & Payables
    const customerReceivables = customers.reduce((acc, c) => acc + c.totalPending, 0);
    const vendorPayables = vendors.reduce((acc, v) => acc + v.totalPending, 0);

    // 5. Expenses & Labour
    const todayExpenses = expenses.filter(e => e.date === todayStr).reduce((acc, e) => acc + e.amount, 0);
    const monthlyExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const monthlyLabourCost = wageSlips.reduce((acc, w) => acc + w.grossAmount, 0);
    const pendingLabourWages = wageSlips.reduce((acc, w) => acc + w.pendingAmount, 0);

    // 6. Workers Present Today
    const todayAttendance = attendance.filter(a => a.date === todayStr);
    const presentWorkers = todayAttendance.filter(a => a.status === 'present' || a.status === 'half_day').length;
    const totalWorkers = dbStore.get('employees').filter(e => e.factoryId === factoryId && e.status === 'active').length;

    // 7. Production Trend Chart Data (Last 7 Days)
    const productionTrend = [
      { date: '27 Aug', flyAsh: 18000, redBrick: 12000, pavers: 4500, target: 30000 },
      { date: '28 Aug', flyAsh: 22000, redBrick: 14000, pavers: 5000, target: 30000 },
      { date: '29 Aug', flyAsh: 26000, redBrick: 15000, pavers: 6200, target: 30000 },
      { date: '30 Aug', flyAsh: 28500, redBrick: 18000, pavers: 5800, target: 30000 },
      { date: '31 Aug', flyAsh: 24000, redBrick: 16000, pavers: 4900, target: 30000 },
      { date: '01 Sep', flyAsh: 29500, redBrick: 20000, pavers: 6500, target: 30000 },
      { date: '02 Sep', flyAsh: 31450, redBrick: 19500, pavers: 4900, target: 30000 },
    ];

    // 8. Sales Trend Chart Data (Monthly)
    const salesTrend = [
      { month: 'Apr', sales: 420000, target: 500000, expenses: 280000 },
      { month: 'May', sales: 580000, target: 550000, expenses: 340000 },
      { month: 'Jun', sales: 650000, target: 600000, expenses: 390000 },
      { month: 'Jul', sales: 720000, target: 700000, expenses: 430000 },
      { month: 'Aug', sales: 890000, target: 800000, expenses: 510000 },
      { month: 'Sep (MTD)', sales: monthlySales, target: 900000, expenses: monthlyExpenses },
    ];

    // 9. Raw Material Consumption Distribution
    const rawMaterialBreakdown = [
      { name: 'Fly Ash', value: 38, cost: 245000, fill: '#64748B' },
      { name: 'OPC Cement', value: 34, cost: 425000, fill: '#E53935' },
      { name: 'Stone Dust', value: 16, cost: 115000, fill: '#C86D51' },
      { name: 'River Sand', value: 8, cost: 85000, fill: '#F59E0B' },
      { name: 'Gypsum & Additives', value: 4, cost: 35000, fill: '#10B981' },
    ];

    // 10. Low Stock Alerts
    const lowStockMaterials = rawMaterials.filter(r => r.currentStock <= r.minimumStock);
    const lowStockProducts = products.filter(p => p.currentStock <= p.minimumStock);

    return {
      todayProduction,
      monthlyProduction,
      todaySales,
      monthlySales,
      finishedStockQuantity,
      finishedStockValue,
      rawMaterialStockValue,
      customerReceivables,
      vendorPayables,
      todayExpenses,
      monthlyExpenses,
      monthlyLabourCost,
      pendingLabourWages,
      presentWorkers,
      totalWorkers,
      productionTrend,
      salesTrend,
      rawMaterialBreakdown,
      lowStockMaterials,
      lowStockProducts,
    };
  },

  async getProfitAndLoss(factoryId: string) {
    const kpis = await this.getDashboardKPIs(factoryId);
    const totalRevenue = kpis.monthlySales;
    const directMaterialCost = Math.round(totalRevenue * 0.42); // 42% raw materials
    const directLabourCost = kpis.monthlyLabourCost;
    const powerAndFuelCost = 68000;
    const factoryOverheads = kpis.monthlyExpenses;

    const totalCostOfGoods = directMaterialCost + directLabourCost + powerAndFuelCost;
    const grossProfit = totalRevenue - totalCostOfGoods;
    const netProfit = grossProfit - factoryOverheads;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

    return {
      totalRevenue,
      directMaterialCost,
      directLabourCost,
      powerAndFuelCost,
      totalCostOfGoods,
      grossProfit,
      factoryOverheads,
      netProfit,
      profitMargin,
    };
  }
};

export const notificationService = {
  async getNotifications(factoryId: string) {
    const notifs = dbStore.get('notifications');
    return notifs.filter(n => n.factoryId === factoryId);
  },

  async markAsRead(id: string) {
    const notifs = dbStore.get('notifications');
    const index = notifs.findIndex(n => n.id === id);
    if (index !== -1) {
      notifs[index].isRead = true;
      dbStore.set('notifications', [...notifs]);
    }
  },

  async markAllAsRead(factoryId: string) {
    const notifs = dbStore.get('notifications');
    notifs.forEach(n => {
      if (n.factoryId === factoryId) n.isRead = true;
    });
    dbStore.set('notifications', [...notifs]);
  },

  async getSuperAdminStats() {
    return superAdminService.getPlatformStats();
  }
};

export const superAdminService = {
  async getPlatformStats() {
    await new Promise(res => setTimeout(res, 50));
    const factories = dbStore.get('factories');
    const users = dbStore.get('users');
    const plans = dbStore.get('plans');

    const totalFactories = factories.length;
    const activeFactories = factories.filter(f => f.subscriptionStatus === 'active').length;
    const trialFactories = factories.filter(f => f.subscriptionStatus === 'trial').length;
    const expiredFactories = factories.filter(f => f.subscriptionStatus === 'expired' || f.subscriptionStatus === 'suspended').length;
    const totalUsers = users.length;
    const demoFactories = factories.filter(f => f.isDemo).length;

    // Calculate Platform MRR
    const mrr = factories.reduce((acc, f) => {
      if (f.subscriptionStatus !== 'active') return acc;
      const plan = plans.find(p => p.id === f.planId);
      return acc + (plan ? plan.price : 0);
    }, 0);

    return {
      totalFactories,
      activeFactories,
      trialFactories,
      expiredFactories,
      totalUsers,
      demoFactories,
      mrr,
      factories,
      users,
      plans,
    };
  },

  async updateFactoryStatus(factoryId: string, status: Factory['subscriptionStatus']) {
    const factories = dbStore.get('factories');
    const index = factories.findIndex(f => f.id === factoryId);
    if (index !== -1) {
      factories[index].subscriptionStatus = status;
      dbStore.set('factories', [...factories]);
    }
  },

  async extendSubscription(factoryId: string, months = 6) {
    const factories = dbStore.get('factories');
    const index = factories.findIndex(f => f.id === factoryId);
    if (index !== -1) {
      const current = new Date(factories[index].subscriptionExpiry || Date.now());
      current.setMonth(current.getMonth() + months);
      factories[index].subscriptionExpiry = current.toISOString().split('T')[0];
      factories[index].subscriptionStatus = 'active';
      dbStore.set('factories', [...factories]);
    }
  },

  async resetDemoData() {
    dbStore.resetToDefault();
  }
};
