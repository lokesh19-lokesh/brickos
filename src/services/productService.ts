import { dbStore } from './mockDatabase';
import { Product } from '@/types';
import { generateId } from '@/utils/formatters';

export const productService = {
  async getProducts(factoryId: string): Promise<Product[]> {
    await new Promise(res => setTimeout(res, 50));
    const products = dbStore.get('products');
    return products.filter(p => p.factoryId === factoryId);
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = dbStore.get('products');
    return products.find(p => p.id === id) || null;
  },

  async createProduct(factoryId: string, payload: Omit<Product, 'id' | 'factoryId' | 'createdAt' | 'currentStock'> & { initialStock?: number }): Promise<Product> {
    await new Promise(res => setTimeout(res, 100));
    const products = dbStore.get('products');
    const newProduct: Product = {
      ...payload,
      id: generateId('prod'),
      factoryId,
      currentStock: payload.initialStock || 0,
      createdAt: new Date().toISOString(),
    };

    dbStore.set('products', [newProduct, ...products]);

    // Push to Supabase Database
    import('./supabaseSync').then(({ supabaseSync }) => {
      supabaseSync.pushProductToDatabase(newProduct);
    });

    // Record initial stock transaction if stock > 0
    if (newProduct.currentStock > 0) {
      const stockTxns = dbStore.get('stockTransactions');
      stockTxns.unshift({
        id: generateId('stk'),
        factoryId,
        date: new Date().toISOString().split('T')[0],
        productId: newProduct.id,
        productName: newProduct.name,
        transactionType: 'stock_in',
        quantityIn: newProduct.currentStock,
        quantityOut: 0,
        balance: newProduct.currentStock,
        notes: 'Initial opening stock upon product creation',
        createdBy: 'System Admin',
        createdAt: new Date().toISOString(),
      });
      dbStore.set('stockTransactions', [...stockTxns]);
    }

    dbStore.addAuditLog(factoryId, 'usr_current', 'User', 'factory_owner', 'Products', 'CREATE', newProduct.id, newProduct.name, `Created product ${newProduct.name} (${newProduct.code}) with initial stock ${newProduct.currentStock}`);

    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await new Promise(res => setTimeout(res, 100));
    const products = dbStore.get('products');
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');

    const updated = { ...products[index], ...updates };
    products[index] = updated;
    dbStore.set('products', [...products]);

    import('@/lib/supabase').then(({ supabase }) => {
      (supabase as any).from('products').update({
        name: updated.name,
        selling_price: updated.sellingPrice,
        cost_price: updated.costPrice,
        minimum_stock: updated.minimumStock,
        status: updated.status,
      }).eq('id', updated.id).then();
    });

    dbStore.addAuditLog(updated.factoryId, 'usr_current', 'User', 'factory_owner', 'Products', 'UPDATE', updated.id, updated.name, `Updated product attributes for ${updated.name}`);

    return updated;
  },

  async deleteProduct(id: string): Promise<void> {
    await new Promise(res => setTimeout(res, 100));
    const products = dbStore.get('products');
    const prod = products.find(p => p.id === id);
    if (prod) {
      dbStore.set('products', products.filter(p => p.id !== id));
      import('@/lib/supabase').then(({ supabase }) => {
        supabase.from('products').delete().eq('id', id).then();
      });
      dbStore.addAuditLog(prod.factoryId, 'usr_current', 'User', 'factory_owner', 'Products', 'DELETE', prod.id, prod.name, `Deleted product ${prod.name}`);
    }
  },

  async toggleStatus(id: string): Promise<Product> {
    const product = await this.getProductById(id);
    if (!product) throw new Error('Product not found');
    return this.updateProduct(id, {
      status: product.status === 'active' ? 'inactive' : 'active',
    });
  }
};
