const PROJECT_URL = process.env.VITE_SUPABASE_URL || 'https://apvacpivgvbuutfdwemx.supabase.co';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwdmFjcGl2Z3ZidXV0ZmR3ZW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NjM3MzMsImV4cCI6MjEwNDAzOTczM30.E-FAhGYb7ZxqxHyWbw3XdqHBzpV2tNYWOPzbaxHILHA';

const functions = [
  'register-factory',
  'complete-production',
  'complete-sale',
  'generate-invoice',
  'generate-invoice-pdf',
  'send-invoice-whatsapp',
  'send-email',
  'record-customer-payment',
  'record-vendor-payment',
  'calculate-wages',
  'generate-report',
  'manage-subscription',
  'create-demo',
  'reset-demo-data'
];

async function verifyAll() {
  console.log('=== Verifying Live Status of All 14 Edge Functions ===\n');
  const results = [];

  for (const func of functions) {
    const url = `${PROJECT_URL}/functions/v1/${func}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const json = await res.json().catch(() => null);
      
      results.push({
        Function: func,
        Status: `${res.status} ${res.statusText}`,
        Live: res.status < 500 ? 'YES ✅' : 'ERROR ❌',
        Response: json?.error?.code || json?.message || 'OK'
      });
    } catch (err) {
      results.push({
        Function: func,
        Status: 'FETCH_ERROR',
        Live: 'NO ❌',
        Response: err.message
      });
    }
  }

  console.table(results);
  const allLive = results.every(r => r.Live.includes('✅'));
  if (allLive) {
    console.log('\n🎉 ALL 14 EDGE FUNCTIONS ARE LIVE & RESPONDING ON SUPABASE CLOUD!');
  } else {
    console.log('\n⚠️ Some functions encountered errors.');
  }
}

verifyAll();
