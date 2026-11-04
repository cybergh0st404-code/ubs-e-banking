import { getBankData, saveBankData, DEFAULT_ALLOWED_PAGES, normalizePagesList } from '../../../../lib/db.js';
import { requireAdmin, hashPassword, hashTwoFactorCode } from '../../../../lib/security.js';

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
    const usersWithAccounts = (data.users || []).map((user) => {
      const userAccounts = (data.accounts || []).filter((a) => a.userId === user.id);
      const totalBalance = userAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
      const userTransactions = (data.transactions || []).filter((t) => t.userId === user.id);
      const initialDepositTx = userTransactions.find(
        (t) => (t.description?.toLowerCase().includes('initial') || t.category === 'Deposit') && t.type === 'credit'
      ) || userTransactions.find((t) => t.type === 'credit');
      const initialDepositDate = initialDepositTx ? initialDepositTx.date : (user.createdAt || new Date().toISOString().split('T')[0]);
      return {
        ...user,
        accountsCount: userAccounts.length,
        totalBalance,
        primaryAccount: userAccounts[0] || null,
        initialDepositDate,
      };
    });
    return new Response(JSON.stringify({ users: usersWithAccounts }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return new Response(JSON.stringify({ message: 'Failed to fetch users.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
      return new Response(JSON.stringify({ message: auth.error || 'Unauthorized' }), {
        status: auth.status || 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { name, email, password, twoFactorCode, initialBalance, accountType, status } = body;

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ message: 'Name, email, and password are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await getBankData();
    const existing = (data.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return new Response(JSON.stringify({ message: 'A user with this email already exists.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = `user-${Date.now()}`;
    const hashedPassword = await hashPassword(password.trim());
    const raw2FACode = twoFactorCode ? twoFactorCode.trim() : Math.floor(100000 + Math.random() * 900000).toString();
    const hashed2FACode = await hashTwoFactorCode(raw2FACode);

    const newUser = {
      id: userId,
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      twoFactorCode: hashed2FACode,
      role: 'user',
      status: status || 'active',
      phone: body.phone || '',
      address: body.address || '',
      allowedPages: Array.isArray(body.allowedPages) && body.allowedPages.length > 0 ? normalizePagesList(body.allowedPages) : DEFAULT_ALLOWED_PAGES,
      lockedPages: Array.isArray(body.lockedPages) ? normalizePagesList(body.lockedPages) : [],
      tokenVersion: 1,
      createdAt: (body.createdAt || body.openingDate || new Date().toISOString().split('T')[0]).trim(),
    };

    const parsedBalance = parseFloat(initialBalance) || 0;
    const last4 = Math.floor(1000 + Math.random() * 9000);
    const fullAccNum = `026009593${last4}`;
    const newAccount = {
      id: `acc-${Date.now()}`,
      userId: userId,
      userName: newUser.name,
      accountNumber: `**** ${last4}`,
      fullAccountNumber: fullAccNum,
      routingNumber: '026009593',
      type: accountType || 'Checking',
      balance: parsedBalance,
      status: newUser.status,
    };

    data.users = [...(data.users || []), newUser];
    data.accounts = [...(data.accounts || []), newAccount];

    // If initial balance > 0, create an initial deposit transaction
    if (parsedBalance > 0) {
      const depositDate = body.initialDepositDate || body.depositDate || new Date().toISOString().split('T')[0];
      const initTx = {
        id: `tx-${Date.now()}`,
        userId: userId,
        userName: newUser.name,
        accountNumber: newAccount.accountNumber,
        type: 'credit',
        description: 'Initial Account Deposit',
        amount: parsedBalance,
        date: depositDate,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        category: 'Deposit',
        status: 'completed',
      };
      data.transactions = [initTx, ...(data.transactions || [])];
    }

    await saveBankData(data);

    return new Response(JSON.stringify({ user: newUser, account: newAccount }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error adding user:', err);
    return new Response(JSON.stringify({ message: 'Failed to create user.' }), {
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
    const { id, name, email, password, twoFactorCode, status, balance, phone, address } = body;

    if (!id) {
      return new Response(JSON.stringify({ message: 'User ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await getBankData();
    const userIndex = (data.users || []).findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return new Response(JSON.stringify({ message: 'User not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const current = data.users[userIndex];
    let newPassword = current.password;
    let passwordChanged = false;
    if (password !== undefined && password !== '' && !password.startsWith('pbkdf2:')) {
      newPassword = await hashPassword(password.trim());
      passwordChanged = true;
    }

    let newTwoFactorCode = current.twoFactorCode;
    if (twoFactorCode !== undefined && twoFactorCode !== '' && !twoFactorCode.startsWith('pbkdf2:')) {
      newTwoFactorCode = await hashTwoFactorCode(twoFactorCode.trim());
    }

    let tokenVersion = Number(current.tokenVersion) || 1;
    const statusChanged = status !== undefined && status !== current.status;
    const isRestricting = status === 'blocked' || status === 'suspended' || status === 'flagged';
    const forceLogoutRequested = body.forceLogout === true || body.action === 'logout';
    if (passwordChanged || (statusChanged && isRestricting) || forceLogoutRequested) {
      tokenVersion += 1;
    }

    const newCreatedAt = (body.createdAt || body.openingDate) !== undefined && (body.createdAt || body.openingDate) !== ''
      ? (body.createdAt || body.openingDate).trim()
      : current.createdAt;

    const updatedStatus = status !== undefined ? String(status).trim().toLowerCase() : current.status;

    const updatedUser = {
      ...current,
      name: name !== undefined ? name.trim() : current.name,
      email: email !== undefined ? email.trim() : current.email,
      password: newPassword,
      twoFactorCode: newTwoFactorCode,
      status: updatedStatus,
      phone: phone !== undefined ? phone : current.phone,
      address: address !== undefined ? address : current.address,
      createdAt: newCreatedAt,
      tokenVersion,
    };

    // Synchronize status and name in user's accounts
    if (status !== undefined || name) {
      data.accounts = (data.accounts || []).map((acc) => {
        if (acc.userId === id) {
          return {
            ...acc,
            userName: name ? updatedUser.name : acc.userName,
            status: status !== undefined ? updatedStatus : acc.status,
          };
        }
        return acc;
      });
    }

    if (name) {
      data.transactions = (data.transactions || []).map((tx) => {
        if (tx.userId === id) {
          return { ...tx, userName: updatedUser.name };
        }
        return tx;
      });
    }

    // If notice settings were provided, update user notice
    if (body.notice !== undefined) {
      updatedUser.notice = {
        ...(current.notice || {}),
        ...body.notice,
      };
    }

    // If allowedPages settings were provided, update user allowedPages
    if (body.allowedPages !== undefined && Array.isArray(body.allowedPages)) {
      updatedUser.allowedPages = normalizePagesList(body.allowedPages);
    }

    // If lockedPages settings were provided, update user lockedPages
    if (body.lockedPages !== undefined && Array.isArray(body.lockedPages)) {
      updatedUser.lockedPages = normalizePagesList(body.lockedPages);
    }

    data.users[userIndex] = updatedUser;

    // If balance was provided, update primary account balance
    let effectiveBalance = null;
    if (balance !== undefined && balance !== '') {
      const newBal = parseFloat(balance);
      if (!isNaN(newBal)) {
        effectiveBalance = newBal;
        const accIdx = (data.accounts || []).findIndex((a) => a.userId === id);
        if (accIdx !== -1) {
          data.accounts[accIdx].balance = newBal;
        }
      }
    }

    // If initialDepositDate was provided, update or create the initial deposit transaction
    const depositDate = body.initialDepositDate || body.depositDate;
    if (depositDate !== undefined && depositDate !== '') {
      const cleanDate = depositDate.trim();
      const userTransactions = data.transactions || [];
      const txIdx = userTransactions.findIndex(
        (t) => t.userId === id && (t.description?.toLowerCase().includes('initial') || t.category === 'Deposit') && t.type === 'credit'
      );

      if (txIdx !== -1) {
        userTransactions[txIdx].date = cleanDate;
        if (effectiveBalance !== null) {
          userTransactions[txIdx].amount = effectiveBalance;
        }
      } else {
        const userAcc = (data.accounts || []).find((a) => a.userId === id);
        const bal = effectiveBalance !== null ? effectiveBalance : (userAcc ? Number(userAcc.balance) || 0 : 0);
        const initTx = {
          id: `tx-${Date.now()}`,
          userId: id,
          userName: updatedUser.name,
          accountNumber: userAcc ? userAcc.accountNumber : '**** 0000',
          type: 'credit',
          description: 'Initial Account Deposit',
          amount: bal,
          date: cleanDate,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          category: 'Deposit',
          status: 'completed',
        };
        data.transactions = [initTx, ...userTransactions];
      }
    }

    await saveBankData(data);

    return new Response(JSON.stringify({ user: updatedUser }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error updating user:', err);
    return new Response(JSON.stringify({ message: 'Failed to update user.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
      return new Response(JSON.stringify({ message: auth.error || 'Unauthorized' }), {
        status: auth.status || 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ message: 'User ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await getBankData();
    data.users = (data.users || []).filter((u) => u.id !== id);
    data.accounts = (data.accounts || []).filter((a) => a.userId !== id);
    data.transactions = (data.transactions || []).filter((t) => t.userId !== id);

    await saveBankData(data);

    return new Response(JSON.stringify({ message: 'User deleted successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    return new Response(JSON.stringify({ message: 'Failed to delete user.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
