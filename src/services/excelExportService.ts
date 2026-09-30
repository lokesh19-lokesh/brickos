import * as XLSX from 'xlsx';
import { productService } from './productService';
import { rawMaterialService } from './rawMaterialService';
import { productionService } from './productionService';
import { salesService, invoiceService } from './salesService';
import { expenseService } from './expenseService';
import { customerService, vendorService } from './customerService';
import { labourService } from './labourService';
import { superAdminService } from './reportService';
import { dbStore } from './mockDatabase';
import { formatDate } from '@/utils/formatters';
import { 
  Product, RawMaterial, ProductionBatch, SaleOrder, Invoice, 
  Expense, Customer, Vendor, Employee, Factory, User, SubscriptionPlan, AuditLogItem 
} from '@/types';

// Helper to auto-fit column widths in worksheets
const autoFitColumns = (json: Record<string, any>[]) => {
  if (!json || json.length === 0) return [];
  const keys = Object.keys(json[0]);
  return keys.map(key => {
    let maxLen = key.length;
    for (let i = 0; i < Math.min(json.length, 100); i++) {
      const val = json[i][key];
      if (val !== null && val !== undefined) {
        maxLen = Math.max(maxLen, String(val).length);
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
  });
};

export const excelExportService = {
  /**
   * Export all factory enterprise database records into a multi-sheet Excel file (.xlsx)
   */
  async exportFactoryData(factoryId: string, factoryName?: string): Promise<string> {
    const activeFactory = dbStore.get('factories').find(f => f.id === factoryId);
    const plantName = factoryName || activeFactory?.name || 'Factory';
    const timestamp = new Date().toISOString().split('T')[0];

    // Fetch live datasets across all factory operations
    const [
      products,
      rawMaterials,
      batches,
      sales,
      invoices,
      expenses,
      customers,
      vendors,
      employees,
    ] = await Promise.all([
      productService.getProducts(factoryId),
      rawMaterialService.getRawMaterials(factoryId),
      productionService.getBatches(factoryId),
      salesService.getSales(factoryId),
      invoiceService.getInvoices(factoryId),
      expenseService.getExpenses(factoryId),
      customerService.getCustomers(factoryId),
      vendorService.getVendors(factoryId),
      labourService.getEmployees(factoryId),
    ]);

    const wb = XLSX.utils.book_new();

    // 1. Overview & Plant Metadata Sheet
    const overviewData = [
      { Parameter: 'Factory Name', Value: plantName },
      { Parameter: 'Factory Code', Value: activeFactory?.code || 'N/A' },
      { Parameter: 'GSTIN Number', Value: activeFactory?.gstNumber || 'Unregistered' },
      { Parameter: 'Address & City', Value: `${activeFactory?.address || ''}, ${activeFactory?.city || ''}, ${activeFactory?.state || ''}` },
      { Parameter: 'Owner / Partner', Value: activeFactory?.ownerName || 'N/A' },
      { Parameter: 'Phone / Email', Value: `${activeFactory?.phone || ''} | ${activeFactory?.email || ''}` },
      { Parameter: 'Export Date', Value: formatDate(new Date().toISOString(), 'dd MMM yyyy, hh:mm a') },
      { Parameter: 'System Version', Value: 'Patterns BrickOS Enterprise v2.4' },
      { Parameter: '---', Value: '---' },
      { Parameter: 'Total Active Products', Value: products.length },
      { Parameter: 'Raw Material Inventory Items', Value: rawMaterials.length },
      { Parameter: 'Total Production Batches', Value: batches.length },
      { Parameter: 'Sales Orders Dispatched', Value: sales.length },
      { Parameter: 'Tax Invoices Generated', Value: invoices.length },
      { Parameter: 'Expenses Recorded', Value: expenses.length },
      { Parameter: 'Customers in Ledger', Value: customers.length },
      { Parameter: 'Registered Vendors', Value: vendors.length },
      { Parameter: 'Workforce Employees', Value: employees.length },
    ];
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    wsOverview['!cols'] = autoFitColumns(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, 'Plant_Overview');

    // 2. Products Master Sheet
    const productsData = products.map((p: Product) => ({
      'Product Code': p.code,
      'Product Name': p.name,
      'Category': p.category,
      'Unit of Measure': p.unit,
      'HSN Code': p.hsnCode || '681599',
      'Selling Price (₹)': p.sellingPrice,
      'Cost Price (₹)': p.costPrice,
      'Current Stock': p.currentStock,
      'Minimum Threshold': p.minimumStock,
      'Status': p.status.toUpperCase(),
    }));
    const wsProducts = XLSX.utils.json_to_sheet(productsData.length ? productsData : [{ Notice: 'No products registered' }]);
    wsProducts['!cols'] = autoFitColumns(productsData);
    XLSX.utils.book_append_sheet(wb, wsProducts, 'Products');

    // 3. Raw Materials Sheet
    const rawMaterialsData = rawMaterials.map((r: RawMaterial) => ({
      'Item Code': r.code,
      'Material Name': r.name,
      'Unit': r.unit,
      'Current Stock': r.currentStock,
      'Minimum Stock': r.minimumStock,
      'Average Unit Cost (₹)': r.averageUnitCost,
      'Stock Valuation (₹)': Math.round(r.currentStock * r.averageUnitCost),
      'Status': r.status.toUpperCase(),
    }));
    const wsRaw = XLSX.utils.json_to_sheet(rawMaterialsData.length ? rawMaterialsData : [{ Notice: 'No raw materials recorded' }]);
    wsRaw['!cols'] = autoFitColumns(rawMaterialsData);
    XLSX.utils.book_append_sheet(wb, wsRaw, 'Raw_Materials');

    // 4. Production Batches Sheet
    const batchesData = batches.map((b: ProductionBatch) => ({
      'Batch Code': b.batchCode,
      'Production Date': formatDate(b.productionDate, 'dd MMM yyyy'),
      'Product Name': b.productName,
      'Target Qty': b.targetQuantity,
      'Actual Output': b.outputQuantity,
      'Damaged / Rejection Qty': b.damagedQuantity,
      'Efficiency (%)': b.targetQuantity > 0 ? `${Math.round((b.outputQuantity / b.targetQuantity) * 100)}%` : '100%',
      'Machine Line': b.machineLine || 'Main Line',
      'Quality Grade': b.qualityGrade,
      'Status': b.status.toUpperCase(),
    }));
    const wsBatches = XLSX.utils.json_to_sheet(batchesData.length ? batchesData : [{ Notice: 'No production batches recorded' }]);
    wsBatches['!cols'] = autoFitColumns(batchesData);
    XLSX.utils.book_append_sheet(wb, wsBatches, 'Production_Batches');

    // 5. Sales Orders Sheet
    const salesData = sales.map((s: SaleOrder) => ({
      'Order / Invoice No': s.invoiceNumber,
      'Sale Date': formatDate(s.saleDate, 'dd MMM yyyy'),
      'Customer Name': s.customerName,
      'Customer Phone': s.customerPhone,
      'Items': s.items.map(it => `${it.productName} (${it.quantity} ${it.unit})`).join('; '),
      'Subtotal (₹)': s.subtotal,
      'Tax Amount (₹)': s.taxTotal,
      'Grand Total (₹)': s.grandTotal,
      'Paid Amount (₹)': s.paidAmount,
      'Pending Amount (₹)': s.pendingAmount,
      'Payment Status': s.paymentStatus.toUpperCase(),
      'Vehicle Number': s.deliveryDetails?.vehicleNumber || 'Plant Vehicle',
    }));
    const wsSales = XLSX.utils.json_to_sheet(salesData.length ? salesData : [{ Notice: 'No sales records' }]);
    wsSales['!cols'] = autoFitColumns(salesData);
    XLSX.utils.book_append_sheet(wb, wsSales, 'Sales_Orders');

    // 6. GST Tax Invoices Sheet
    const invoicesData = invoices.map((inv: Invoice) => ({
      'Invoice Number': inv.invoiceNumber,
      'Invoice Date': formatDate(inv.invoiceDate, 'dd MMM yyyy'),
      'Due Date': formatDate(inv.dueDate, 'dd MMM yyyy'),
      'Customer Name': inv.customer?.name || 'N/A',
      'GSTIN': inv.customer?.gstNumber || 'B2C / Unregistered',
      'Taxable Subtotal (₹)': inv.taxableAmount || inv.subtotal,
      'CGST + SGST (₹)': (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0),
      'Grand Total (₹)': inv.grandTotal,
      'Paid Amount (₹)': inv.paidAmount,
      'Pending Amount (₹)': inv.pendingAmount,
      'Status': inv.status.toUpperCase(),
    }));
    const wsInvoices = XLSX.utils.json_to_sheet(invoicesData.length ? invoicesData : [{ Notice: 'No tax invoices generated' }]);
    wsInvoices['!cols'] = autoFitColumns(invoicesData);
    XLSX.utils.book_append_sheet(wb, wsInvoices, 'GST_Invoices');

    // 7. Factory Expenses Sheet
    const expensesData = expenses.map((exp: Expense) => ({
      'Expense Date': formatDate(exp.date, 'dd MMM yyyy'),
      'Category': exp.category,
      'Paid To': exp.recipientName || exp.paidBy,
      'Description': exp.description,
      'Amount (₹)': exp.amount,
      'Payment Mode': exp.paymentMode.toUpperCase(),
    }));
    const wsExpenses = XLSX.utils.json_to_sheet(expensesData.length ? expensesData : [{ Notice: 'No expenses recorded' }]);
    wsExpenses['!cols'] = autoFitColumns(expensesData);
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses');

    // 8. Customers Ledger Sheet
    const customersData = customers.map((c: Customer) => ({
      'Customer Name': c.customerName,
      'Company Name': c.companyName || c.customerName,
      'Contact Phone': c.phone,
      'GSTIN': c.gstNumber || 'N/A',
      'City': c.city,
      'Total Sales (₹)': c.totalSales,
      'Total Paid (₹)': c.totalPaid,
      'Current Balance (₹)': c.currentBalance,
      'Credit Limit (₹)': c.creditLimit,
      'Status': c.status.toUpperCase(),
    }));
    const wsCustomers = XLSX.utils.json_to_sheet(customersData.length ? customersData : [{ Notice: 'No customers recorded' }]);
    wsCustomers['!cols'] = autoFitColumns(customersData);
    XLSX.utils.book_append_sheet(wb, wsCustomers, 'Customers');

    // 9. Vendors Ledger Sheet
    const vendorsData = vendors.map((v: Vendor) => ({
      'Vendor Name': v.vendorName,
      'Company': v.company || v.vendorName,
      'Phone': v.phone,
      'GSTIN': v.gstNumber || 'N/A',
      'City': v.city,
      'Materials Supplied': (v.materialsSupplied || []).join(', '),
      'Total Purchases (₹)': v.totalPurchases,
      'Total Paid (₹)': v.totalPaid,
      'Current Balance (₹)': v.currentBalance,
      'Status': v.status.toUpperCase(),
    }));
    const wsVendors = XLSX.utils.json_to_sheet(vendorsData.length ? vendorsData : [{ Notice: 'No vendors recorded' }]);
    wsVendors['!cols'] = autoFitColumns(vendorsData);
    XLSX.utils.book_append_sheet(wb, wsVendors, 'Vendors');

    // 10. Employees & Labour Sheet
    const employeesData = employees.map((e: Employee) => ({
      'Staff Code': e.employeeCode,
      'Full Name': e.name,
      'Phone': e.phone,
      'Designation / Role': e.jobType,
      'Wage Structure': e.wageType === 'piece_rate' ? 'Piece-Rate' : 'Daily Wage',
      'Daily Wage (₹)': e.dailyWage || 0,
      'Piece Rate / 1000 (₹)': e.pieceRatePerThousand || 0,
      'Joining Date': formatDate(e.joiningDate, 'dd MMM yyyy'),
      'Status': e.status.toUpperCase(),
    }));
    const wsEmployees = XLSX.utils.json_to_sheet(employeesData.length ? employeesData : [{ Notice: 'No employees recorded' }]);
    wsEmployees['!cols'] = autoFitColumns(employeesData);
    XLSX.utils.book_append_sheet(wb, wsEmployees, 'Labour_Payroll');

    // Generate sanitized file name and write workbook
    const safePlantName = plantName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `BrickOS_${safePlantName}_All_Data_${timestamp}.xlsx`;
    XLSX.writeFile(wb, fileName);

    return fileName;
  },

  /**
   * Export complete Super Admin platform database into a multi-sheet Excel file (.xlsx)
   */
  async exportSuperAdminData(): Promise<string> {
    const timestamp = new Date().toISOString().split('T')[0];
    const stats = await superAdminService.getPlatformStats();
    const auditLogs: AuditLogItem[] = dbStore.get('auditLogs');
    const wb = XLSX.utils.book_new();

    // 1. Platform Summary Sheet
    const summaryData = [
      { Metric: 'SaaS Platform Name', Value: 'Patterns BrickOS Enterprise' },
      { Metric: 'Export Timestamp', Value: formatDate(new Date().toISOString(), 'dd MMM yyyy, hh:mm a') },
      { Metric: 'Total Factory Tenants', Value: stats.totalFactories },
      { Metric: 'Active Plants', Value: stats.activeFactories },
      { Metric: '14-Day Free Trials', Value: stats.trialFactories },
      { Metric: 'Expired Accounts', Value: stats.expiredFactories },
      { Metric: 'Total Registered Platform Users', Value: stats.totalUsers },
      { Metric: 'Estimated Monthly Recurring Revenue (MRR)', Value: `₹${stats.mrr.toLocaleString('en-IN')}` },
      { Metric: 'Database Infrastructure', Value: 'Supabase PostgreSQL Cloud RLS' },
      { Metric: 'System Availability Uptime', Value: '99.98%' },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = autoFitColumns(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Platform_Summary');

    // 2. Factories & Tenants Sheet
    const factoriesData = stats.factories.map((f: Factory) => {
      const plan = stats.plans.find((p: SubscriptionPlan) => p.id === f.planId);
      return {
        'Factory ID': f.id,
        'Factory Name': f.name,
        'Code': f.code,
        'Owner Name': f.ownerName,
        'Owner Email': f.email,
        'Owner Phone': f.phone,
        'City': f.city,
        'State': f.state,
        'GSTIN': f.gstNumber || 'N/A',
        'Current Plan': plan?.name || 'Growth Plan',
        'Plan Price (₹/mo)': plan?.price || 4999,
        'Status': f.subscriptionStatus.toUpperCase(),
        'Subscription Expiry': f.subscriptionExpiry ? formatDate(f.subscriptionExpiry, 'dd MMM yyyy') : 'N/A',
        'Created On': formatDate(f.createdAt, 'dd MMM yyyy'),
      };
    });
    const wsFactories = XLSX.utils.json_to_sheet(factoriesData.length ? factoriesData : [{ Notice: 'No factories found' }]);
    wsFactories['!cols'] = autoFitColumns(factoriesData);
    XLSX.utils.book_append_sheet(wb, wsFactories, 'Tenants_Factories');

    // 3. Platform Users Sheet
    const usersData = stats.users.map((u: User) => ({
      'User ID': u.id,
      'Full Name': u.fullName,
      'Email Address': u.email,
      'Phone Number': u.phone || 'N/A',
      'Assigned Role': u.role.toUpperCase(),
      'Factory ID': u.factoryId,
      'Status': u.status.toUpperCase(),
      'Created On': formatDate(u.createdAt, 'dd MMM yyyy'),
    }));
    const wsUsers = XLSX.utils.json_to_sheet(usersData.length ? usersData : [{ Notice: 'No users found' }]);
    wsUsers['!cols'] = autoFitColumns(usersData);
    XLSX.utils.book_append_sheet(wb, wsUsers, 'Platform_Users');

    // 4. SaaS Plans Master Sheet
    const plansData = stats.plans.map((p: SubscriptionPlan) => ({
      'Plan ID': p.id,
      'Plan Name': p.name,
      'Monthly Price (₹)': p.price,
      'Production Capacity Limit': p.maxMonthlyProduction || 'Unlimited',
      'User Seat Limit': p.maxUsers,
      'Tier': p.tier ? p.tier.toUpperCase() : 'STANDARD',
      'Features': p.features.join(' | '),
    }));
    const wsPlans = XLSX.utils.json_to_sheet(plansData);
    wsPlans['!cols'] = autoFitColumns(plansData);
    XLSX.utils.book_append_sheet(wb, wsPlans, 'SaaS_Plans');

    // 5. Audit & Security Trail Sheet
    const logsData = auditLogs.map((a: AuditLogItem) => ({
      'Timestamp': formatDate(a.timestamp, 'dd MMM yyyy, hh:mm a'),
      'User': a.userName,
      'Role': a.userRole.toUpperCase(),
      'Module': a.module,
      'Action': a.action,
      'Event Details': a.details,
    }));
    const wsLogs = XLSX.utils.json_to_sheet(logsData.length ? logsData : [{ Notice: 'No audit logs recorded' }]);
    wsLogs['!cols'] = autoFitColumns(logsData);
    XLSX.utils.book_append_sheet(wb, wsLogs, 'Audit_Security_Logs');

    const fileName = `BrickOS_SuperAdmin_All_Data_${timestamp}.xlsx`;
    XLSX.writeFile(wb, fileName);

    return fileName;
  }
};
