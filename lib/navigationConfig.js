/**
 * SINGLE SOURCE OF TRUTH FOR ALL BANK NAVIGATION MENUS
 * Synchronized across Admin, User Dashboard, Database, and Access Guards
 */

export const ALL_NAVIGATION_MENUS = [
  // Core Private Banking Wealth Menus (Visible by default)
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', core: true, icon: 'Home' },
  { id: 'accounts', label: 'Accounts', path: '/dashboard', core: true, icon: 'CreditCard' },
  { id: 'transfers', label: 'Transfers', path: '/transfer', core: true, icon: 'ArrowLeftRight' },
  { id: 'transactions', label: 'Transactions', path: '/transactions', core: false, icon: 'Clock' },
  { id: 'investments', label: 'Investments', path: '/dashboard', core: true, icon: 'TrendingUp' },
  { id: 'wealth-planning', label: 'Wealth Planning', path: '/dashboard', core: true, icon: 'Compass' },
  { id: 'market-insights', label: 'Market Insights', path: '/dashboard', core: true, icon: 'BarChart2' },
  { id: 'statements', label: 'Statements', path: '/statements', core: true, icon: 'FileText' },
  { id: 'messages', label: 'Secure Messages', path: '/messages', core: true, icon: 'Mail' },
  { id: 'settings', label: 'Settings', path: '/settings', core: true, icon: 'Settings' },
  { id: 'support', label: 'Support', path: '/messages', core: true, icon: 'Headphones' },

  // Extended Services
  { id: 'wire-transfer', label: 'Wire Transfer', path: '/wire-transfer', core: false, icon: 'Send' },
  { id: 'deposit', label: 'Deposit Checks', path: '/deposit', core: false, icon: 'ArrowDownToLine' },
  { id: 'bill-pay', label: 'Bill Pay & AutoPay', path: '/bill-pay', core: false, icon: 'Receipt' },
  { id: 'cards', label: 'Cards & Virtual Cards', path: '/cards', core: false, icon: 'CreditCard' },
  { id: 'credit-score', label: 'Credit Score', path: '/credit-score', core: false, icon: 'TrendingUp' },
  { id: 'security', label: 'Security & Sessions', path: '/security', core: false, icon: 'ShieldCheck' },
];

export const ALL_MENU_IDS = ALL_NAVIGATION_MENUS.map((m) => m.id);

export const DEFAULT_CORE_MENU_IDS = ALL_NAVIGATION_MENUS.filter((m) => m.core).map((m) => m.id);

/**
 * Normalizes any legacy or inconsistent IDs (e.g. 'transfer' -> 'transfers')
 * and returns a deduplicated array of valid menu IDs.
 */
export function normalizeMenuIds(ids) {
  if (!Array.isArray(ids)) return [];
  const validSet = new Set(ALL_MENU_IDS);
  const result = new Set();

  for (const raw of ids) {
    if (!raw || typeof raw !== 'string') continue;
    const clean = raw.trim();
    if (clean === 'transfer') {
      result.add('transfers');
    } else if (validSet.has(clean)) {
      result.add(clean);
    }
  }

  return Array.from(result);
}

