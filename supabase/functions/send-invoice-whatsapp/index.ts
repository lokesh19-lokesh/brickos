// =============================================================================
// BRICKFLOW ERP - Edge Function: send-invoice-whatsapp
// Formats and returns WhatsApp sharing message and deep-link for invoices
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
    const { invoiceId, factoryId: requestedFactoryId, customPhone } = body;

    const factoryId = await resolveUserFactory(user.id, requestedFactoryId);

    if (!invoiceId) {
      return formatError('VALIDATION_ERROR', 'invoiceId is required.', 422);
    }

    const serviceClient = getSupabaseServiceClient();

    const { data: invoice, error } = await serviceClient
      .from('invoices')
      .select('*, factories(name, phone, bank_details)')
      .eq('id', invoiceId)
      .eq('factory_id', factoryId)
      .single();

    if (error || !invoice) {
      return formatError('NOT_FOUND', 'Invoice not found.', 404);
    }

    const customer = invoice.customer_snapshot || {};
    const recipientPhone = customPhone || customer.phone || customer.whatsapp || '';
    const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');

    const message = `*INVOICE DISPATCH - ${invoice.factories?.name || 'BrickFlow ERP'}*
----------------------------------------
📄 *Invoice #:* ${invoice.invoice_number}
📅 *Date:* ${invoice.invoice_date}
👤 *Customer:* ${customer.name || 'Valued Customer'}
🚚 *Vehicle:* ${invoice.vehicle_number || 'Dispatch Transport'}
----------------------------------------
💰 *Grand Total:* ₹${Number(invoice.grand_total).toLocaleString('en-IN')}
💵 *Paid Amount:* ₹${Number(invoice.paid_amount).toLocaleString('en-IN')}
⚠️ *Pending Amount:* ₹${Number(invoice.pending_amount).toLocaleString('en-IN')}
----------------------------------------
${invoice.factories?.bank_details?.upiId ? `💳 *UPI ID:* ${invoice.factories.bank_details.upiId}\n` : ''}Thank you for your business!`;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    return formatSuccess({
      phone: recipientPhone,
      message,
      whatsappUrl,
    }, 'WhatsApp sharing URL generated.');
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'SERVER_ERROR';
    return formatError(code, err.message || 'Internal server error', statusCode);
  }
});
