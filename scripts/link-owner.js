import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Brickserp04_09_2026@db.apvacpivgvbuutfdwemx.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const email = 'info@shreerambricks.com';
  const password = 'Owner@123456';

  const check = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
  let uid;
  if (check.rowCount === 0) {
    const res = await client.query(`
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
        $1, crypt($2, gen_salt('bf')), NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Rajesh Sharma","role":"factory_owner"}'::jsonb,
        NOW(), NOW(), '', '', '', ''
      ) RETURNING id;
    `, [email, password]);
    uid = res.rows[0].id;
    await client.query(`
      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1::uuid, json_build_object('sub', $1::text, 'email', $2::text)::jsonb,
        'email', $2, NOW(), NOW(), NOW()
      );
    `, [uid, email]);
  } else {
    uid = check.rows[0].id;
  }

  await client.query(`
    UPDATE profiles
    SET auth_user_id = $1, updated_at = NOW()
    WHERE email = $2;
  `, [uid, email]);

  console.log('Owner linked successfully:', email, 'auth_id:', uid);

  // Check super admin again
  const sa = await client.query('SELECT p.id, p.email, p.role, p.auth_user_id, u.email as auth_email FROM profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE p.email = $1', ['brickserpsoftware@gmail.com']);
  console.log('Super Admin in DB:', sa.rows[0]);

  await client.end();
}

run().catch(console.error);
