#!/bin/bash
# =============================================================================
# BRICKFLOW ERP - Edge Functions Deployment Script
# Deploys all edge functions to Supabase Project: apvacpivgvbuutfdwemx
# =============================================================================

PROJECT_REF="apvacpivgvbuutfdwemx"

echo "=== Deploying Supabase Edge Functions to project: $PROJECT_REF ==="

FUNCTIONS=(
  "register-factory"
  "complete-production"
  "complete-sale"
  "generate-invoice"
  "generate-invoice-pdf"
  "send-invoice-whatsapp"
  "send-email"
  "record-customer-payment"
  "record-vendor-payment"
  "calculate-wages"
  "generate-report"
  "manage-subscription"
  "create-demo"
  "reset-demo-data"
)

for func in "${FUNCTIONS[@]}"; do
  echo ""
  echo "Deploying function: $func..."
  npx supabase functions deploy "$func" --project-ref "$PROJECT_REF" --no-verify-jwt
  if [ $? -eq 0 ]; then
    echo "✓ Function $func deployed successfully."
  else
    echo "✗ Failed to deploy $func. Please ensure you are logged in (npx supabase login) or SUPABASE_ACCESS_TOKEN is set."
  fi
done

echo ""
echo "=== Deployment process finished ==="
