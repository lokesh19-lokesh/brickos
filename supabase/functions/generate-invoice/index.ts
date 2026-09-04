// =============================================================================
// BRICKFLOW ERP - Edge Function: generate-invoice
// Retrieves or recalculates tax invoice details with customer and factory snapshots
// =============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors, formatSuccess, formatError } from '../_shared/cors.ts';
import { getSupabaseServiceClient, getAuthenticatedUser, resolveUserFactory } from '../_shared/supabaseClient.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { user } = await getAuthenticatedUser(req);
    const url = new URL(req.url);
    const invoiceId = url.searchParams.get('invoiceId');
    const requestedFactoryId = url.searchParams.get('factoryId');

    const factoryId = await resolveUserFactory(user.id, requestedFactoryId || undefined);

    if (!invoiceId) {
      return formatError('VALIDATION_ERROR', 'invoiceId query parameter is required.', 422);
    }

    const serviceClient = getSupabaseServiceClient();

    const { data: invoice, error } = await serviceClient
      .from('invoices')
      .select(`
        *,
        factories (id, name, code, phone, email, address, city, state, pincode, gst_number, logo_url, bank_details),
        sales (id, invoice_number, sale_date, delivery_details, notes, customers (*))
      `)
      .eq('id', invoiceId)
      .eq('factory_id', factoryId)
      .single();

    if (error || !invoice) {
      return formatError('NOT_FOUND', 'Invoice not found.', 404);
    }

    return formatSuccess(invoice, 'Invoice retrieved successfully.');
  } catch (err: any) {
    return formatError('SERVER_ERROR', err.message || 'Internal server error', 500);
  }
});
