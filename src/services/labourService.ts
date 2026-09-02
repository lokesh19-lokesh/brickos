import { dbStore } from './mockDatabase';
import { Employee, AttendanceRecord, WageSlip, Payment } from '@/types';
import { generateId } from '@/utils/formatters';

export const labourService = {
  async getEmployees(factoryId: string): Promise<Employee[]> {
    await new Promise(res => setTimeout(res, 50));
    const employees = dbStore.get('employees');
    return employees.filter(e => e.factoryId === factoryId);
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const employees = dbStore.get('employees');
    return employees.find(e => e.id === id) || null;
  },

  async createEmployee(factoryId: string, payload: Omit<Employee, 'id' | 'factoryId' | 'createdAt'>): Promise<Employee> {
    await new Promise(res => setTimeout(res, 100));
    const employees = dbStore.get('employees');
    const newEmp: Employee = {
      ...payload,
      id: generateId('emp'),
      factoryId,
      createdAt: new Date().toISOString(),
    };

    dbStore.set('employees', [newEmp, ...employees]);
    dbStore.addAuditLog(factoryId, 'usr_current', 'Owner', 'factory_owner', 'Labour', 'CREATE', newEmp.id, newEmp.name, `Added new worker ${newEmp.name} (${newEmp.jobType})`);

    return newEmp;
  },

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    await new Promise(res => setTimeout(res, 100));
    const employees = dbStore.get('employees');
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Employee not found');

    const updated = { ...employees[index], ...updates };
    employees[index] = updated;
    dbStore.set('employees', [...employees]);
    return updated;
  },

  async getAttendance(factoryId: string, date?: string): Promise<AttendanceRecord[]> {
    await new Promise(res => setTimeout(res, 50));
    const records = dbStore.get('attendance').filter(a => a.factoryId === factoryId);
    if (date) {
      return records.filter(a => a.date === date);
    }
    return records;
  },

  async recordAttendance(factoryId: string, records: Omit<AttendanceRecord, 'id' | 'factoryId' | 'createdAt'>[]): Promise<AttendanceRecord[]> {
    await new Promise(res => setTimeout(res, 150));
    const attendance = dbStore.get('attendance');
    const savedRecords: AttendanceRecord[] = [];

    records.forEach(rec => {
      const existingIndex = attendance.findIndex(a => a.factoryId === factoryId && a.employeeId === rec.employeeId && a.date === rec.date);
      if (existingIndex !== -1) {
        attendance[existingIndex] = {
          ...attendance[existingIndex],
          ...rec,
        };
        savedRecords.push(attendance[existingIndex]);
      } else {
        const newRec: AttendanceRecord = {
          ...rec,
          id: generateId('att'),
          factoryId,
          createdAt: new Date().toISOString(),
        };
        attendance.unshift(newRec);
        savedRecords.push(newRec);
      }
    });

    dbStore.set('attendance', [...attendance]);
    dbStore.addAuditLog(factoryId, 'usr_current', 'Supervisor', 'factory_manager', 'Labour', 'UPDATE', `ATT-${records[0]?.date || 'Today'}`, 'Daily Attendance Roster', `Recorded attendance for ${records.length} workers.`);

    return savedRecords;
  },

  async getWageSlips(factoryId: string): Promise<WageSlip[]> {
    await new Promise(res => setTimeout(res, 50));
    const slips = dbStore.get('wageSlips');
    return slips.filter(s => s.factoryId === factoryId);
  },

  async generateWageSlip(factoryId: string, payload: Omit<WageSlip, 'id' | 'factoryId' | 'createdAt' | 'pendingAmount' | 'status'> & { paidAmount?: number }): Promise<WageSlip> {
    await new Promise(res => setTimeout(res, 150));
    const slips = dbStore.get('wageSlips');
    const payments = dbStore.get('payments');

    const paidAmount = Number(payload.paidAmount) || 0;
    const pendingAmount = Math.max(0, payload.netPayable - paidAmount);
    const status: WageSlip['status'] = pendingAmount === 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending');

    const newSlip: WageSlip = {
      ...payload,
      id: generateId('wage'),
      factoryId,
      paidAmount,
      pendingAmount,
      status,
      createdAt: new Date().toISOString(),
    };

    if (paidAmount > 0) {
      payments.unshift({
        id: generateId('pay'),
        factoryId,
        date: payload.paymentDate || new Date().toISOString().split('T')[0],
        partyType: 'labour',
        partyId: payload.employeeId,
        partyName: payload.employeeName,
        paymentType: 'payment',
        amount: paidAmount,
        paymentMode: payload.paymentMode || 'cash',
        reference: `Wage Payout for ${payload.period}`,
        notes: payload.remarks || `Settlement of wage for ${payload.employeeName}`,
        createdAt: new Date().toISOString(),
      });
      dbStore.set('payments', [...payments]);
    }

    dbStore.set('wageSlips', [newSlip, ...slips]);
    dbStore.addAuditLog(factoryId, 'usr_current', 'Accountant', 'factory_user', 'Labour Wages', 'CREATE', newSlip.id, `Wage Slip ${newSlip.employeeName} (${newSlip.period})`, `Generated wage slip for ${newSlip.employeeName}: Gross ₹${newSlip.grossAmount}, Net ₹${newSlip.netPayable}`);

    return newSlip;
  },

  async payWageBalance(wageSlipId: string, amount: number, paymentMode: 'cash' | 'upi' | 'bank_transfer'): Promise<WageSlip> {
    await new Promise(res => setTimeout(res, 100));
    const slips = dbStore.get('wageSlips');
    const payments = dbStore.get('payments');

    const index = slips.findIndex(s => s.id === wageSlipId);
    if (index === -1) throw new Error('Wage slip not found');

    const slip = slips[index];
    slip.paidAmount += amount;
    slip.pendingAmount = Math.max(0, slip.netPayable - slip.paidAmount);
    slip.status = slip.pendingAmount === 0 ? 'paid' : 'partial';
    slip.paymentDate = new Date().toISOString().split('T')[0];
    slip.paymentMode = paymentMode;

    slips[index] = slip;
    dbStore.set('wageSlips', [...slips]);

    payments.unshift({
      id: generateId('pay'),
      factoryId: slip.factoryId,
      date: new Date().toISOString().split('T')[0],
      partyType: 'labour',
      partyId: slip.employeeId,
      partyName: slip.employeeName,
      paymentType: 'payment',
      amount,
      paymentMode,
      reference: `Wage settlement for ${slip.period}`,
      createdAt: new Date().toISOString(),
    });
    dbStore.set('payments', [...payments]);

    return slip;
  }
};
