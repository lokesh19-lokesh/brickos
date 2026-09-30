import { dbStore } from './mockDatabase';
import { Factory, SubscriptionPlan } from '@/types';

export const factoryService = {
  async getFactory(factoryId: string): Promise<Factory | null> {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await (supabase as any)
        .from('factories')
        .select('*')
        .eq('id', factoryId)
        .maybeSingle();

      if (!error && data) {
        const fac: Factory = {
          id: data.id,
          name: data.name,
          code: data.code,
          ownerName: data.owner_name || 'Plant Owner',
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          gstNumber: data.gst_number,
          factoryType: data.factory_type,
          employeesCount: data.employee_count,
          dailyCapacity: data.daily_capacity,
          mainProducts: data.main_products || [],
          planId: 'plan_standard',
          subscriptionStatus: data.status === 'active' ? 'active' : 'trial',
          isDemo: !!data.is_demo,
          createdAt: data.created_at,
          bankDetails: data.bank_details || {},
        };
        const factories = dbStore.get('factories').filter(f => f.id !== factoryId);
        dbStore.set('factories', [fac, ...factories]);
        return fac;
      }
    } catch (e) {
      console.warn('Factory live fetch notice:', e);
    }
    const factories = dbStore.get('factories');
    return factories.find(f => f.id === factoryId) || null;
  },

  async updateFactory(factoryId: string, updates: Partial<Factory>): Promise<Factory> {
    const factories = dbStore.get('factories');
    const index = factories.findIndex(f => f.id === factoryId);
    const existing = index !== -1 ? factories[index] : ({} as Factory);
    const updated = { ...existing, ...updates, id: factoryId };
    
    if (index !== -1) {
      factories[index] = updated;
      dbStore.set('factories', [...factories]);
    }

    try {
      const { supabase } = await import('@/lib/supabase');
      await (supabase as any).from('factories').update({
        name: updated.name,
        code: updated.code,
        phone: updated.phone,
        email: updated.email,
        address: updated.address,
        city: updated.city,
        state: updated.state,
        pincode: updated.pincode,
        gst_number: updated.gstNumber,
        factory_type: updated.factoryType,
        employee_count: updated.employeesCount,
        daily_capacity: updated.dailyCapacity,
        main_products: updated.mainProducts,
        bank_details: updated.bankDetails,
      }).eq('id', factoryId);
    } catch (e) {
      console.warn('Factory live update notice:', e);
    }

    return updated;
  },

  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await (supabase as any).from('subscription_plans').select('*');
      if (!error && data && data.length > 0) {
        const plans: SubscriptionPlan[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price) || 0,
          billingCycle: p.billing_period || 'monthly',
          maxUsers: p.max_users || 5,
          maxMonthlyProduction: p.max_monthly_production || 'Unlimited',
          features: Array.isArray(p.features) ? p.features : [],
          isPopular: !!p.is_popular,
          status: p.status || 'active',
        }));
        dbStore.set('plans', plans);
        return plans;
      }
    } catch (e) {
      console.warn('Plans live fetch notice:', e);
    }
    return dbStore.get('plans');
  },
};
