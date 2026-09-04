// =============================================================================
// BRICKFLOW ERP - supabase/functions/_shared/email.ts
// Resend Email Integration with Responsive Branded ERP Templates
// =============================================================================

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendResendEmail(options: SendEmailOptions): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const senderEmail = Deno.env.get('SENDER_EMAIL') || 'business@brickos.in';
  const senderName = Deno.env.get('SENDER_NAME') || 'Patterns ERP Cloud Software';

  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY environment variable is not configured in Supabase secrets.' };
  }

  const from = `${senderName} <${senderEmail}>`;
  const to = Array.isArray(options.to) ? options.to : [options.to];

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      return { success: false, error: result.message || 'Failed to send email via Resend' };
    }
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error sending email' };
  }
}

/**
 * Branded GST Invoice Email Template
 */
export function getInvoiceEmailHtml(invoice: any, factory: any, customer: any): string {
  const itemsHtml = (invoice.items_snapshot || []).map((item: any) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">${item.name || item.product_name}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b; text-align: right;">${Number(item.quantity).toLocaleString('en-IN')} ${item.unit || item.unit_name || 'Pcs'}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b; text-align: right;">₹${Number(item.rate).toFixed(2)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b; text-align: right; font-weight: 600;">₹${Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #334155; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
      .header { background: #E53935; color: #ffffff; padding: 24px; }
      .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
      .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }
      .body { padding: 24px; }
      .table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      .table th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; }
      .total-box { background: #f8fafc; border-radius: 8px; padding: 16px; margin-top: 16px; border: 1px solid #e2e8f0; }
      .footer { padding: 16px 24px; background: #f1f5f9; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${factory?.name || 'BrickFlow ERP'}</h1>
        <p>Tax Invoice #${invoice.invoice_number} • Date: ${invoice.invoice_date}</p>
      </div>
      <div class="body">
        <p style="font-size: 14px; margin-top: 0;">Dear <strong>${customer?.name || 'Valued Customer'}</strong>,</p>
        <p style="font-size: 13px; color: #64748b;">Please find attached the summary of your dispatch invoice from <strong>${factory?.name}</strong>.</p>
        
        <table class="table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: right;">Qty</th>
              <th style="text-align: right;">Rate</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-box">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
            <span>Subtotal:</span>
            <span>₹${Number(invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
            <span>GST (Tax):</span>
            <span>₹${Number((invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #1e293b; border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 8px;">
            <span>Grand Total:</span>
            <span style="color: #E53935;">₹${Number(invoice.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-top: 6px; color: #16a34a; font-weight: 600;">
            <span>Paid Amount:</span>
            <span>₹${Number(invoice.paid_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-top: 4px; color: #dc2626; font-weight: 700;">
            <span>Pending Balance:</span>
            <span>₹${Number(invoice.pending_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        ${factory?.bank_details?.upiId ? `
          <div style="margin-top: 16px; padding: 12px; background: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0; font-size: 12px; color: #065f46;">
            <strong>💳 Instant UPI Payment:</strong> ${factory.bank_details.upiId}<br>
            <strong>Bank Account:</strong> ${factory.bank_details.bankName || 'HDFC Bank'} | A/C: ${factory.bank_details.accountNumber || '---'} | IFSC: ${factory.bank_details.ifscCode || '---'}
          </div>
        ` : ''}
      </div>
      <div class="footer">
        Sent securely via Patterns ERP Cloud Software • For queries, contact ${factory?.phone || 'your plant representative'}
      </div>
    </div>
  </body>
  </html>
  `;
}
