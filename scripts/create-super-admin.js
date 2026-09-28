import pg from 'pg';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:Brickserp04_09_2026@db.apvacpivgvbuutfdwemx.supabase.co:5432/postgres';

async function setupSuperAdmin() {
  console.log('Connecting to Supabase PostgreSQL...');
  const client = new pg.Client({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const email = 'brickserpsoftware@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';

  console.log(`Setting up Super Admin for: ${email}`);

  // 1. Check existing auth.users
  const authRes = await client.query('SELECT id, email FROM auth.users WHERE email = $1', [email]);
  let userId;

  if (authRes.rowCount === 0) {
    console.log('Creating auth.users entry...');
    const insertAuth = await client.query(`
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        $1,
        crypt($2, gen_salt('bf')),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"BrickOS Super Admin","role":"super_admin"}'::jsonb,
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
      ) RETURNING id;
    `, [email, password]);

    userId = insertAuth.rows[0].id;
    console.log('Created auth.users record with ID:', userId);

    // Create auth.identities
    await client.query(`
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at,
        email
      ) VALUES (
        gen_random_uuid(),
        $1::uuid,
        json_build_object('sub', $1::text, 'email', $2::text)::jsonb,
        'email',
        $2,
        NOW(),
        NOW(),
        NOW(),
        $2
      );
    `, [userId, email]);
    console.log('Created auth.identities record');
  } else {
    userId = authRes.rows[0].id;
    console.log('Found existing auth.users record with ID:', userId);
    await client.query(`
      UPDATE auth.users
      SET encrypted_password = crypt($2, gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
          raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
          raw_user_meta_data = '{"full_name":"BrickOS Super Admin","role":"super_admin"}'::jsonb,
          updated_at = NOW()
      WHERE id = $1;
    `, [userId, password]);
    console.log('Updated password and metadata in auth.users');
  }

  // 2. Insert or update in public.profiles
  const profRes = await client.query('SELECT id FROM profiles WHERE email = $1', [email]);
  if (profRes.rowCount === 0) {
    await client.query(`
      INSERT INTO profiles (
        id,
        auth_user_id,
        full_name,
        email,
        phone,
        role,
        status,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        $1,
        'BrickOS Super Admin',
        $2,
        '+91 85006 93113',
        'super_admin',
        'active',
        NOW(),
        NOW()
      );
    `, [userId, email]);
    console.log('Created public.profiles record with role = super_admin');
  } else {
    await client.query(`
      UPDATE profiles
      SET auth_user_id = $1,
          role = 'super_admin',
          full_name = 'BrickOS Super Admin',
          status = 'active',
          updated_at = NOW()
      WHERE email = $2;
    `, [userId, email]);
    console.log('Updated public.profiles record to role = super_admin');
  }

  // 3. Verify
  const verify = await client.query(`
    SELECT p.id as profile_id, p.full_name, p.email, p.role, p.status, p.auth_user_id,
           u.email_confirmed_at IS NOT NULL as is_confirmed
    FROM profiles p
    LEFT JOIN auth.users u ON u.id = p.auth_user_id
    WHERE p.email = $1;
  `, [email]);

  // 4. Also ensure default Factory Owner has valid auth credentials
  const ownerEmail = 'info@shreerambricks.com';
  const ownerPassword = 'Owner@123456';
  const ownerAuth = await client.query('SELECT id FROM auth.users WHERE email = $1', [ownerEmail]);
  let ownerUserId;
  if (ownerAuth.rowCount === 0) {
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
    `, [ownerEmail, ownerPassword]);
    ownerUserId = res.rows[0].id;
    await client.query(`
      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1::uuid, json_build_object('sub', $1::text, 'email', $2::text)::jsonb,
        'email', $2, NOW(), NOW(), NOW()
      );
    `, [ownerUserId, ownerEmail]);
  } else {
    ownerUserId = ownerAuth.rows[0].id;
    await client.query(`
      UPDATE auth.users
      SET encrypted_password = crypt($2, gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
          updated_at = NOW()
      WHERE id = $1;
    `, [ownerUserId, ownerPassword]);
  }

  await client.query(`
    UPDATE profiles
    SET auth_user_id = $1, updated_at = NOW()
    WHERE email = $2;
  `, [ownerUserId, ownerEmail]);

  const profId = '00000000-0000-0000-0000-000000000001';
  const factId = '00000000-0000-0000-0000-000000000002';
  const fuCheck = await client.query('SELECT * FROM factory_users WHERE user_id = $1 AND factory_id = $2', [profId, factId]);
  if (fuCheck.rowCount === 0) {
    await client.query(`
      INSERT INTO factory_users (id, factory_id, user_id, role, status, created_at)
      VALUES (gen_random_uuid(), $1, $2, 'factory_owner', 'active', NOW());
    `, [factId, profId]);
  }
  console.log('✓ Factory owner (info@shreerambricks.com) configured and linked.');

  await client.end();
}

setupSuperAdmin().catch(err => {
  console.error('Failed to setup Super Admin:', err);
  process.exit(1);
});

