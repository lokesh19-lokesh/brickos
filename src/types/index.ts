export type UserRole = 'super_admin' | 'factory_owner' | 'factory_manager' | 'factory_user';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'suspended' | 'cancelled';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  factoryId?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Factory {
  id: string;
  name: string;
  code: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  logo?: string;
  factoryType?: 'Fly Ash Brick' | 'Clay / Red Brick' | 'Paver Block & Tiles' | 'Concrete & Hollow Blocks' | 'Multi-Product Plant';
  employeesCount?: string;
  dailyCapacity?: string;
  mainProducts?: string[];
  planId?: string;
  subscriptionPlan?: 'starter' | 'growth' | 'enterprise';
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry?: string;
  subscriptionExpiresAt?: string;
  maxUsers?: number;
  status?: 'active' | 'inactive' | 'suspended';
  isDemo?: boolean;
  createdAt: string;
  updatedAt?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
    upiId: string;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceMonthly?: number;
  priceYearly?: number;
  billingCycle: 'monthly' | 'yearly';
  maxUsers: number;
  maxProducts?: number;
  maxMonthlyProduction?: string;
  tier?: 'starter' | 'growth' | 'enterprise';
  features: string[];
  isPopular?: boolean;
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  factoryId: string;
  name: string;
  code: string;
  category: 'Cement Brick' | 'Fly Ash Brick' | 'Red Clay Brick' | 'Hollow Block' | 'Solid Block' | 'Paver Block';
  unit: string; // e.g. 'Pcs', '1000 Pcs', 'Sq.Ft'
  hsnCode: string;
  sellingPrice: number;
  costPrice: number;
  minimumStock: number;
  currentStock: number;
  dimensions?: string; // e.g. "9 x 4 x 3 inch"
  status: 'active' | 'inactive';
  description?: string;
  createdAt: string;
}

export interface RawMaterial {
  id: string;
  factoryId: string;
  name: string;
  code: string;
  unit: 'Ton' | 'Bags' | 'Cubic Meter' | 'Brass' | 'Kg' | 'Liters' | 'Truck Load';
  minimumStock: number;
  currentStock: number;
  averageUnitCost: number;
  status: 'active' | 'inactive';
  totalPurchased: number;
  totalConsumed: number;
  createdAt: string;
}

export interface RawMaterialPurchase {
  id: string;
  factoryId: string;
  purchaseDate: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  truckNumber: string;
  driverName?: string;
  driverPhone?: string;
  rate: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  paymentDate?: string;
  paymentMode: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'neft_rtgs';
  invoiceRef?: string;
  notes?: string;
  createdAt: string;
}

export interface ProductionBatch {
  id: string;
  factoryId: string;
  batchCode: string;
  productionDate: string;
  productId: string;
  productName: string;
  targetQuantity: number;
  outputQuantity: number;
  damagedQuantity: number;
  unit: string;
  machineLine: string;
  kilnChamber?: string;
  supervisorName: string;
  mixProportion?: string;
  materialsUsed: {
    materialId: string;
    materialName: string;
    quantity: number;
    unit: string;
  }[];
  workersCount: number;
  startTime: string;
  endTime: string;
  status: 'draft' | 'in_progress' | 'curing' | 'firing' | 'completed' | 'rejected';
  qualityGrade: 'A Grade' | 'B Grade' | 'Commercial' | 'Scrap';
  remarks?: string;
  createdAt: string;
}

export type StockTransactionType = 'production' | 'sale' | 'damage' | 'adjustment' | 'return' | 'stock_in' | 'stock_out';

export interface StockTransaction {
  id: string;
  factoryId: string;
  date: string;
  productId: string;
  productName: string;
  batchCode?: string;
  transactionType: StockTransactionType;
  quantityIn: number;
  quantityOut: number;
  balance: number;
  referenceId?: string;
  referenceType?: 'production_batch' | 'sales_order' | 'manual_adjustment' | 'damage_report';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export type JobType = 
  | 'Supervisor' 
  | 'Machine Operator' 
  | 'Kiln Worker' 
  | 'Mould Worker' 
  | 'Loader' 
  | 'Helper' 
  | 'Driver' 
  | 'Accountant'
  | 'Other';

export interface Employee {
  id: string;
  factoryId: string;
  employeeCode: string;
  name: string;
  phone: string;
  address: string;
  joiningDate: string;
  jobType: JobType;
  wageType: 'daily' | 'piece_rate';
  dailyWage: number;
  pieceRatePerThousand?: number;
  status: 'active' | 'inactive';
  aadharNumber?: string;
  emergencyContact?: string;
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave';

export interface AttendanceRecord {
  id: string;
  factoryId: string;
  date: string;
  employeeId: string;
  employeeName: string;
  jobType: JobType;
  status: AttendanceStatus;
  overtimeHours: number;
  overtimeAmount: number;
  unitsProduced?: number; // For piece-rate workers
  dailyWageEarned: number;
  notes?: string;
  createdAt: string;
}

export interface WageSlip {
  id: string;
  factoryId: string;
  employeeId: string;
  employeeName: string;
  jobType: JobType;
  period: string; // e.g. "Aug 2026 - Week 4" or "August 2026"
  periodStart: string;
  periodEnd: string;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  dailyWageRate: number;
  baseWageAmount: number;
  overtimeHours: number;
  overtimeAmount: number;
  pieceRateAmount: number;
  grossAmount: number;
  advanceDeduction: number;
  otherDeduction: number;
  netPayable: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'paid' | 'partial' | 'pending';
  paymentDate?: string;
  paymentMode?: 'cash' | 'upi' | 'bank_transfer';
  remarks?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  factoryId: string;
  customerName: string;
  companyName?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  gstNumber?: string;
  creditLimit: number;
  openingBalance: number;
  currentBalance: number;
  totalSales: number;
  totalPaid: number;
  totalPending: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Vendor {
  id: string;
  factoryId: string;
  vendorName: string;
  company: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  gstNumber?: string;
  materialsSupplied: string[];
  openingBalance: number;
  currentBalance: number;
  totalPurchases: number;
  totalPaid: number;
  totalPending: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface SaleOrderItem {
  productId: string;
  productName: string;
  hsnCode?: string;
  batchCode?: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  taxPercent: number;
  amount: number;
}

export interface SaleOrder {
  id: string;
  factoryId: string;
  invoiceNumber: string;
  saleDate: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerGst?: string;
  items: SaleOrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  deliveryDetails: {
    vehicleNumber: string;
    driverName?: string;
    driverPhone?: string;
    destinationAddress: string;
    freightCharges?: number;
    freightPaidBy?: 'factory' | 'customer';
  };
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  factoryId: string;
  invoiceNumber: string;
  saleOrderId: string;
  invoiceDate: string;
  dueDate: string;
  customer: {
    id: string;
    name: string;
    company?: string;
    phone: string;
    email?: string;
    address: string;
    gstNumber?: string;
  };
  items: {
    productId: string;
    name: string;
    hsnCode: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'paid' | 'partial' | 'pending' | 'cancelled';
  termsAndConditions: string[];
  vehicleNumber?: string;
  eWayBillNumber?: string;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'Diesel' 
  | 'Electricity' 
  | 'Machine Repair' 
  | 'Vehicle Repair' 
  | 'Transport' 
  | 'Maintenance' 
  | 'Office' 
  | 'Food' 
  | 'Kiln Fuel'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  factoryId: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMode: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
  paidBy: string;
  reference?: string;
  recipientName?: string;
  notes?: string;
  createdAt: string;
}

export type PartyType = 'customer' | 'vendor' | 'labour' | 'expense';
export type PaymentType = 'receipt' | 'payment';

export interface Payment {
  id: string;
  factoryId: string;
  date: string;
  partyType: PartyType;
  partyId: string;
  partyName: string;
  paymentType: PaymentType;
  amount: number;
  paymentMode: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'neft_rtgs';
  reference?: string;
  invoiceRef?: string;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  factoryId: string;
  title: string;
  message: string;
  type: 'low_stock' | 'payment_due' | 'wages_pending' | 'subscription' | 'production' | 'system';
  severity: 'info' | 'warning' | 'error' | 'success';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  factoryId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  module: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'LOGIN' | 'PAYMENT';
  recordId: string;
  recordTitle: string;
  details: string;
  timestamp: string;
}
