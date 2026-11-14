import { verifyRequestOrigin, getSessionFromRequest } from '../../../../lib/security.js';
import { incrementSuperAdminTokenVersion, getBankData, saveBankData } from '../../../../lib/db.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  const originCheck = verifyRequestOrigin(request);
  if (!originCheck.valid) {
    return new Response(JSON.stringify({ message: 'Forbidden: Invalid request origin.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const session = await getSessionFromRequest(request);
    if (session?.role === 'superadmin') {
      await incrementSuperAdminTokenVersion();
    } else if (session?.id) {
      const data = await getBankData();
      const userIdx = (data.users || []).findIndex(
        (u) => u.id === session.id || (session.email && u.email?.toLowerCase() === session.email.toLowerCase())
      );
      if (userIdx !== -1) {
        data.users[userIdx].tokenVersion = (Number(data.users[userIdx].tokenVersion) || 1) + 1;
        await saveBankData(data);
      }
    }
  } catch (err) {
    console.error('Error revoking session token on logout:', err);
  }

  const isProd = process.env.NODE_ENV === 'production';
  const clearSessionCookie = `session_token=; Path=/; HttpOnly; Max-Age=0; ${isProd ? 'Secure;' : ''}`;
  const clearAuthCookie = `isAuthenticated=; Path=/; Max-Age=0; ${isProd ? 'Secure;' : ''}`;
  const clearUserCookie = `user=; Path=/; Max-Age=0; ${isProd ? 'Secure;' : ''}`;

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
  });
  headers.append('Set-Cookie', clearSessionCookie);
  headers.append('Set-Cookie', clearAuthCookie);
  headers.append('Set-Cookie', clearUserCookie);

  return new Response(JSON.stringify({ success: true, message: 'Logged out successfully.' }), {
    status: 200,
    headers,
  });
}
