import { getBankData, resolveAdminContext } from '../../../../lib/db.js';
import { getSessionFromRequest } from '../../../../lib/security.js';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return new Response(JSON.stringify({ message: 'Unauthorized.' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get('userId');
    const queryEmail = searchParams.get('email');

    const isSuperAdmin = session.role === 'superadmin';
    const isRegularAdmin = session.role === 'admin';
    const isAdminSession = isSuperAdmin || isRegularAdmin;

    const data = await getBankData();

    let user = null;

    if (isSuperAdmin) {
      const effectiveId = queryUserId || session.id;
      const effectiveEmail = queryEmail || session.email;
      user = (data.users || []).find((u) => 
        (effectiveId && u.id === effectiveId) || 
        (effectiveEmail && u.email?.toLowerCase() === effectiveEmail?.toLowerCase())
      );
      if (!user && (data.users || []).length > 0) {
        user = (data.users || []).find((u) => u.role !== 'admin' && u.role !== 'superadmin') || data.users[0];
      }
    } else if (isRegularAdmin) {
      const ctx = resolveAdminContext(session, data);
      if (!ctx.valid) {
        return new Response(JSON.stringify({ message: ctx.error || 'Administrator session invalid or suspended.' }), {
          status: ctx.status || 403,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
          },
        });
      }

      if (queryUserId || queryEmail) {
        const target = (data.users || []).find((u) =>
          (queryUserId && u.id === queryUserId) ||
          (queryEmail && u.email?.toLowerCase() === queryEmail?.toLowerCase())
        );
        if (target) {
          if (!ctx.canAccessUser(target)) {
            return new Response(JSON.stringify({ message: 'Access denied: You do not have permission to view another administrator\'s users.' }), {
              status: 403,
              headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
              },
            });
          }
          user = target;
        }
      }

      if (!user) {
        // Find the first user onboarded by this specific administrator
        user = (data.users || []).find((u) => ctx.canAccessUser(u)) || null;
      }
    } else {
      // Regular client user: strictly bind to the authenticated session identity
      user = (data.users || []).find((u) => 
        (session.id && u.id === session.id) || 
        (session.email && u.email?.toLowerCase() === session.email?.toLowerCase())
      );
    }

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found in system.' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      });
    }

    // Active session status & token version check for non-admin accounts
    if (!isAdminSession) {
      const sessionVer = Number(session.tokenVersion) || 1;
      const userVer = Number(user.tokenVersion) || 1;
      if (sessionVer < userVer) {
        return new Response(
          JSON.stringify({ 
            message: 'Session expired or logged out by administrator. Please log in again.',
            loggedOut: true,
          }),
          {
            status: 401,
            headers: { 
              'Content-Type': 'application/json',
              'Set-Cookie': 'session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;',
              'Cache-Control': 'no-store, max-age=0, must-revalidate',
            },
          }
        );
      }

      if (user.status === 'blocked') {
        return new Response(JSON.stringify({ message: 'Account is blocked by administration.', accountStatus: 'blocked' }), {
          status: 403,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
          },
        });
      }

      if (user.status === 'suspended') {
        return new Response(JSON.stringify({ message: 'Account is temporarily suspended.', accountStatus: 'suspended' }), {
          status: 403,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
          },
        });
      }
    }

    const accounts = (data.accounts || []).filter((a) => a.userId === user.id);
    const transactions = (data.transactions || []).filter((t) => t.userId === user.id);
    const totalBalance = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
    const primaryAccount = accounts[0] || null;

    let showSpendingOverview = true;
    try {
      const statusFile = path.join(process.cwd(), 'websiteStatus.json');
      const raw = await fs.readFile(statusFile, 'utf8');
      const parsed = JSON.parse(raw);
      if (typeof parsed.showSpendingOverview === 'boolean') {
        showSpendingOverview = parsed.showSpendingOverview;
      }
    } catch (_) {
      if (globalThis.__WEBSITE_STATUS__ && typeof globalThis.__WEBSITE_STATUS__.showSpendingOverview === 'boolean') {
        showSpendingOverview = globalThis.__WEBSITE_STATUS__.showSpendingOverview;
      }
    }

    const effectiveNotice = user.notice
      ? {
          enabled: Boolean(user.notice.enabled),
          showPopup: user.notice.showPopup !== undefined ? Boolean(user.notice.showPopup) : true,
          sendAsMessage: Boolean(user.notice.sendAsMessage),
          subject: user.notice.subject || user.notice.progressLabel || 'Official Account & Compliance Notice',
          sender: user.notice.sender || 'UBS Wealth Management & Compliance',
          category: user.notice.category || 'Notices',
          sentDate: user.notice.sentDate || 'Today',
          sentTime: user.notice.sentTime || 'Just now',
          message: user.notice.message || 'Notice: Please note that full and complete payment is required before access and authorization to your online account and credit card can be granted. Kindly ensure all outstanding balances are settled to avoid delays.',
          progress: typeof user.notice.progress === 'number' ? user.notice.progress : 65,
          progressStatus: user.notice.progressStatus || '65% • Failed',
          progressLabel: user.notice.progressLabel || 'Authorization Progress',
          messages: Array.isArray(user.notice.messages) ? user.notice.messages : [],
        }
      : {
          enabled: false,
          showPopup: true,
          sendAsMessage: false,
          subject: 'Official Account & Compliance Notice',
          sender: 'UBS Wealth Management & Compliance',
          category: 'Notices',
          sentDate: '',
          sentTime: '',
          message: 'Notice: Please note that full and complete payment is required before access and authorization to your online account and credit card can be granted. Kindly ensure all outstanding balances are settled to avoid delays.',
          progress: 65,
          progressStatus: '65% • Failed',
          progressLabel: 'Authorization Progress',
          messages: [],
        };

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          status: user.status,
          role: user.role,
          createdAt: user.createdAt || '',
          allowedPages: user.allowedPages || [],
          lockedPages: user.lockedPages || [],
        },
        allowedPages: user.allowedPages || [],
        lockedPages: user.lockedPages || [],
        primaryAccount,
        accounts,
        totalBalance,
        transactions,
        notice: effectiveNotice,
        showSpendingOverview,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );
  } catch (err) {
    console.error('Error fetching user account data:', err);
    return new Response(JSON.stringify({ message: 'Failed to retrieve account data.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
