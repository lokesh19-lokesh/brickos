// =============================================================================
// BRICKFLOW ERP - Edge Function: complete-sale
// Handles atomic sales order creation, finished goods deduction, and invoice generation
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
      saleDate,
      items,
      deliveryDetails,
      paidAmount,
      paymentMode,
      notes,
    } = body;

    const factoryId = await resolveUserFactory(user.id, requestedFactoryId);

    if (!customerId || !items?.length) {
      return formatError('VALIDATION_ERROR', 'Customer ID and sale line items are required.', 422);
    }

    const serviceClient = getSupabaseServiceClient();

    const { data, error } = await serviceClient.rpc('complete_sale', {
      p_factory_id: factoryId,
      p_customer_id: customerId,
      p_sale_date: saleDate || new Date().toISOString().split('T')[0],
      p_items: items,
      p_delivery_details: deliveryDetails || {},
      p_paid_amount: Number(paidAmount) || 0.00,
      p_payment_mode: paymentMode || 'upi',
      p_notes: notes || null,
    });

    if (error) {
      return formatError('SALE_TRANSACTION_FAILED', error.message, 500, error);
    }

    if (data && data.success === false) {
      return formatError(data.error?.code || 'SALE_ERROR', data.error?.message || 'Failed to complete sale', 400);
    }

    return formatSuccess(data.data, data.message || 'Sale created and invoice generated successfully.');
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'SERVER_ERROR';
    return formatError(code, err.message || 'Internal server error', statusCode);
  }
});
