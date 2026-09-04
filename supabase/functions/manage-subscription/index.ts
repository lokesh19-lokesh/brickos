// =============================================================================
// BRICKFLOW ERP - Edge Function: manage-subscription
// Upgrades, renews, or updates factory SaaS subscription plans
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
    const { factoryId: requestedFactoryId, planId, billingPeriod, paymentReference } = body;

    const factoryId = await resolveUserFactory(user.id, requestedFactoryId);

    if (!planId) {
      return formatError('VALIDATION_ERROR', 'planId is required.', 422);
    }

    const serviceClient = getSupabaseServiceClient();

    const { data: plan, error: planErr } = await serviceClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planErr || !plan) {
      return formatError('PLAN_NOT_FOUND', 'Subscription plan not found.', 404);
    }

    const durationDays = billingPeriod === 'yearly' ? 365 : 30;
    const priceMultiplier = billingPeriod === 'yearly' ? 10 : 1;
    const totalAmount = Number(plan.price) * priceMultiplier;

    const { data: subscription, error: subErr } = await serviceClient
      .from('subscriptions')
      .insert({
        factory_id: factoryId,
        plan_id: plan.id,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + durationDays * 86400000).toISOString().split('T')[0],
        status: 'active',
        amount: totalAmount,
        payment_reference: paymentReference || `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      })
      .select()
      .single();

    if (subErr) {
      return formatError('SUBSCRIPTION_FAILED', subErr.message, 500);
    }

    await serviceClient.from('subscription_payments').insert({
      factory_id: factoryId,
      subscription_id: subscription.id,
      amount: totalAmount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_mode: 'upi',
      reference: paymentReference || subscription.payment_reference,
      status: 'paid',
    });

    return formatSuccess(subscription, `Successfully upgraded to ${plan.name}.`);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'SERVER_ERROR';
    return formatError(code, err.message || 'Internal server error', statusCode);
  }
});
