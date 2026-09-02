import { dbStore } from './mockDatabase';
import { Factory, SubscriptionPlan } from '@/types';

export const factoryService = {
  async getFactory(factoryId: string): Promise<Factory | null> {
    await new Promise(res => setTimeout(res, 50));
    const factories = dbStore.get('factories');
    return factories.find(f => f.id === factoryId) || null;
  },

  async updateFactory(factoryId: string, updates: Partial<Factory>): Promise<Factory> {
    await new Promise(res => setTimeout(res, 100));
    const factories = dbStore.get('factories');
    const index = factories.findIndex(f => f.id === factoryId);
    if (index === -1) throw new Error('Factory not found');

    const updated = { ...factories[index], ...updates };
    factories[index] = updated;
    dbStore.set('factories', [...factories]);
    return updated;
  },

  async getPlans(): Promise<SubscriptionPlan[]> {
    return dbStore.get('plans');
  },
};
