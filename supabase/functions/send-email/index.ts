// =============================================================================
// BRICKFLOW ERP - Edge Function: send-email
// Dispatches transactional emails via Resend (Invoices, Receipts, Alerts)
// =============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors, formatSuccess, formatError } from '../_shared/cors.ts';
import { getSupabaseServiceClient, getAuthenticatedUser, resolveUserFactory } from '../_shared/supabaseClient.ts';
import { sendResendEmail, getInvoiceEmailHtml } from '../_shared/email.ts';

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
      type = 'invoice',
      to,
      subject,
      invoiceId,
      factoryId: requestedFactoryId,
      customHtml,
    } = body;

    const factoryId = await resolveUserFactory(user.id, requestedFactoryId);
    const serviceClient = getSupabaseServiceClient();

    if (type === 'invoice') {
      if (!invoiceId) {
        return formatError('VALIDATION_ERROR', 'invoiceId is required for invoice emails.', 422);
      }

      const { data: invoice, error: invErr } = await serviceClient
        .from('invoices')
        .select('*, factories(*)')
        .eq('id', invoiceId)
        .eq('factory_id', factoryId)
        .single();

      if (invErr || !invoice) {
        return formatError('NOT_FOUND', 'Invoice not found.', 404);
      }

      const customer = invoice.customer_snapshot || {};
      const recipient = to || customer.email;

      if (!recipient) {
        return formatError('VALIDATION_ERROR', 'No recipient email address provided or found in customer details.', 422);
      }

      const emailSubject = subject || `Tax Invoice #${invoice.invoice_number} from ${invoice.factories?.name || 'BrickFlow ERP'}`;
      const emailHtml = getInvoiceEmailHtml(invoice, invoice.factories, customer);

      const emailResult = await sendResendEmail({
        to: recipient,
        subject: emailSubject,
        html: emailHtml,
      });

      if (!emailResult.success) {
        return formatError('EMAIL_SEND_FAILED', emailResult.error || 'Failed to send invoice email', 500);
      }

      return formatSuccess({
        recipient,
        subject: emailSubject,
        resendId: emailResult.data?.id,
      }, `Invoice email sent to ${recipient} successfully.`);
    }

    if (type === 'custom') {
      if (!to || !subject || !customHtml) {
        return formatError('VALIDATION_ERROR', 'to, subject, and customHtml are required for custom emails.', 422);
      }

      const emailResult = await sendResendEmail({
        to,
        subject,
        html: customHtml,
      });

      if (!emailResult.success) {
        return formatError('EMAIL_SEND_FAILED', emailResult.error || 'Failed to send email', 500);
      }

      return formatSuccess({
        recipient: to,
        subject,
        resendId: emailResult.data?.id,
      }, `Email sent to ${to} successfully.`);
    }

    return formatError('INVALID_EMAIL_TYPE', `Unsupported email type: ${type}`, 400);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'SERVER_ERROR';
    return formatError(code, err.message || 'Internal server error', statusCode);
  }
});
