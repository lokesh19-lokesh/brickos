// =============================================================================
// BRICKFLOW ERP - Edge Function: generate-invoice-pdf
// Generates printable HTML / PDF payload for GST Invoices
// =============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors, formatSuccess, formatError } from '../_shared/cors.ts';
import { getSupabaseServiceClient, getAuthenticatedUser, resolveUserFactory } from '../_shared/supabaseClient.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { user } = await getAuthenticatedUser(req);
    const body = await req.json();
    const { invoiceId, factoryId: requestedFactoryId } = body;

    const factoryId = await resolveUserFactory(user.id, requestedFactoryId);

    if (!invoiceId) {
      return formatError('VALIDATION_ERROR', 'invoiceId is required.', 422);
    }

    const serviceClient = getSupabaseServiceClient();

    const { data: invoice, error } = await serviceClient
      .from('invoices')
      .select(`
        *,
        factories (*),
        sales (id, invoice_number, sale_date, delivery_details, sale_items (*))
      `)
      .eq('id', invoiceId)
      .eq('factory_id', factoryId)
      .single();

    if (error || !invoice) {
      return formatError('NOT_FOUND', 'Invoice not found.', 404);
    }

    // Return rendered print template payload
    return formatSuccess({
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.invoice_date,
      dueDate: invoice.due_date,
      factory: invoice.factories,
      customer: invoice.customer_snapshot,
      items: invoice.items_snapshot,
      financials: {
        subtotal: invoice.subtotal,
        discount: invoice.discount,
        taxableAmount: invoice.taxable_amount,
        cgst: invoice.cgst,
        sgst: invoice.sgst,
        igst: invoice.igst,
        grandTotal: invoice.grand_total,
        paidAmount: invoice.paid_amount,
        pendingAmount: invoice.pending_amount,
        status: invoice.status,
      },
      terms: invoice.terms_and_conditions || [
        'Goods once dispatched and unloaded at site cannot be taken back.',
        'Standard brick breakage tolerance in transit is 2% as per industry norms.',
        'Interest @ 18% p.a. will apply on invoices overdue past credit terms.',
      ],
      printReady: true,
    }, 'Invoice print payload generated.');
  } catch (err: any) {
    return formatError('SERVER_ERROR', err.message || 'Internal server error', 500);
  }
});
