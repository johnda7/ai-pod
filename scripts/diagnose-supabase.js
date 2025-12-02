import pg from 'pg';
const { Client } = pg;

// Используем твой пароль
const password = encodeURIComponent('/zfQehFUjs94D3+');
const connectionString = `postgresql://postgres:${password}@db.rnxqyltjbcwqwblnhuhm.supabase.co:5432/postgres`;

console.log("🔍 DIAGNOSTIC TOOL: Checking Supabase State...");

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function diagnose() {
  try {
    await client.connect();
    console.log("✅ Database Connected!");

    // 1. Check 'users' table schema
    const resSchema = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    console.log("\n📊 Table 'users' columns:");
    resSchema.rows.forEach(row => console.log(` - ${row.column_name} (${row.data_type})`));

    // 2. Check RLS Policies
    const resPolicies = await client.query(`
      SELECT policyname, cmd, roles 
      FROM pg_policies 
      WHERE tablename = 'users';
    `);
    console.log("\n🔐 RLS Policies on 'users':");
    if (resPolicies.rows.length === 0) {
        console.log(" ⚠️ NO POLICIES FOUND! (This might be why updates fail if RLS is enabled)");
    } else {
        resPolicies.rows.forEach(row => console.log(` - ${row.policyname} (${row.cmd})`));
    }

    // 3. Check Trigger
    const resTriggers = await client.query(`
        SELECT trigger_name, event_manipulation 
        FROM information_schema.triggers 
        WHERE event_object_table = 'users';
    `);
    console.log("\n🔫 Triggers on 'users':");
    resTriggers.rows.forEach(row => console.log(` - ${row.trigger_name} (${row.event_manipulation})`));

    // 4. Check a sample user (YOU)
    // Попробуем найти пользователя с монетами > 0
    const resUser = await client.query(`
        SELECT id, name, coins, xp, updated_at, inventory 
        FROM users 
        WHERE coins > 0 
        LIMIT 5;
    `);
    console.log("\n👤 Users with coins > 0:");
    resUser.rows.forEach(u => console.log(u));

  } catch (err) {
    console.error("❌ CONNECTION ERROR:", err);
  } finally {
    await client.end();
  }
}

diagnose();





