import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Eye, Power } from 'lucide-react';
import { productService } from '@/services/productService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Product } from '@/types';
import { formatINR, formatQuantity } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, CurrencyInput, QuantityInput } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Card';
import { PageHeader, ConfirmDialog } from '@/components/ui/PageHeader';

export const ProductsPage: React.FC = () => {
  const { factory } = useAuth();
  const { toast } = useToast();
  const factoryId = factory?.id || 'fact_01';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Fly Ash Brick' as Product['category'],
    unit: 'Pcs',
    hsnCode: '681599',
    sellingPrice: 4.8,
    costPrice: 3.1,
    minimumStock: 10000,
    initialStock: 25000,
    dimensions: '9 x 4 x 3 Inch',
    description: '',
    status: 'active' as Product['status'],
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts(factoryId);
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    const unsub = dbStore.subscribe(() => {
      loadProducts();
    });
    return unsub;
  }, [factoryId]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      code: `BRK-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Fly Ash Brick',
      unit: 'Pcs',
      hsnCode: '681599',
      sellingPrice: 5.0,
      costPrice: 3.2,
      minimumStock: 10000,
      initialStock: 20000,
      dimensions: '9 x 4 x 3 Inch',
      description: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      category: product.category,
      unit: product.unit,
      hsnCode: product.hsnCode || '681599',
      sellingPrice: product.sellingPrice,
      costPrice: product.costPrice,
      minimumStock: product.minimumStock,
      initialStock: product.currentStock,
      dimensions: product.dimensions || '',
      description: product.description || '',
      status: product.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, {
          name: formData.name,
          code: formData.code,
          category: formData.category,
          unit: formData.unit,
          hsnCode: formData.hsnCode,
          sellingPrice: Number(formData.sellingPrice),
          costPrice: Number(formData.costPrice),
          minimumStock: Number(formData.minimumStock),
          dimensions: formData.dimensions,
          description: formData.description,
          status: formData.status,
        });
        toast.success(`Updated ${formData.name}`);
      } else {
        await productService.createProduct(factoryId, {
          name: formData.name,
          code: formData.code,
          category: formData.category,
          unit: formData.unit,
          hsnCode: formData.hsnCode,
          sellingPrice: Number(formData.sellingPrice),
          costPrice: Number(formData.costPrice),
          minimumStock: Number(formData.minimumStock),
          initialStock: Number(formData.initialStock),
          dimensions: formData.dimensions,
          description: formData.description,
          status: formData.status,
        });
        toast.success(`Created product ${formData.name}`);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || 'Error saving product');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const updated = await productService.toggleStatus(product.id);
      toast.info(`${product.name} marked as ${updated.status}`);
      loadProducts();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await productService.deleteProduct(productToDelete.id);
      toast.success(`Deleted ${productToDelete.name}`);
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      loadProducts();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product Details',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">{row.code}</span>
            <span>•</span>
            <span>HSN: {row.hsnCode}</span>
            {row.dimensions && (
              <>
                <span>•</span>
                <span>{row.dimensions}</span>
              </>
            )}
          </div>
        </div>
      ),
      sortable: true,
      accessorKey: 'name',
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
          {row.category}
        </span>
      ),
    },
    {
      header: 'Current Stock',
      sortable: true,
      accessorKey: 'currentStock',
      cell: (row) => (
        <div>
          <div className="font-mono font-black text-slate-900 text-sm">
            {row.currentStock.toLocaleString()} {row.unit}
          </div>
          <div className="text-[11px] mt-0.5">
            {row.currentStock <= row.minimumStock ? (
              <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded">
                Low Stock (Min: {row.minimumStock.toLocaleString()})
              </span>
            ) : (
              <span className="text-slate-400">
                Min Threshold: {row.minimumStock.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Pricing & Margin',
      cell: (row) => {
        const margin = row.sellingPrice > 0 ? (((row.sellingPrice - row.costPrice) / row.sellingPrice) * 100).toFixed(0) : '0';
        return (
          <div>
            <div className="font-mono font-bold text-slate-900">
              {formatINR(row.sellingPrice)} <span className="text-xs text-slate-400 font-normal">/ {row.unit}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Cost: {formatINR(row.costPrice)} • <strong className="text-emerald-600">{margin}% Margin</strong>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleToggleStatus(row)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              row.status === 'active'
                ? 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                : 'text-slate-400 hover:bg-slate-100 border-slate-200'
            }`}
            title={row.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleOpenEdit(row)}
            className="w-7 h-7 text-slate-600 hover:text-slate-900"
            title="Edit Product"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setProductToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="w-7 h-7 text-rose-600 hover:bg-rose-50 border-rose-200"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const filterTabs = [
    { label: 'All Products', value: 'all', count: products.length },
    { label: 'Fly Ash Bricks', value: 'Fly Ash Brick', count: products.filter(p => p.category === 'Fly Ash Brick').length },
    { label: 'Cement Bricks', value: 'Cement Brick', count: products.filter(p => p.category === 'Cement Brick').length },
    { label: 'Red Clay Bricks', value: 'Red Clay Brick', count: products.filter(p => p.category === 'Red Clay Brick').length },
    { label: 'Hollow & Pavers', value: 'blocks_pavers', count: products.filter(p => p.category === 'Hollow Block' || p.category === 'Paver Block').length },
  ];

  const filterFn = (product: Product, tab: string) => {
    if (tab === 'blocks_pavers') {
      return product.category === 'Hollow Block' || product.category === 'Paver Block';
    }
    return product.category === tab;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products Master"
        description="Manage your manufactured brick sizes, selling rates, minimum stock limits, and HSN codes."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Operations' },
          { label: 'Products' },
        ]}
        actions={
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
            + Add New Product
          </Button>
        }
      />

      <DataTable
        data={products}
        columns={columns}
        searchPlaceholder="Search product by name, code or HSN..."
        searchKey="name"
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filterFn={filterFn}
        exportFileName="brickflow-products-master"
      />

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit ${editingProduct.name}` : 'Add New Brick Product'}
        description="Configure product specifications, pricing, and stock monitoring thresholds."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Product Name"
                placeholder="e.g. 6 Inch Fly Ash Cement Brick"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                isRequired
              />
            </div>
            <div>
              <Input
                label="Product Code"
                placeholder="e.g. FAB-6IN"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                required
                isRequired
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Select
                label="Category"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                isRequired
              >
                <option value="Fly Ash Brick">Fly Ash Brick</option>
                <option value="Cement Brick">Cement Brick</option>
                <option value="Red Clay Brick">Red Clay Brick</option>
                <option value="Hollow Block">Hollow Block</option>
                <option value="Paver Block">Paver Block</option>
                <option value="Solid Block">Solid Block</option>
              </Select>
            </div>
            <div>
              <Input
                label="Unit of Measure"
                placeholder="Pcs"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                required
                isRequired
              />
            </div>
            <div>
              <Input
                label="GST HSN Code"
                placeholder="681599"
                value={formData.hsnCode}
                onChange={e => setFormData({ ...formData, hsnCode: e.target.value })}
                required
                isRequired
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CurrencyInput
              label="Selling Price per Unit (₹)"
              value={formData.sellingPrice}
              onChange={e => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
              required
              isRequired
            />
            <CurrencyInput
              label="Estimated Cost per Unit (₹)"
              value={formData.costPrice}
              onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })}
              required
              isRequired
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuantityInput
              label="Minimum Stock Threshold"
              unit={formData.unit}
              value={formData.minimumStock}
              onChange={e => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
              required
              isRequired
            />
            {!editingProduct && (
              <QuantityInput
                label="Initial Yard Stock"
                unit={formData.unit}
                value={formData.initialStock}
                onChange={e => setFormData({ ...formData, initialStock: Number(e.target.value) })}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Dimensions (LxWxH)"
              placeholder="e.g. 9 x 4 x 3 Inch"
              value={formData.dimensions}
              onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="active">Active (Available for Sale)</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete ${productToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete Product"
      />
    </div>
  );
};
