import { requireSuperAdmin } from '../../../../lib/security.js';
import { getDbClient, ensureDbInitialized } from '../../../../lib/db.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Super Admin only: shows which database is connected and row counts (no secrets exposed)
export async function GET(request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.authorized) {
    return new Response(JSON.stringify({ message: auth.error || 'Super Admin access required.' }), {
      status: auth.status || 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rawUrl =
    process.env.TURSO_DATABASE_URL || process.env.TURSO_DB_URL || process.env.DATABASE_URL || '';
  let host = 'local-sqlite-file (ephemeral on Vercel)';
  try {
    if (rawUrl && !rawUrl.startsWith('file:')) host = new URL(rawUrl.replace(/^libsql:/i, 'https:')).host;
  } catch (_) {}

  try {
    await ensureDbInitialized();
    const db = getDbClient();
    const [u, a, t] = await Promise.all([
      db.execute('SELECT COUNT(*) AS c FROM users'),
      db.execute('SELECT COUNT(*) AS c FROM accounts'),
      db.execute('SELECT COUNT(*) AS c FROM transactions'),
    ]);
    return new Response(
      JSON.stringify({
        connected: true,
        databaseHost: host,
        users: Number(u.rows[0].c),
        accounts: Number(a.rows[0].c),
        transactions: Number(t.rows[0].c),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ connected: false, databaseHost: host, error: String(err?.message || err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

