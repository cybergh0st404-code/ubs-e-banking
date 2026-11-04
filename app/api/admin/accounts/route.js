import { getBankData, saveBankData } from '../../../../lib/db.js';
import { requireAdmin } from '../../../../lib/security.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
      return new Response(JSON.stringify({ message: auth.error || 'Unauthorized' }), {
        status: auth.status || 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await getBankData();
    const accountsWithDeposit = (data.accounts || []).map((acc) => {
      const initTx = (data.transactions || []).find(
        (t) => (t.userId === acc.userId || t.accountNumber === acc.accountNumber) &&
               (t.description?.toLowerCase().includes('initial') || t.category === 'Deposit') &&
               t.type === 'credit'
      ) || (data.transactions || []).find(
        (t) => (t.userId === acc.userId || t.accountNumber === acc.accountNumber) && t.type === 'credit'
      );
      const user = (data.users || []).find((u) => u.id === acc.userId);
      return {
        ...acc,
        initialDepositDate: initTx ? initTx.date : new Date().toISOString().split('T')[0],
        openingDate: user ? (user.createdAt || '') : '',
      };
    });
    return new Response(JSON.stringify({ accounts: accountsWithDeposit }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Error fetching admin accounts:', err);
    return new Response(JSON.stringify({ message: 'Failed to fetch accounts.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
      return new Response(JSON.stringify({ message: auth.error || 'Unauthorized' }), {
        status: auth.status || 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { id, balance, status, type, accountNumber } = body;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Account ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await getBankData();
    const accIndex = (data.accounts || []).findIndex((a) => a.id === id);
    if (accIndex === -1) {
      return new Response(JSON.stringify({ message: 'Account not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const current = data.accounts[accIndex];
    const newBal = balance !== undefined ? parseFloat(balance) : current.balance;
    const newStatus = status ? String(status).trim().toLowerCase() : current.status;
    const updated = {
      ...current,
      balance: newBal,
      status: newStatus,
      type: type || current.type,
      accountNumber: accountNumber || current.accountNumber,
    };
    data.accounts[accIndex] = updated;

    // Sync status back to user record if status was updated
    if (status && current.userId) {
      const uIdx = (data.users || []).findIndex((u) => u.id === current.userId);
      if (uIdx !== -1) {
        data.users[uIdx].status = newStatus;
      }
    }

    // Update or create initial deposit transaction date if provided
    const depositDate = body.initialDepositDate || body.depositDate;
    if (depositDate !== undefined && depositDate !== '') {
      const cleanDate = depositDate.trim();
      const userTransactions = data.transactions || [];
      const txIdx = userTransactions.findIndex(
        (t) => (t.userId === current.userId || t.accountNumber === current.accountNumber) &&
               (t.description?.toLowerCase().includes('initial') || t.category === 'Deposit') &&
               t.type === 'credit'
      );

      if (txIdx !== -1) {
        userTransactions[txIdx].date = cleanDate;
        userTransactions[txIdx].amount = newBal;
      } else {
        const initTx = {
          id: `tx-${Date.now()}`,
          userId: current.userId,
          userName: current.userName,
          accountNumber: current.accountNumber,
          type: 'credit',
          description: 'Initial Account Deposit',
          amount: newBal,
          date: cleanDate,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          category: 'Deposit',
          status: 'completed',
        };
        data.transactions = [initTx, ...userTransactions];
      }
    }

    // Update user opening date (createdAt) if provided
    const openingDate = body.openingDate || body.createdAt;
    if (openingDate !== undefined && openingDate !== '') {
      const uIdx = (data.users || []).findIndex((u) => u.id === current.userId);
      if (uIdx !== -1) {
        data.users[uIdx].createdAt = openingDate.trim();
      }
    }

    await saveBankData(data);

    return new Response(JSON.stringify({ account: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error updating account:', err);
    return new Response(JSON.stringify({ message: 'Failed to update account.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
