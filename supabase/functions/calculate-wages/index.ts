// =============================================================================
// BRICKFLOW ERP - Edge Function: calculate-wages
// Calculates labour attendance, overtime, piece rates, deductions, and generates wage records
// =============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors, formatSuccess, formatError } from '../_shared/cors.ts';
import { getSupabaseServiceClient, getAuthenticatedUser, resolveUserFactory } from '../_shared/supabaseClient.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return formatError('METHOD_NOT_ALLOWED', 'Only POST requests are accepted.', 405);
  }

  try {
    const { user } = await getAuthenticatedUser(req);
    const body = await req.json();

    const {
      factoryId: requestedFactoryId,
      period,
      startDate,
      endDate,
      employeeId,
    } = body;

    const factoryId = await resolveUserFactory(user.id, requestedFactoryId);

    if (!period || !startDate || !endDate) {
      return formatError('VALIDATION_ERROR', 'Period, start date, and end date are required.', 422);
    }

    const serviceClient = getSupabaseServiceClient();

    let empQuery = serviceClient.from('employees').select('*').eq('factory_id', factoryId).eq('status', 'active');
    if (employeeId) {
      empQuery = empQuery.eq('id', employeeId);
    }
    const { data: employees, error: empErr } = await empQuery;
    if (empErr || !employees?.length) {
      return formatError('NOT_FOUND', 'No active employees found.', 404);
    }

    const wageRecords = [];

    for (const emp of employees) {
      const { data: records } = await serviceClient
        .from('attendance')
        .select('*')
        .eq('factory_id', factoryId)
        .eq('employee_id', emp.id)
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate);

      const attendanceList = records || [];
      const presentDays = attendanceList.filter(a => a.status === 'present').length;
      const halfDays = attendanceList.filter(a => a.status === 'half_day').length;
      const absentDays = attendanceList.filter(a => a.status === 'absent').length;
      const effectiveDays = presentDays + (halfDays * 0.5);

      const totalOvertimeHours = attendanceList.reduce((acc, a) => acc + Number(a.overtime_hours || 0), 0);
      const totalUnitsProduced = attendanceList.reduce((acc, a) => acc + Number(a.units_produced || 0), 0);

      const baseWage = emp.wage_type === 'daily' ? effectiveDays * Number(emp.daily_wage || 0) : 0;
      const overtimeAmount = totalOvertimeHours * ((Number(emp.daily_wage || 0) / 8) * 1.5);
      const pieceRateAmount = emp.wage_type === 'piece_rate' ? (totalUnitsProduced / 1000) * Number(emp.piece_rate_per_thousand || 0) : 0;
      const grossAmount = baseWage + overtimeAmount + pieceRateAmount;
      const advanceDeduction = 0.00;
      const netPayable = Math.max(0, grossAmount - advanceDeduction);

      const { data: wageRecord, error: wageErr } = await serviceClient
        .from('wage_records')
        .insert({
          factory_id: factoryId,
          employee_id: emp.id,
          period,
          period_start: startDate,
          period_end: endDate,
          present_days: effectiveDays,
          half_days: halfDays,
          absent_days: absentDays,
          overtime_hours: totalOvertimeHours,
          base_wage: baseWage,
          overtime_amount: overtimeAmount,
          piece_rate_amount: pieceRateAmount,
          advance_amount: advanceDeduction,
          deduction_amount: 0.00,
          net_payable: netPayable,
          paid_amount: 0.00,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (!wageErr && wageRecord) {
        wageRecords.push({ ...wageRecord, employeeName: emp.name, jobType: emp.job_type });
      }
    }

    return formatSuccess({
      period,
      count: wageRecords.length,
      records: wageRecords,
    }, 'Wages calculated and wage records generated successfully.');
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'SERVER_ERROR';
    return formatError(code, err.message || 'Internal server error', statusCode);
  }
});
