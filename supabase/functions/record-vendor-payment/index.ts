// =============================================================================
// BRICKFLOW ERP - Edge Function: record-vendor-payment
// Records vendor disbursements and updates raw material purchases ledger
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
      vendorId,
      purchaseId,
      amount,
      paymentDate,
      paymentMode,
      reference,
      notes,
    } = body;

    const factoryId = await resolveUserFactory(user.id, requestedFactoryId);

    if (!vendorId || !amount || Number(amount) <= 0) {
      return formatError('VALIDATION_ERROR', 'Vendor ID and a positive payment amount are required.', 422);
    }

    const serviceClient = getSupabaseServiceClient();

    const { data, error } = await serviceClient.rpc('record_vendor_payment', {
      p_factory_id: factoryId,
      p_vendor_id: vendorId,
      p_purchase_id: purchaseId || null,
      p_amount: Number(amount),
      p_payment_date: paymentDate || new Date().toISOString().split('T')[0],
      p_payment_mode: paymentMode || 'bank_transfer',
      p_reference: reference || null,
      p_notes: notes || null,
    });

    if (error) {
      return formatError('PAYMENT_FAILED', error.message, 500, error);
    }

    if (data && data.success === false) {
      return formatError(data.error?.code || 'PAYMENT_ERROR', data.error?.message || 'Failed to record vendor payment', 400);
    }

    return formatSuccess(data.data, data.message || 'Vendor payment recorded successfully.');
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'SERVER_ERROR';
    return formatError(code, err.message || 'Internal server error', statusCode);
  }
});
