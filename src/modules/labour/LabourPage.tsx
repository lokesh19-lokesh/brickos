import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Users, Plus, Calendar, DollarSign, Clock, 
  CheckCircle2, AlertCircle, FileText, Printer, Check 
} from 'lucide-react';
import { labourService } from '@/services/labourService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Employee, AttendanceRecord, WageSlip, JobType } from '@/types';
import { formatINR, formatDate } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, CurrencyInput } from '@/components/ui/Input';
import { StatusBadge, Badge } from '@/components/ui/Card';
import { PageHeader, Alert } from '@/components/ui/PageHeader';

export const LabourPage: React.FC = () => {
  const { factory } = useAuth();
  const { toast } = useToast();
  const factoryId = factory?.id || 'fact_01';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [wageSlips, setWageSlips] = useState<WageSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roster' | 'attendance' | 'payroll'>('attendance');

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modals state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isPayWageModalOpen, setIsPayWageModalOpen] = useState(false);
  const [selectedWageSlip, setSelectedWageSlip] = useState<WageSlip | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<'cash' | 'upi' | 'bank_transfer'>('cash');

  // New Employee Form
  const [employeeForm, setEmployeeForm] = useState({
    employeeCode: `EMP-${Math.floor(10 + Math.random() * 90)}`,
    name: '',
    phone: '',
    address: 'Labour Camp Quarters',
    joiningDate: new Date().toISOString().split('T')[0],
    jobType: 'Machine Operator' as JobType,
    wageType: 'daily' as Employee['wageType'],
    dailyWage: 750,
    pieceRatePerThousand: 650,
    aadharNumber: '',
    emergencyContact: '',
    status: 'active' as Employee['status'],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [empList, attList, wageList] = await Promise.all([
        labourService.getEmployees(factoryId),
        labourService.getAttendance(factoryId, selectedDate),
        labourService.getWageSlips(factoryId),
      ]);
      setEmployees(empList);
      setAttendance(attList);
      setWageSlips(wageList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = dbStore.subscribe(() => {
      loadData();
    });
    return unsub;
  }, [factoryId, selectedDate]);

  const handleMarkStatus = async (employee: Employee, status: AttendanceRecord['status'], overtimeHours = 0, unitsProduced = 0) => {
    try {
      let dailyWageEarned = 0;
      let otAmount = 0;

      if (status === 'present') {
        dailyWageEarned = employee.wageType === 'piece_rate' 
          ? ((unitsProduced || 2500) / 1000) * (employee.pieceRatePerThousand || 650)
          : employee.dailyWage;
        otAmount = overtimeHours * (employee.dailyWage / 8);
      } else if (status === 'half_day') {
        dailyWageEarned = employee.dailyWage / 2;
      }

      await labourService.recordAttendance(factoryId, [
        {
          date: selectedDate,
          employeeId: employee.id,
          employeeName: employee.name,
          jobType: employee.jobType,
          status,
          overtimeHours,
          overtimeAmount: Math.round(otAmount),
          unitsProduced,
          dailyWageEarned: Math.round(dailyWageEarned),
        }
      ]);

      toast.success(`Marked ${employee.name} as ${status.toUpperCase()}`);
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await labourService.createEmployee(factoryId, {
        employeeCode: employeeForm.employeeCode,
        name: employeeForm.name,
        phone: employeeForm.phone,
        address: employeeForm.address,
        joiningDate: employeeForm.joiningDate,
        jobType: employeeForm.jobType,
        wageType: employeeForm.wageType,
        dailyWage: Number(employeeForm.dailyWage),
        pieceRatePerThousand: Number(employeeForm.pieceRatePerThousand),
        aadharNumber: employeeForm.aadharNumber,
        emergencyContact: employeeForm.emergencyContact,
        status: employeeForm.status,
      });

      toast.success(`Registered employee ${employeeForm.name}`);
      setIsEmployeeModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error creating worker');
    }
  };

  const handleOpenPayModal = (slip: WageSlip) => {
    setSelectedWageSlip(slip);
    setPayAmount(slip.pendingAmount);
    setIsPayWageModalOpen(true);
  };

  const handleExecuteWagePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWageSlip) return;

    try {
      await labourService.payWageBalance(selectedWageSlip.id, Number(payAmount), payMode);
      toast.success(`Disbursed ₹${payAmount} to ${selectedWageSlip.employeeName}`);
      setIsPayWageModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Attendance Attendance Metrics
  const totalActiveWorkers = employees.filter(e => e.status === 'active').length;
  const presentToday = attendance.filter(a => a.status === 'present').length;
  const halfDayToday = attendance.filter(a => a.status === 'half_day').length;
  const absentToday = attendance.filter(a => a.status === 'absent').length;
  const totalOvertimeHrs = attendance.reduce((acc, a) => acc + (a.overtimeHours || 0), 0);

  // Employee Directory Columns
  const employeeColumns: Column<Employee>[] = [
    {
      header: 'Worker Name & Code',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            <span className="bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-700">{row.employeeCode}</span>
            <span className="ml-2">{row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Role / Job Type',
      accessorKey: 'jobType',
      cell: (row) => <Badge variant="charcoal">{row.jobType}</Badge>,
    },
    {
      header: 'Wage Structure',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">
            {row.wageType === 'daily' ? `${formatINR(row.dailyWage)} / Day` : `${formatINR(row.pieceRatePerThousand)} / 1000 Bricks`}
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {row.wageType === 'daily' ? 'Standard Daily Wage' : 'Piece-Rate Loading/Moulding'}
          </span>
        </div>
      ),
    },
    {
      header: 'Joining Date & Address',
      cell: (row) => (
        <div className="text-xs text-slate-600">
          <div>Joined: {formatDate(row.joiningDate)}</div>
          <div className="text-[11px] text-slate-400 truncate max-w-xs">{row.address}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  // Wage Slips Columns
  const wageColumns: Column<WageSlip>[] = [
    {
      header: 'Worker & Role',
      accessorKey: 'employeeName',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.employeeName}</div>
          <div className="text-xs text-slate-500 font-medium">{row.jobType} • {row.period}</div>
        </div>
      ),
    },
    {
      header: 'Attendance Tally',
      cell: (row) => (
        <div className="text-xs text-slate-700 space-y-0.5 font-medium">
          <div>Present: <strong className="text-emerald-700">{row.presentDays} Days</strong></div>
          <div>Half Days: {row.halfDays} • Overtime: {row.overtimeHours} hrs</div>
        </div>
      ),
    },
    {
      header: 'Gross Wages',
      cell: (row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{formatINR(row.grossAmount)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Base: {formatINR(row.baseWageAmount)} + OT: {formatINR(row.overtimeAmount)}
          </div>
        </div>
      ),
    },
    {
      header: 'Deductions & Net',
      cell: (row) => (
        <div>
          <div className="font-mono font-black text-emerald-700">{formatINR(row.netPayable)}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">
            Advance: -{formatINR(row.advanceDeduction)}
          </div>
        </div>
      ),
    },
    {
      header: 'Payout Status',
      accessorKey: 'status',
      cell: (row) => (
        <div>
          <StatusBadge status={row.status} />
          {row.pendingAmount > 0 && (
            <div className="text-[11px] text-amber-700 font-bold mt-1">
              Due: {formatINR(row.pendingAmount)}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        row.pendingAmount > 0 ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenPayModal(row)}
            className="text-xs font-semibold shadow-xs"
          >
            Pay Wage
          </Button>
        ) : (
          <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
          </span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Labour & Wage Payroll"
        description="Manage employee muster roll, daily attendance matrix, piece-rate wages (₹/1000 bricks), advances, and wage payouts."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Operations' },
          { label: 'Labour' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsEmployeeModalOpen(true)}
          >
            + Register New Worker
          </Button>
        }
      />

      {/* Attendance KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Workforce</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">{totalActiveWorkers} Workers</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Present Today</span>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">{presentToday}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase">Half Day</span>
          <div className="text-xl font-black text-amber-600 font-mono mt-1">{halfDayToday}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase">Absent / Leave</span>
          <div className="text-xl font-black text-rose-600 font-mono mt-1">{absentToday}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-indigo-600 uppercase">Total Overtime</span>
          <div className="text-xl font-black text-indigo-600 font-mono mt-1">{totalOvertimeHrs} Hours</div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-[#E53935] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Daily Muster Roll ({formatDate(selectedDate, 'dd MMM')})
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'payroll'
                ? 'bg-[#E53935] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Wage Calculation & Payroll ({wageSlips.length})
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-[#E53935] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Worker Directory ({employees.length})
          </button>
        </div>

        {activeTab === 'attendance' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Muster Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-800"
            />
          </div>
        )}
      </div>

      {/* TAB 1: DAILY MUSTER ATTENDANCE MATRIX */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Attendance Muster Roll</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click status buttons to instantly mark attendance and compute daily earnings.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4">Worker Profile</th>
                  <th className="p-4">Job Role & Rate</th>
                  <th className="p-4 text-center">Mark Attendance Status</th>
                  <th className="p-4">Overtime / Units</th>
                  <th className="p-4 text-right">Daily Earned (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {employees.map(emp => {
                  const record = attendance.find(a => a.employeeId === emp.id);
                  const currentStatus = record?.status || 'present';
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-slate-400 font-mono text-[11px] mt-0.5">{emp.employeeCode} • {emp.phone}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="charcoal">{emp.jobType}</Badge>
                        <div className="text-[11px] text-slate-500 mt-1 font-semibold">
                          {emp.wageType === 'daily' ? `${formatINR(emp.dailyWage)} / day` : `${formatINR(emp.pieceRatePerThousand)} / 1000 pcs`}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleMarkStatus(emp, 'present', record?.overtimeHours, record?.unitsProduced)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleMarkStatus(emp, 'half_day')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'half_day'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Half Day
                          </button>
                          <button
                            onClick={() => handleMarkStatus(emp, 'absent')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleMarkStatus(emp, 'leave')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'leave'
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        {emp.wageType === 'piece_rate' ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              defaultValue={record?.unitsProduced || 2500}
                              onBlur={e => handleMarkStatus(emp, currentStatus, record?.overtimeHours, Number(e.target.value))}
                              className="w-20 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold"
                            />
                            <span className="text-[11px] text-slate-400">Pcs</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.5"
                              defaultValue={record?.overtimeHours || 0}
                              onBlur={e => handleMarkStatus(emp, currentStatus, Number(e.target.value), record?.unitsProduced)}
                              className="w-16 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold"
                            />
                            <span className="text-[11px] text-slate-400">OT Hrs</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono font-black text-slate-900 text-sm">
                          {formatINR(record?.dailyWageEarned || emp.dailyWage)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: WAGE CALCULATION & PAYROLL */}
      {activeTab === 'payroll' && (
        <DataTable
          data={wageSlips}
          columns={wageColumns}
          searchPlaceholder="Search wage slips by worker name..."
          searchKey="employeeName"
          exportFileName="labour-wage-slips"
        />
      )}

      {/* TAB 3: WORKER DIRECTORY */}
      {activeTab === 'roster' && (
        <DataTable
          data={employees}
          columns={employeeColumns}
          searchPlaceholder="Search employees by name, code or role..."
          searchKey="name"
          exportFileName="factory-employees-directory"
        />
      )}

      {/* REGISTER WORKER MODAL */}
      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        title="Register New Factory Worker"
        description="Add staff member, assign job category, and set daily wage or piece-rate rate."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Worker Full Name"
                placeholder="e.g. Rameshwar Patil"
                value={employeeForm.name}
                onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                required
                isRequired
              />
            </div>
            <div>
              <Input
                label="Worker Code"
                value={employeeForm.employeeCode}
                onChange={e => setEmployeeForm({ ...employeeForm, employeeCode: e.target.value })}
                required
                isRequired
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Phone"
              placeholder="+91 98220 12345"
              value={employeeForm.phone}
              onChange={e => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
              required
              isRequired
            />
            <Select
              label="Job Role"
              value={employeeForm.jobType}
              onChange={e => setEmployeeForm({ ...employeeForm, jobType: e.target.value as any })}
              isRequired
            >
              <option value="Supervisor">Supervisor</option>
              <option value="Machine Operator">Machine Operator</option>
              <option value="Kiln Worker">Kiln Worker</option>
              <option value="Mould Worker">Mould Worker</option>
              <option value="Loader">Loader (Truck Loading)</option>
              <option value="Driver">Driver</option>
              <option value="Helper">Helper</option>
              <option value="Accountant">Accountant</option>
              <option value="Other">Other Staff</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Wage Payment Method"
              value={employeeForm.wageType}
              onChange={e => setEmployeeForm({ ...employeeForm, wageType: e.target.value as any })}
            >
              <option value="daily">Daily Fixed Wage</option>
              <option value="piece_rate">Piece-Rate (per 1,000 Bricks made/loaded)</option>
            </Select>

            {employeeForm.wageType === 'daily' ? (
              <CurrencyInput
                label="Daily Wage Rate (₹)"
                value={employeeForm.dailyWage}
                onChange={e => setEmployeeForm({ ...employeeForm, dailyWage: Number(e.target.value) })}
                required
                isRequired
              />
            ) : (
              <CurrencyInput
                label="Piece Rate per 1,000 Bricks (₹)"
                value={employeeForm.pieceRatePerThousand}
                onChange={e => setEmployeeForm({ ...employeeForm, pieceRatePerThousand: Number(e.target.value) })}
                required
                isRequired
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Aadhar Card (Optional)"
              placeholder="XXXX-XXXX-1234"
              value={employeeForm.aadharNumber}
              onChange={e => setEmployeeForm({ ...employeeForm, aadharNumber: e.target.value })}
            />
            <Input
              label="Emergency Contact"
              placeholder="+91 98000 00000"
              value={employeeForm.emergencyContact}
              onChange={e => setEmployeeForm({ ...employeeForm, emergencyContact: e.target.value })}
            />
          </div>

          <Input
            label="Residential Address / Quarters"
            value={employeeForm.address}
            onChange={e => setEmployeeForm({ ...employeeForm, address: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsEmployeeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Register Worker
            </Button>
          </div>
        </form>
      </Modal>

      {/* PAY WAGE SETTLEMENT MODAL */}
      <Modal
        isOpen={isPayWageModalOpen}
        onClose={() => setIsPayWageModalOpen(false)}
        title={`Wage Settlement: ${selectedWageSlip?.employeeName}`}
        description={`Period: ${selectedWageSlip?.period} • Net Due: ${formatINR(selectedWageSlip?.pendingAmount)}`}
        maxWidth="md"
      >
        <form onSubmit={handleExecuteWagePayout} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Gross Earnings:</span>
              <span className="font-mono font-bold">{formatINR(selectedWageSlip?.grossAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-rose-600">
              <span>Advance Deductions:</span>
              <span className="font-mono font-bold">-{formatINR(selectedWageSlip?.advanceDeduction)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
              <span>Remaining Balance:</span>
              <span className="font-mono text-[#E53935]">{formatINR(selectedWageSlip?.pendingAmount)}</span>
            </div>
          </div>

          <CurrencyInput
            label="Disbursement Amount (₹)"
            value={payAmount}
            onChange={e => setPayAmount(Number(e.target.value))}
            required
            isRequired
          />

          <Select
            label="Disbursement Mode"
            value={payMode}
            onChange={e => setPayMode(e.target.value as any)}
          >
            <option value="cash">Cash in Hand</option>
            <option value="upi">UPI / GPay / PhonePe</option>
            <option value="bank_transfer">Direct Bank Transfer</option>
          </Select>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsPayWageModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Confirm Wage Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
