import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Building2, Package, Layers, Users, Briefcase, ShoppingBag, 
  CheckCircle2, ArrowRight, ArrowLeft, Plus, Trash2, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, CurrencyInput, QuantityInput } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { productService } from '@/services/productService';
import { rawMaterialService } from '@/services/rawMaterialService';
import { labourService } from '@/services/labourService';
import { customerService, vendorService } from '@/services/customerService';

export const OnboardingWizardPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const { factory } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const factoryId = factory?.id || 'fact_01';

  // Step 1: Factory Profile details
  const [factoryProfile, setFactoryProfile] = useState({
    name: factory?.name || 'Shree Ram Brick Industries',
    code: factory?.code || 'SRB-01',
    address: factory?.address || 'Plot 45-B, Industrial Estate, Hadapsar',
    city: factory?.city || 'Pune',
    state: factory?.state || 'Maharashtra',
    pincode: factory?.pincode || '411028',
    gstNumber: factory?.gstNumber || '27AABCS1429B1Z8',
  });

  // Step 2: Products list
  const [productsList, setProductsList] = useState([
    { name: '4 Inch Fly Ash Cement Brick', code: 'FAB-4IN', category: 'Fly Ash Brick' as any, unit: 'Pcs', sellingPrice: 4.80, costPrice: 3.10, minimumStock: 15000, initialStock: 40000, hsnCode: '681599', status: 'active' as any },
    { name: '6 Inch Fly Ash Cement Brick', code: 'FAB-6IN', category: 'Fly Ash Brick' as any, unit: 'Pcs', sellingPrice: 6.90, costPrice: 4.40, minimumStock: 10000, initialStock: 25000, hsnCode: '681599', status: 'active' as any },
    { name: '8 Inch Concrete Hollow Block', code: 'CHB-8IN', category: 'Hollow Block' as any, unit: 'Pcs', sellingPrice: 34.00, costPrice: 21.50, minimumStock: 3000, initialStock: 6000, hsnCode: '681011', status: 'active' as any },
  ]);

  // Step 3: Raw Materials list
  const [rawMaterialsList, setRawMaterialsList] = useState([
    { name: 'Grade 53 OPC Cement', code: 'RM-CEM53', unit: 'Bags' as any, minimumStock: 150, currentStock: 450, averageUnitCost: 345, status: 'active' as any },
    { name: 'Thermal Fly Ash (Grade F)', code: 'RM-FLY', unit: 'Ton' as any, minimumStock: 40, currentStock: 85, averageUnitCost: 680, status: 'active' as any },
    { name: 'Crushed Stone Dust', code: 'RM-SDUST', unit: 'Ton' as any, minimumStock: 50, currentStock: 120, averageUnitCost: 490, status: 'active' as any },
    { name: 'River Washed Sand', code: 'RM-RSAND', unit: 'Brass' as any, minimumStock: 10, currentStock: 25, averageUnitCost: 4200, status: 'active' as any },
  ]);

  // Step 4: Employees list
  const [employeesList, setEmployeesList] = useState([
    { employeeCode: 'EMP-01', name: 'Rameshwar Patil', phone: '+91 97654 11223', address: 'Pune', joiningDate: '2025-01-01', jobType: 'Supervisor' as any, wageType: 'daily' as any, dailyWage: 950, status: 'active' as any },
    { employeeCode: 'EMP-02', name: 'Suresh Kumar Sharma', phone: '+91 98231 44552', address: 'Staff Quarters', joiningDate: '2025-01-01', jobType: 'Machine Operator' as any, wageType: 'daily' as any, dailyWage: 750, status: 'active' as any },
    { employeeCode: 'EMP-03', name: 'Santosh Yadav', phone: '+91 99755 33211', address: 'Shed 1', joiningDate: '2025-01-01', jobType: 'Mould Worker' as any, wageType: 'piece_rate' as any, dailyWage: 0, pieceRatePerThousand: 650, status: 'active' as any },
  ]);

  // Step 5: Vendors list
  const [vendorsList, setVendorsList] = useState([
    { vendorName: 'UltraTech Cement Authorized Depot', company: 'UltraTech Cement Ltd', phone: '+91 98221 00112', address: 'Ghorpadi, Pune', city: 'Pune', state: 'Maharashtra', gstNumber: '27AAACU1234F1Z8', materialsSupplied: ['Grade 53 OPC Cement'], openingBalance: 0, status: 'active' as any },
    { vendorName: 'Maha Thermal Ash Logistics', company: 'Maha Ash Bulk Carriers', phone: '+91 99230 44556', address: 'Parli, Beed', city: 'Beed', state: 'Maharashtra', gstNumber: '27AABCM6612N1Z3', materialsSupplied: ['Thermal Fly Ash'], openingBalance: 0, status: 'active' as any },
  ]);

  // Step 6: Customers list
  const [customersList, setCustomersList] = useState([
    { customerName: 'Larsen & Toubro Realty Project', companyName: 'L&T Construction', phone: '+91 98224 55667', address: 'Kharadi, Pune', city: 'Pune', state: 'Maharashtra', gstNumber: '27AAACL0149B1Z2', creditLimit: 500000, openingBalance: 0, status: 'active' as any },
    { customerName: 'Apex Infra Developers LLP', companyName: 'Apex Infrastructures', phone: '+91 98901 88776', address: 'Baner, Pune', city: 'Pune', state: 'Maharashtra', gstNumber: '27AAKFA7812C1ZT', creditLimit: 200000, openingBalance: 0, status: 'active' as any },
  ]);

  const stepsMeta = [
    { num: 1, title: 'Factory Profile', icon: Building2 },
    { num: 2, title: 'Products', icon: Package },
    { num: 3, title: 'Raw Materials', icon: Layers },
    { num: 4, title: 'Employees', icon: Users },
    { num: 5, title: 'Vendors', icon: Briefcase },
    { num: 6, title: 'Customers', icon: ShoppingBag },
    { num: 7, title: 'Finish Setup', icon: CheckCircle2 },
  ];

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      if (currentStep + 1 === 7) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    toast.success('Factory setup completed! Welcome to BrickFlow ERP.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Wizard Branding & Progress Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Patterns BrickOS" className="h-10 w-auto object-contain" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-[#1E293B]">Factory Onboarding Wizard</span>
                <span className="text-xs font-bold text-[#E53935] bg-[#FFEBEE] px-2 py-0.5 rounded-full border border-red-200">
                  Step {currentStep} of 7
                </span>
              </div>
              <p className="text-xs text-slate-500">Configure your masters, materials, staff and business contacts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              Skip to Dashboard
            </Button>
          </div>
        </div>

        {/* Step Progression Tabs */}
        <div className="grid grid-cols-7 gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
          {stepsMeta.map(s => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`p-2 rounded-xl text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#FFEBEE] text-[#D32F2F] font-bold shadow-2xs border border-red-200/80'
                    : isCompleted
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] hidden sm:inline truncate max-w-full font-semibold">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Step Workspace Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
          {/* STEP 1: FACTORY PROFILE */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-[#1E293B]">Step 1: Factory Profile & Tax Information</h3>
                <p className="text-xs text-slate-500">Confirm your plant address and GST registration number.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Factory Name"
                    value={factoryProfile.name}
                    onChange={e => setFactoryProfile({ ...factoryProfile, name: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    label="Factory Code"
                    value={factoryProfile.code}
                    onChange={e => setFactoryProfile({ ...factoryProfile, code: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="GSTIN Number"
                  value={factoryProfile.gstNumber}
                  onChange={e => setFactoryProfile({ ...factoryProfile, gstNumber: e.target.value })}
                />
                <Input
                  label="Street Address"
                  value={factoryProfile.address}
                  onChange={e => setFactoryProfile({ ...factoryProfile, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={factoryProfile.city}
                  onChange={e => setFactoryProfile({ ...factoryProfile, city: e.target.value })}
                />
                <Input
                  label="State"
                  value={factoryProfile.state}
                  onChange={e => setFactoryProfile({ ...factoryProfile, state: e.target.value })}
                />
                <Input
                  label="Pincode"
                  value={factoryProfile.pincode}
                  onChange={e => setFactoryProfile({ ...factoryProfile, pincode: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 2: PRODUCTS */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">Step 2: Finished Brick Products</h3>
                  <p className="text-xs text-slate-500">Configure your manufactured brick lines and initial yard stock.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4 text-[#E53935]" />}
                  onClick={() => {
                    setProductsList([
                      ...productsList,
                      { name: 'Red Clay Kiln Brick', code: 'RCK-STD', category: 'Red Clay Brick', unit: 'Pcs', sellingPrice: 8.5, costPrice: 5.4, minimumStock: 20000, initialStock: 50000, hsnCode: '690410', status: 'active' },
                    ]);
                  }}
                >
                  Add Product
                </Button>
              </div>

              <div className="space-y-3">
                {productsList.map((prod, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <Input
                        label="Product Name"
                        value={prod.name}
                        onChange={e => {
                          const updated = [...productsList];
                          updated[idx].name = e.target.value;
                          setProductsList(updated);
                        }}
                      />
                    </div>
                    <div>
                      <CurrencyInput
                        label="Selling Price (₹)"
                        value={prod.sellingPrice}
                        onChange={e => {
                          const updated = [...productsList];
                          updated[idx].sellingPrice = Number(e.target.value);
                          setProductsList(updated);
                        }}
                      />
                    </div>
                    <div>
                      <QuantityInput
                        label="Initial Stock"
                        unit="Pcs"
                        value={prod.initialStock}
                        onChange={e => {
                          const updated = [...productsList];
                          updated[idx].initialStock = Number(e.target.value);
                          setProductsList(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: RAW MATERIALS */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">Step 3: Raw Materials Inventory</h3>
                  <p className="text-xs text-slate-500">Set up opening balances for Cement, Fly Ash, Sand & Stone Dust.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4 text-[#E53935]" />}
                  onClick={() => {
                    setRawMaterialsList([
                      ...rawMaterialsList,
                      { name: 'Calcined Gypsum Powder', code: 'RM-GYP', unit: 'Bags', minimumStock: 30, currentStock: 40, averageUnitCost: 240, status: 'active' },
                    ]);
                  }}
                >
                  Add Material
                </Button>
              </div>

              <div className="space-y-3">
                {rawMaterialsList.map((rm, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <Input
                        label="Material Name"
                        value={rm.name}
                        onChange={e => {
                          const updated = [...rawMaterialsList];
                          updated[idx].name = e.target.value;
                          setRawMaterialsList(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Input
                        label="Unit"
                        value={rm.unit}
                        onChange={e => {
                          const updated = [...rawMaterialsList];
                          updated[idx].unit = e.target.value as any;
                          setRawMaterialsList(updated);
                        }}
                      />
                    </div>
                    <div>
                      <QuantityInput
                        label="Opening Stock"
                        unit={rm.unit}
                        value={rm.currentStock}
                        onChange={e => {
                          const updated = [...rawMaterialsList];
                          updated[idx].currentStock = Number(e.target.value);
                          setRawMaterialsList(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: EMPLOYEES */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">Step 4: Factory Staff & Worker Roster</h3>
                  <p className="text-xs text-slate-500">Add supervisors, machine operators, and piece-rate loaders.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4 text-[#E53935]" />}
                  onClick={() => {
                    setEmployeesList([
                      ...employeesList,
                      { employeeCode: `EMP-0${employeesList.length + 1}`, name: 'New Worker', phone: '+91 98000 00000', address: 'Labour Camp', joiningDate: '2025-01-01', jobType: 'Helper', wageType: 'daily', dailyWage: 550, status: 'active' },
                    ]);
                  }}
                >
                  Add Worker
                </Button>
              </div>

              <div className="space-y-3">
                {employeesList.map((emp, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <Input
                        label="Employee Name & Code"
                        value={emp.name}
                        onChange={e => {
                          const updated = [...employeesList];
                          updated[idx].name = e.target.value;
                          setEmployeesList(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Input
                        label="Job Role"
                        value={emp.jobType}
                        onChange={e => {
                          const updated = [...employeesList];
                          updated[idx].jobType = e.target.value as any;
                          setEmployeesList(updated);
                        }}
                      />
                    </div>
                    <div>
                      <CurrencyInput
                        label={emp.wageType === 'piece_rate' ? 'Piece-Rate (₹/1000)' : 'Daily Wage (₹)'}
                        value={emp.wageType === 'piece_rate' ? emp.pieceRatePerThousand : emp.dailyWage}
                        onChange={e => {
                          const updated = [...employeesList];
                          if (emp.wageType === 'piece_rate') {
                            updated[idx].pieceRatePerThousand = Number(e.target.value);
                          } else {
                            updated[idx].dailyWage = Number(e.target.value);
                          }
                          setEmployeesList(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: VENDORS */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">Step 5: Raw Material Vendors</h3>
                  <p className="text-xs text-slate-500">Suppliers for cement depots, fly ash carriers, and sand crushers.</p>
                </div>
              </div>

              <div className="space-y-3">
                {vendorsList.map((v, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Vendor / Agency Name"
                      value={v.vendorName}
                      onChange={e => {
                        const updated = [...vendorsList];
                        updated[idx].vendorName = e.target.value;
                        setVendorsList(updated);
                      }}
                    />
                    <Input
                      label="Phone / WhatsApp"
                      value={v.phone}
                      onChange={e => {
                        const updated = [...vendorsList];
                        updated[idx].phone = e.target.value;
                        setVendorsList(updated);
                      }}
                    />
                    <Input
                      label="Materials Supplied"
                      value={v.materialsSupplied.join(', ')}
                      onChange={e => {
                        const updated = [...vendorsList];
                        updated[idx].materialsSupplied = e.target.value.split(',');
                        setVendorsList(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: CUSTOMERS */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">Step 6: Key Builder & Dealer Customers</h3>
                  <p className="text-xs text-slate-500">Primary real estate developers, contractors, and material dealers.</p>
                </div>
              </div>

              <div className="space-y-3">
                {customersList.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Customer / Company Name"
                      value={c.customerName}
                      onChange={e => {
                        const updated = [...customersList];
                        updated[idx].customerName = e.target.value;
                        setCustomersList(updated);
                      }}
                    />
                    <Input
                      label="Phone / WhatsApp"
                      value={c.phone}
                      onChange={e => {
                        const updated = [...customersList];
                        updated[idx].phone = e.target.value;
                        setCustomersList(updated);
                      }}
                    />
                    <CurrencyInput
                      label="Credit Limit (₹)"
                      value={c.creditLimit}
                      onChange={e => {
                        const updated = [...customersList];
                        updated[idx].creditLimit = Number(e.target.value);
                        setCustomersList(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: FINISH SETUP */}
          {currentStep === 7 && (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-[#1E293B]">Setup Complete & Ready to Launch!</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Your products, raw materials, employees, vendors, and customers are configured. You can now start logging production batches and generating GST invoices.
                </p>
              </div>

              {/* Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase">Products</div>
                  <div className="text-lg font-black text-slate-900">{productsList.length} Items</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase">Raw Materials</div>
                  <div className="text-lg font-black text-slate-900">{rawMaterialsList.length} Types</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase">Workforce</div>
                  <div className="text-lg font-black text-slate-900">{employeesList.length} Workers</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase">Accounts</div>
                  <div className="text-lg font-black text-slate-900">{customersList.length + vendorsList.length} Parties</div>
                </div>
              </div>

              <div className="pt-4 max-w-sm mx-auto">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleFinish}
                  className="w-full font-bold shadow-lg shadow-red-500/20"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Enter Factory Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* Action Footer Navigation */}
          {currentStep < 7 && (
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="md"
                onClick={handleBack}
                disabled={currentStep === 1}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleNext}
                >
                  Skip Step
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Save & Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
