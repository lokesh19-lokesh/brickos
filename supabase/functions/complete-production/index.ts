// =============================================================================
// BRICKFLOW ERP - Edge Function: complete-production
// Handles atomic production batch logging and stock deductions
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
      batchCode,
      productionDate,
      productId,
      targetQuantity,
      outputQuantity,
      damagedQuantity,
      machineLine,
      kilnChamber,
      supervisorName,
      mixProportion,
      qualityGrade,
      consumptions,
      workers,
      remarks,
    } = body;

    // Resolve tenant securely
    const factoryId = await resolveUserFactory(user.id, requestedFactoryId);

    // Validation
    if (!batchCode || !productId || outputQuantity === undefined || !consumptions?.length) {
      return formatError('VALIDATION_ERROR', 'Batch code, product ID, output quantity, and raw material consumptions are required.', 422);
    }

    const serviceClient = getSupabaseServiceClient();

    // Call atomic PostgreSQL function
    const { data, error } = await serviceClient.rpc('complete_production', {
      p_factory_id: factoryId,
      p_batch_code: batchCode,
      p_production_date: productionDate || new Date().toISOString().split('T')[0],
      p_product_id: productId,
      p_target_quantity: Number(targetQuantity) || 0,
      p_output_quantity: Number(outputQuantity) || 0,
      p_damaged_quantity: Number(damagedQuantity) || 0,
      p_machine_line: machineLine || 'Line 1',
      p_kiln_chamber: kilnChamber || null,
      p_supervisor_name: supervisorName || 'Supervisor',
      p_mix_proportion: mixProportion || null,
      p_quality_grade: qualityGrade || 'A Grade',
      p_consumptions: consumptions,
      p_workers: workers || [],
      p_remarks: remarks || null,
    });

    if (error) {
      return formatError('PRODUCTION_TRANSACTION_FAILED', error.message, 500, error);
    }

    if (data && data.success === false) {
      return formatError(data.error?.code || 'PRODUCTION_ERROR', data.error?.message || 'Failed to complete production', 400);
    }

    return formatSuccess(data.data, data.message || 'Production batch completed successfully.');
  } catch (err: any) {
    return formatError('SERVER_ERROR', err.message || 'Internal server error', 500);
  }
});
