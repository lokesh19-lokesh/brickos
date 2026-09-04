// =============================================================================
// BRICKFLOW ERP - Edge Function: record-customer-payment
// Records customer payments, updates receivables, invoices, and ledger
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
      customerId,
      saleId,
      amount,
      paymentDate,
      paymentMode,
      reference,
      notes,
    } = body;

    const factoryId = await resolveUserFactory(user.id, requestedFactoryId);

    if (!customerId || !amount || Number(amount) <= 0) {
      return formatError('VALIDATION_ERROR', 'Customer ID and a positive payment amount are required.', 422);
    }

    const serviceClient = getSupabaseServiceClient();

    const { data, error } = await serviceClient.rpc('record_customer_payment', {
      p_factory_id: factoryId,
      p_customer_id: customerId,
      p_sale_id: saleId || null,
      p_amount: Number(amount),
      p_payment_date: paymentDate || new Date().toISOString().split('T')[0],
      p_payment_mode: paymentMode || 'upi',
      p_reference: reference || null,
      p_notes: notes || null,
    });

    if (error) {
      return formatError('PAYMENT_FAILED', error.message, 500, error);
    }

    if (data && data.success === false) {
      return formatError(data.error?.code || 'PAYMENT_ERROR', data.error?.message || 'Failed to record customer payment', 400);
    }

    return formatSuccess(data.data, data.message || 'Customer payment recorded successfully.');
  } catch (err: any) {
    return formatError('SERVER_ERROR', err.message || 'Internal server error', 500);
  }
});
