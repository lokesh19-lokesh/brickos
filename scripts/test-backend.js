import pg from 'pg';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:Brickserp04_09_2026@db.apvacpivgvbuutfdwemx.supabase.co:5432/postgres';

async function testBackend() {
  console.log('--- Testing Supabase Backend Endpoints & PostgreSQL Functions ---');
  const client = new pg.Client({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // 1. Check Demo Factory
    const factoryRes = await client.query(`
      SELECT f.id, f.name, f.code, f.factory_type, p.full_name as owner_name, s.plan_id, s.status as sub_status
      FROM factories f
      LEFT JOIN profiles p ON p.id = f.owner_id
      LEFT JOIN subscriptions s ON s.factory_id = f.id
      WHERE f.code = 'SRB-01';
    `);
    console.log('\n1. Demo Factory Details:');
    console.table(factoryRes.rows);

    const factoryId = factoryRes.rows[0].id;

    // 2. Check Raw Material Stock via view
    const rmRes = await client.query(`
      SELECT material_name, material_code, unit_name, current_stock, minimum_stock, is_low_stock, total_valuation
      FROM view_raw_material_inventory
      WHERE factory_id = $1;
    `, [factoryId]);
    console.log('\n2. Raw Material Inventory Valuation:');
    console.table(rmRes.rows);

    // 3. Check Finished Goods Stock via view
    const fgRes = await client.query(`
      SELECT product_name, product_code, unit_name, current_stock, minimum_stock, selling_price, total_inventory_sales_value
      FROM view_finished_goods_inventory
      WHERE factory_id = $1;
    `, [factoryId]);
    console.log('\n3. Finished Goods Inventory:');
    console.table(fgRes.rows);

    // 4. Check Customer Aging & Receivables
    const agingRes = await client.query(`
      SELECT customer_name, company_name, total_sales, total_paid, outstanding_balance, aging_0_15_days
      FROM view_customer_aging
      WHERE factory_id = $1;
    `, [factoryId]);
    console.log('\n4. Customer Receivables & Aging:');
    console.table(agingRes.rows);

    // 5. Test Profit & Loss PostgreSQL Function
    const pnlRes = await client.query(`
      SELECT get_factory_profit_and_loss(
        $1::UUID, 
        (CURRENT_DATE - INTERVAL '30 days')::DATE, 
        CURRENT_DATE
      ) AS pnl_data;
    `, [factoryId]);
    console.log('\n5. 30-Day P&L Statement from DB Function:');
    console.log(JSON.stringify(pnlRes.rows[0].pnl_data, null, 2));

    // 6. Test Sequential Invoice Generator
    const invNumRes = await client.query(`
      SELECT generate_invoice_number($1::UUID) AS next_invoice;
    `, [factoryId]);
    console.log('\n6. Next Sequential Invoice Number:');
    console.log(invNumRes.rows[0].next_invoice);

    console.log('\n✓ ALL BACKEND TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testBackend();
