'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DEFAULT_CORE_MENU_IDS, normalizeMenuIds } from '../lib/navigationConfig.js';
import {
  Home,
  CreditCard,
  ArrowLeftRight,
  TrendingUp,
  Compass,
  BarChart2,
  FileText,
  Mail,
  Settings,
  Headphones,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle2,
  BarChart3,
  PieChart,
  Coins,
  Zap,
  ArrowDownToLine,
  Search,
  ChevronRight,
  ShieldCheck,
  Lock,
  X,
  Menu,
  Clock,
  Phone,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import UbsLogo from '../components/UbsLogo';
import AccountNoticeCard from '../components/AccountNoticeCard';
import { useAuth } from '../utils/AuthContext';

// Vector SVG Flags for crisp high-end rendering
const UsFlag = () => (
  <svg className="w-6 h-4 rounded-sm shadow-sm flex-shrink-0" viewBox="0 0 7410 3900">
    <rect width="7410" height="3900" fill="#b22234" />
    <path d="M0,450H7410M0,1050H7410M0,1650H7410M0,2250H7410M0,2850H7410M0,3450H7410" stroke="#fff" strokeWidth="300" />
    <rect width="2964" height="2100" fill="#3c3b6e" />
    <g fill="#fff">
      <circle cx="296" cy="210" r="100" />
      <circle cx="889" cy="210" r="100" />
      <circle cx="1482" cy="210" r="100" />
      <circle cx="2075" cy="210" r="100" />
      <circle cx="2668" cy="210" r="100" />
      <circle cx="592" cy="525" r="100" />
      <circle cx="1185" cy="525" r="100" />
      <circle cx="1778" cy="525" r="100" />
      <circle cx="2371" cy="525" r="100" />
      <circle cx="296" cy="840" r="100" />
      <circle cx="889" cy="840" r="100" />
      <circle cx="1482" cy="840" r="100" />
      <circle cx="2075" cy="840" r="100" />
      <circle cx="2668" cy="840" r="100" />
      <circle cx="592" cy="1155" r="100" />
      <circle cx="1185" cy="1155" r="100" />
      <circle cx="1778" cy="1155" r="100" />
      <circle cx="2371" cy="1155" r="100" />
      <circle cx="296" cy="1470" r="100" />
      <circle cx="889" cy="1470" r="100" />
      <circle cx="1482" cy="1470" r="100" />
      <circle cx="2075" cy="1470" r="100" />
      <circle cx="2668" cy="1470" r="100" />
      <circle cx="592" cy="1785" r="100" />
      <circle cx="1185" cy="1785" r="100" />
      <circle cx="1778" cy="1785" r="100" />
      <circle cx="2371" cy="1785" r="100" />
    </g>
  </svg>
);

const EuFlag = () => (
  <svg className="w-6 h-4 rounded-sm shadow-sm flex-shrink-0" viewBox="0 0 810 540">
    <rect width="810" height="540" fill="#003399" />
    <g fill="#ffcc00">
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const cx = 405 + 130 * Math.sin(angle);
        const cy = 270 - 130 * Math.cos(angle);
        return <circle key={i} cx={cx} cy={cy} r="14" />;
      })}
    </g>
  </svg>
);

const UkFlag = () => (
  <svg className="w-6 h-4 rounded-sm shadow-sm flex-shrink-0" viewBox="0 0 60 30">
    <clipPath id="uk-clip">
      <path d="M0,0 v30 h60 v-30 z" />
    </clipPath>
    <clipPath id="uk-t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
    </clipPath>
    <g clipPath="url(#uk-clip)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-t)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

const Dashboard = () => {
  const router = useRouter();
  const { user, logout, updateUser, loading: authLoading } = useAuth();

  const [balance, setBalance] = useState(0);
  const [accountNumber, setAccountNumber] = useState('CH-XXXX-XXXX-8504');
  const [fullAccountNumber, setFullAccountNumber] = useState('CH-78456321');
  const [showAccountFull, setShowAccountFull] = useState(false);
  const [accountType, setAccountType] = useState('Premium / Multi-Currency');
  const [openingDate, setOpeningDate] = useState('Nov 03, 2025');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [notice, setNotice] = useState(null);
  const [showNoticePopup, setShowNoticePopup] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [currentTimeUtc, setCurrentTimeUtc] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin access control states
  const [allowedPages, setAllowedPages] = useState(null);
  const [lockedPages, setLockedPages] = useState([]);
  const [lockedModalItem, setLockedModalItem] = useState(null);

  // Interactive Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showInvestmentsModal, setShowInvestmentsModal] = useState(false);

  // Authenticate user
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, router, authLoading]);

  // Live ticking UTC clock matching: Mon, Nov 03, 2025 | 12:18 (UTC)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const dayName = days[now.getUTCDay()];
      const monthName = months[now.getUTCMonth()];
      const dayNum = String(now.getUTCDate()).padStart(2, '0');
      const year = now.getUTCFullYear();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');

      setCurrentTimeUtc(`${dayName}, ${monthName} ${dayNum}, ${year} | ${hours}:${minutes} (UTC)`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live account data
  useEffect(() => {
    if (!user) return;

    if (user.createdAt) {
      try {
        const d = new Date(user.createdAt);
        if (!isNaN(d.getTime())) {
          const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          setOpeningDate(`${m[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`);
        }
      } catch (_) {}
    }

    if (user.notice && user.notice.enabled) {
      setNotice(user.notice);
      setShowNoticePopup(true);
    }

    const fetchAccountData = async () => {
      try {
        const query = user.id ? `?userId=${user.id}&email=${encodeURIComponent(user.email || '')}` : '';
        const res = await fetch(`/api/user/account-data${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.totalBalance !== undefined) {
            setBalance(Number(data.totalBalance) || 0);
          }
          const userCreated = data.user?.createdAt || user?.createdAt;
          if (userCreated) {
            try {
              const d = new Date(userCreated);
              if (!isNaN(d.getTime())) {
                const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                setOpeningDate(`${m[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`);
              }
            } catch (_) {}
          }
          if (data.primaryAccount) {
            const rawAcc = data.primaryAccount.accountNumber || '';
            const fullAcc = data.primaryAccount.fullAccountNumber || '';
            const digits = (rawAcc + fullAcc).replace(/\D/g, '');
            const last4 = digits.length >= 4 ? digits.slice(-4) : (rawAcc.slice(-4) || '8504');
            setAccountNumber(`CH-XXXX-XXXX-${last4}`);
            setFullAccountNumber(fullAcc ? (fullAcc.startsWith('CH-') ? fullAcc : `CH-${fullAcc}`) : (rawAcc && rawAcc.startsWith('CH-') ? rawAcc : `CH-7845${last4}`));
            if (data.primaryAccount.type) {
              setAccountType('Premium / Multi-Currency');
            }
          }
          if (data.transactions) {
            setRecentTransactions(data.transactions);
          }
          if (data.allowedPages !== undefined && Array.isArray(data.allowedPages)) {
            setAllowedPages(data.allowedPages);
          }
          if (data.lockedPages !== undefined && Array.isArray(data.lockedPages)) {
            setLockedPages(data.lockedPages);
          }
          if (updateUser && (data.allowedPages || data.lockedPages)) {
            updateUser({
              allowedPages: data.allowedPages || [],
              lockedPages: data.lockedPages || [],
            });
          }
          if (data.notice && data.notice.enabled) {
            setNotice(data.notice);
            setShowNoticePopup(true);
          } else {
            setNotice(null);
            setShowNoticePopup(false);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard account data:', err);
      }
    };
    fetchAccountData();
  }, [user]);

  const firstName = user?.name ? user.name.trim().split(' ')[0] : 'Client';
  const fullName = user?.name || 'Mandy';

  const formatCurrency = (amount, currency = 'USD') => {
    if (!isBalanceVisible) return '••••••';
    const num = Number(amount) || 0;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Complete List of All User Sidebar Menus
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, active: true, action: () => router.push('/dashboard') },
    { id: 'accounts', label: 'Accounts', icon: CreditCard, action: () => setShowDetailsModal(true) },
    { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight, action: () => router.push('/transfer') },
    { id: 'transactions', label: 'Transactions', icon: Clock, action: () => router.push('/transactions') },
    { id: 'investments', label: 'Investments', icon: TrendingUp, action: () => setShowInvestmentsModal(true) },
    { id: 'wealth-planning', label: 'Wealth Planning', icon: Compass, action: () => setShowInvestmentsModal(true) },
    { id: 'market-insights', label: 'Market Insights', icon: BarChart2, action: () => setShowInvestmentsModal(true) },
    { id: 'statements', label: 'Statements', icon: FileText, action: () => router.push('/statements') },
    { id: 'messages', label: 'Secure Messages', icon: Mail, action: () => router.push('/messages') },
    { id: 'settings', label: 'Settings', icon: Settings, action: () => router.push('/settings') },
    { id: 'support', label: 'Support', icon: Headphones, action: () => setShowContactModal(true) },
    { id: 'wire-transfer', label: 'Wire Transfer', icon: ArrowLeftRight, action: () => router.push('/wire-transfer') },
    { id: 'deposit', label: 'Deposit Checks', icon: ArrowDownToLine, action: () => router.push('/deposit') },
    { id: 'bill-pay', label: 'Bill Pay', icon: FileText, action: () => router.push('/bill-pay') },
    { id: 'cards', label: 'Cards & Virtual Cards', icon: CreditCard, action: () => router.push('/cards') },
    { id: 'credit-score', label: 'Credit Score', icon: TrendingUp, action: () => router.push('/credit-score') },
    { id: 'security', label: 'Security & Sessions', icon: ShieldCheck, action: () => router.push('/security') },
  ];

  // Check if an item is permitted by admin (visibility)
  const isPageAllowed = (id) => {
    if (allowedPages === null || allowedPages === undefined) {
      return DEFAULT_CORE_MENU_IDS.includes(id);
    }
    if (id === 'dashboard') return true;
    return allowedPages.includes(id);
  };

  // Check if an item is locked by admin (user cannot access)
  const isPageLocked = (id) => {
    if (!lockedPages || !Array.isArray(lockedPages)) return false;
    return lockedPages.includes(id);
  };

  // Check if an item is restricted (either locked OR not allowed)
  const isFeatureRestricted = (id) => {
    return isPageLocked(id) || !isPageAllowed(id);
  };

  // Filter items by allowed pages configured by admin
  const navItems = allNavItems.filter((item) => isPageAllowed(item.id));

  const handleNavClick = (item) => {
    if (isPageLocked(item.id)) {
      setLockedModalItem({ label: item.label });
      return;
    }
    item.action();
  };

  return (
    <div className="relative min-h-screen bg-[#07090d] text-white flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      
      {/* LUXURY BACKGROUND AMBIENT GLOWS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[650px] h-[450px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-amber-700/5 to-transparent blur-3xl opacity-70" />
        <div className="absolute bottom-1/4 left-1/3 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/6 via-transparent to-transparent blur-3xl opacity-50" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-amber-400/5 via-transparent to-transparent blur-3xl opacity-40" />
      </div>

      {/* Pop-up Notice Card if enabled by administrator */}
      {showNoticePopup && notice && notice.enabled && (
        <AccountNoticeCard
          notice={notice}
          isPopup={true}
          onDismiss={() => setShowNoticePopup(false)}
          autoDismissSeconds={7}
        />
      )}

      {/* Main Layout Container */}
      <div className="relative z-10 flex-1 flex w-full">
        
        {/* ======================= LEFT SIDEBAR (DESKTOP) ======================= */}
        <aside className="hidden lg:flex w-64 bg-gradient-to-b from-[#0a0c12] via-[#090b10] to-[#07080c] border-r border-amber-500/15 flex-col justify-between py-6 px-4 z-20 flex-shrink-0 min-h-screen shadow-[4px_0_24px_rgba(0,0,0,0.7)]">
          <div className="space-y-6">
            
            {/* Logo Area */}
            <div className="px-2 pt-1 pb-2 border-b border-[#1c2230]/70">
              <UbsLogo 
                className="h-9 w-auto drop-shadow-[0_2px_8px_rgba(230,0,0,0.3)]" 
                keysColor="#ffffff" 
                textColor="#e60000"
                showSubtitle={true}
                subtitle="Global Wealth Management"
                subtitleColor="#dfd7c2"
              />
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const locked = isPageLocked(item.id);

                if (item.active) {
                  return (
                    <button
                      key={idx}
                      onClick={() => handleNavClick(item)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-[0_4px_18px_rgba(212,175,55,0.32)] bg-gradient-to-r from-[#dfba60] via-[#eed187] to-[#c79a40] text-[#08090d] border border-amber-200/40 transform hover:scale-[1.01]"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <Icon className="w-4 h-4 flex-shrink-0 text-[#08090d]" />
                        <span className="tracking-wide font-medium truncate">{item.label}</span>
                      </div>
                      {locked && (
                        <span className="p-1 rounded bg-black/20 text-[#08090d] flex items-center justify-center">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      locked
                        ? 'text-neutral-400 hover:text-amber-200 hover:bg-[#141926]/70'
                        : 'text-neutral-300 hover:text-amber-300 hover:bg-[#141926]/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${locked ? 'text-amber-500/70' : 'text-neutral-400 group-hover:text-amber-300'} group-hover:scale-110 transition-transform`} />
                      <span className="group-hover:translate-x-0.5 transition-transform truncate">{item.label}</span>
                    </div>
                    {locked && (
                      <span className="p-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shadow-sm" title="Service restricted by portfolio administrator">
                        <Lock className="w-3 h-3 text-amber-400" />
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Bottom: Swiss Alps Mountain & Banking Securely Card */}
          <div className="mt-6 pt-4 space-y-4">
            
            {/* Matterhorn / Swiss Alps image banner */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/25 group shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
              <div 
                className="h-28 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ 
                  backgroundImage: `url('/mountain.jpg')`,
                  backgroundColor: '#10141d'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex items-end p-3">
                <p className="text-[12px] font-serif italic text-amber-200/95 tracking-wide leading-tight drop-shadow-md">
                  &ldquo;For a brighter financial future&rdquo;
                </p>
              </div>
            </div>

            {/* "Banking Securely with UBS" Gold Card */}
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#141824]/95 via-[#0f131c] to-[#0a0d14] p-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06),0_0_15px_rgba(212,175,55,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center space-x-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white tracking-tight">Banking Securely</h4>
                  <p className="text-[10px] text-amber-300/80 font-medium">with UBS</p>
                </div>
              </div>
              <p className="text-[11px] text-neutral-400 mb-3">
                Your assets. Our priority.
              </p>
              <button 
                onClick={() => setShowSecurityModal(true)}
                className="w-full py-1.5 px-3 rounded-full bg-gradient-to-r from-[#dfba60] via-[#eed187] to-[#c79a40] text-[#090b10] text-[11px] font-bold hover:brightness-110 hover:shadow-[0_0_12px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center space-x-1 shadow-sm active:scale-95"
              >
                <span>Learn More</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </aside>

        {/* ======================= MOBILE DRAWER ======================= */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-[#090b10] border-r border-amber-500/20 p-5 flex flex-col justify-between overflow-y-auto shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#212635]">
                  <UbsLogo 
                    className="h-8 w-auto" 
                    keysColor="#ffffff" 
                    textColor="#e60000"
                    showSubtitle={true}
                    subtitle="Global Wealth Management"
                  />
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="mt-4 space-y-1">
                  {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    const locked = isPageLocked(item.id);

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleNavClick(item);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          item.active 
                            ? 'bg-gradient-to-r from-[#dfba60] via-[#eed187] to-[#c79a40] text-[#0a0c10] font-semibold shadow-md' 
                            : 'text-neutral-300 hover:text-amber-300 hover:bg-[#131722]'
                        }`}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {locked && (
                          <span className="p-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center">
                            <Lock className="w-3 h-3 text-amber-400" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="mt-6 pt-4 border-t border-[#212635]">
                <button
                  onClick={() => {
                    if (logout) logout();
                    router.push('/login');
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================= MAIN CONTENT AREA ======================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#07090d] overflow-x-hidden">
          
          {/* TOP BAR / HEADER */}
          <header className="w-full px-4 sm:px-8 py-5 flex items-center justify-between border-b border-[#1c2230]/70 bg-[#0a0c11]/85 backdrop-blur-xl sticky top-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            {/* Left: Mobile hamburger & Greeting */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-[#141824] border border-amber-500/25 text-neutral-300 hover:text-white"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-normal text-white tracking-wide">
                  Welcome, {firstName}
                </h1>
                <p className="text-xs sm:text-sm font-serif italic text-amber-300/90 tracking-wider">
                  Premium Client
                </p>
              </div>
            </div>

            {/* Right: Message Notification, UTC Clock & Profile Avatar */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              
              {/* Mail / Notifications icon */}
              <button 
                onClick={() => {
                  if (isFeatureRestricted('messages')) {
                    setLockedModalItem({ label: 'Secure Messages' });
                    return;
                  }
                  router.push('/messages');
                }}
                className="relative p-2.5 rounded-full text-neutral-300 hover:text-amber-300 hover:bg-[#141824] border border-transparent hover:border-amber-500/30 transition-all duration-200"
                aria-label="Messages"
              >
                <Mail className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#e60000] text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(230,0,0,0.6)]">
                  1
                </span>
              </button>

              {/* Vertical divider */}
              <div className="hidden sm:block h-5 w-px bg-neutral-700/60" />

              {/* Real-time UTC Clock */}
              <div className="hidden sm:flex items-center space-x-1.5 text-xs text-neutral-400 font-mono tracking-tight bg-[#111520]/60 px-3 py-1.5 rounded-full border border-[#212738]/60">
                <Clock className="w-3.5 h-3.5 text-amber-400/80 mr-1" />
                <span>{currentTimeUtc || 'Mon, Nov 03, 2025 | 12:18 (UTC)'}</span>
              </div>

              {/* Profile Avatar */}
              <div 
                onClick={() => router.push('/settings')}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#1d2332] to-[#121622] border border-amber-500/40 flex items-center justify-center text-amber-200 cursor-pointer hover:border-amber-400 hover:shadow-[0_0_12px_rgba(212,175,55,0.25)] transition-all"
              >
                <span className="font-serif font-semibold text-xs sm:text-sm">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </header>

          {/* MAIN DASHBOARD CONTENT */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
            
            {/* Inline Warning/Notice banner if active */}
            {notice && notice.enabled && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/90 via-[#260c12] to-red-950/70 border border-red-500/60 shadow-[0_0_25px_rgba(230,0,0,0.2)] flex items-start space-x-3.5">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-red-100 font-serif">{notice.title || notice.progressLabel || 'Account Notice'}</h3>
                    <span className="text-[11px] font-bold text-red-300 bg-red-900/60 border border-red-500/40 px-2.5 py-0.5 rounded-full shadow-sm">
                      {notice.progressStatus || `${notice.progress || 65}% • Action Required`}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 whitespace-pre-line leading-relaxed">
                    {notice.message}
                  </p>
                </div>
              </div>
            )}

            {/* ======================= HERO BANNER: TOTAL PORTFOLIO VALUE ======================= */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-r from-[#0d1017] via-[#101524] to-[#090c12] p-6 sm:p-8 shadow-[0_14px_45px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06),0_0_25px_rgba(212,175,55,0.1)]">
              
              {/* Background Golden Globe Network */}
              <div 
                className="absolute inset-y-0 right-0 w-full md:w-3/5 bg-cover bg-right bg-no-repeat opacity-40 mix-blend-screen pointer-events-none"
                style={{ 
                  backgroundImage: `url('/globe-network.jpg')`,
                  maskImage: 'linear-gradient(to left, black 65%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to left, black 65%, transparent 100%)'
                }}
              />

              {/* Ambient Gold Radial Glow */}
              <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Left Side: Portfolio Value & Status */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-neutral-300 tracking-wide font-medium">
                    <span>Total Portfolio Value</span>
                    <button 
                      onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                      className="p-1 rounded-full text-neutral-400 hover:text-amber-300 transition-colors"
                      aria-label="Toggle balance visibility"
                    >
                      {isBalanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold font-sans tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                      {formatCurrency(balance)}
                    </span>
                    <span className="text-base sm:text-lg text-amber-200/80 font-medium font-serif tracking-wider">USD</span>
                  </div>

                  <div className="flex items-center space-x-2 pt-1 text-xs sm:text-sm text-neutral-300">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-[#0a0c10] flex-shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current stroke-current stroke-2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="tracking-wide">
                      {balance > 0 
                        ? 'Account Opened • Wealth Management Tier' 
                        : 'Account Opened • Awaiting Initial Funding'}
                    </span>
                  </div>
                </div>

                {/* Right Side: UBS Logo & Subtitle */}
                <div className="flex flex-col items-start md:items-end justify-center pt-2 md:pt-0">
                  <div className="flex items-center space-x-2 mb-1.5 drop-shadow-[0_2px_12px_rgba(230,0,0,0.35)]">
                    <svg viewBox="-44.7 -26.98425 387.4 161.9055" className="h-7 sm:h-8 w-auto">
                      <path 
                        d="M80.105 31.193l-1.938 1.62 2.046 6.692-6.138-3.347-2.046 1.62 6.784 3.671-7.214 5.827-1.938-2.59 2.584-2.05-1.94-2.268-2.582 2.052-1.938-2.482 2.584-2.053-1.938-2.482-13.244 11.01L65.785 56.56l2.26-2.807c1.616.108 2.8 1.295 3.446 2.807l-2.26 2.807 1.398 1.078c3.122-2.806 7.215-4.64 11.414-4.64 8.828 0 15.718 7.23 15.718 16.081 0 2.915-.753 6.046-2.368 8.636l2.368 1.834c-.107 1.728-1.722 3.561-3.337 3.994l-2.262-1.836c-3.12 3.023-7.213 4.642-11.52 4.642-8.829 0-15.719-7.014-15.719-15.972 0-2.915.862-5.938 2.154-8.42l-1.292-1.19-2.261 3.023c-1.616-.214-3.015-1.298-3.445-3.023l2.26-2.698-10.66-8.85v14.03l3.554.109c.431.54.755 1.297.755 2.16 0 .754-.324 1.62-.647 2.266H51.68v1.728c7.752 1.295 14.213 7.879 14.213 15.864 0 8.312-6.354 14.899-14.213 16.191v2.81c-.754.427-1.723.754-2.584.754-.969 0-2.046-.327-2.907-.754v-2.81c-7.859-1.292-13.997-7.879-13.997-16.191 0-7.985 6.138-14.57 13.997-15.756V70.59h-3.66c-.432-.647-.647-1.512-.647-2.266 0-.863.215-1.62.647-2.269h3.66v-14.03l-10.767 8.85 2.37 2.698c-.54 1.725-1.939 2.81-3.554 3.023l-2.261-3.023-1.4 1.19c1.508 2.482 2.261 5.505 2.261 8.42 0 8.958-6.89 15.972-15.718 15.972-4.2 0-8.4-1.62-11.414-4.642l-2.369 1.836C1.83 85.916.215 84.083 0 82.355l2.26-1.834C.862 77.931 0 74.8 0 71.885c0-8.85 6.89-16.08 15.72-16.08 4.305 0 8.397 1.833 11.52 4.64l1.292-.974-2.261-2.912c.538-1.512 1.938-2.59 3.552-2.807l2.262 2.807 12.597-10.145-13.243-11.01-1.938 2.481 2.584 2.053-1.938 2.482-2.584-2.052-1.939 2.268 2.477 2.05-1.938 2.59-7.106-5.827 6.676-3.672-1.938-1.62-6.137 3.348 2.045-6.692-1.938-1.62-2.26 7.341-7.215-5.83 1.938-2.374 2.477 2.053 2.046-2.375-2.585-2.268 1.938-2.268 2.584 1.946 1.83-2.268-5.598-4.424c.538-1.839 1.723-3.348 3.446-4.43l29.823 24.398V24.393h-3.014v3.13H40.16v-3.13h-3.123v3.13h-3.122V18.35l7.105 3.02v-2.59l-6.566-2.696 6.566-2.59V11.01l-7.105 2.807V4.534h3.122V7.88h3.123V4.534h3.015V7.88h3.014V.541C47.05.216 48.019 0 48.989 0c.86 0 1.83.216 2.69.54v40.154l29.825-24.397a8.768 8.768 0 013.445 4.429l-5.706 4.424 1.938 2.268 2.585-1.946 1.937 2.268-2.584 2.268 1.938 2.375 2.585-2.053 1.937 2.374-7.214 5.83zM19.164 75.338c0 2.593 1.94 4.21 4.2 4.426l-3.768 2.915c-2.584-.973-4.953-4.102-4.953-6.8 0-.863.215-1.404.43-2.05-.322 0-.538.108-.754.108-3.444 0-6.352-3.239-6.997-6.584l3.875-3.023c-.108.433-.108.755-.108 1.08 0 2.157 2.046 4.101 4.2 4.101 2.26 0 4.414-1.944 4.414-4.213 0-2.801-2.154-4.637-4.845-4.637-5.275 0-10.444 5.072-10.444 11.765 0 1.941.43 3.777 1.292 5.394l2.37-1.833c1.614.754 2.906 2.374 3.337 4.21L9.045 82.03c2.26 1.944 5.059 2.807 7.967 2.807 6.028 0 10.874-4.856 10.874-9.174 0-2.48-1.723-4.64-4.307-4.64-2.369 0-4.415 1.833-4.415 4.315zm31.978 9.285c0 2.372 1.938 4.316 4.199 4.316 1.615 0 2.26-.646 3.445-1.62v4.86c-1.185.646-2.369.97-3.66.97-2.584 0-4.737-.757-6.138-3.023-1.507 2.266-3.66 3.023-6.245 3.023-1.184 0-2.476-.324-3.66-.97v-4.86c1.077 1.08 1.937 1.62 3.446 1.62 2.369 0 4.199-1.944 4.199-4.316 0-2.268-1.508-4.318-3.985-4.318-4.413 0-6.244 4.208-6.244 8.093 0 5.722 4.2 10.578 9.69 11.551v-2.914c.861-.433 1.83-.541 2.692-.541.969 0 1.937.108 2.799.54v2.915c5.06-.756 9.69-6.154 9.69-11.55 0-3.994-1.615-8.094-6.245-8.094-2.368 0-3.983 2.05-3.983 4.318zm26.81-19.325c0 2.163 2.26 4.213 4.521 4.213 2.153 0 4.2-1.944 4.2-4.102 0-.324-.109-.646-.109-1.079l3.77 3.023c-.648 3.67-3.877 6.906-7.645 6.476.215.646.322 1.187.322 2.05 0 2.698-2.368 5.827-4.952 6.8l-3.769-2.915c2.37-.216 4.307-1.833 4.307-4.426 0-2.482-2.153-4.316-4.522-4.316-2.476 0-4.306 2.16-4.306 4.749 0 3.13 3.767 9.066 10.982 9.066 2.907 0 5.706-.863 7.86-2.807l-2.37-1.833c.538-1.836 1.615-3.456 3.338-4.21l2.369 1.833c.861-1.617 1.4-3.453 1.4-5.394 0-5.181-3.984-11.765-10.337-11.765-2.691 0-5.06 1.836-5.06 4.637z" 
                        fill="#ffffff" 
                      />
                      <path 
                        d="M174.257 64.999c0 22.365-12.195 25.046-24.39 25.046-20.97 0-25.432-10.735-25.432-26.09v-43.31h-7.733V16.47H146v4.174h-8.328v42.043c0 14.835 3.867 22.215 14.5 22.215 10.856 0 16.137-5.367 16.137-20.799v-43.46H160.5V16.47h20.82v4.174h-7.064zM194.76 85.05V20.645h-8.157V16.47h32.495c13.83 0 20.671 7.826 20.671 16.995 0 9.765-8.848 15.28-16.73 16.922 15.317 1.415 19.481 11.256 19.481 18.489 0 14.758-12.566 20.35-24.91 20.35h-31.53V85.05zm31.774-50.764c0-6.783-3.495-13.642-11.154-13.642h-8.446v27.953h7.554c8.104 0 12.046-6.859 12.046-14.31zm2.602 34.59c0-9.693-4.164-16.18-13.905-16.18h-8.297V85.05h6.735c10.336 0 15.467-6.112 15.467-16.174zm45.806-49.2c-7.66 0-12.567 4.546-12.567 12.447 0 7.155 7.734 10.586 15.244 13.12 4.46 1.568 10.113 3.652 13.98 7.38 4.238 4.026 6.543 9.393 6.395 16.174-.298 12.677-9.147 21.247-24.763 21.323-5.874 0-15.02-1.342-20.523-4.547l-.595-19.084h4.61c.373 12.82 6.396 19.53 16.954 19.53 8.477 0 13.163-5.666 13.163-14.312 0-7.454-6.172-10.661-15.542-13.79-3.049-1.045-9.072-3.281-13.311-7.454-3.792-3.805-5.576-8.573-5.576-13.643 0-14.835 10.559-21.247 23.647-21.247 5.204 0 13.012 1.866 17.548 4.473l.446 16.55h-4.61c-.966-11.777-6.097-16.92-14.5-16.92z" 
                        fill="#e60000" 
                      />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-serif text-amber-200/90 tracking-wider">
                    Premium International Account
                  </span>
                </div>

              </div>
            </div>

            {/* ======================= TWO COLUMN ROW 1: ACCOUNT OVERVIEW & PORTFOLIO ALLOCATION ======================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* CARD 1: ACCOUNT OVERVIEW */}
              <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#121622] via-[#0d1017] to-[#080a0f] p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(212,175,55,0.06)] flex flex-col justify-between">
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#202738]/80">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <h3 className="text-base sm:text-lg font-serif font-semibold text-white tracking-wide">
                        Account Overview
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        if (isFeatureRestricted('accounts')) {
                          setLockedModalItem({ label: 'Accounts & Overview' });
                          return;
                        }
                        setShowDetailsModal(true);
                      }}
                      className="px-3.5 py-1 rounded-full border border-amber-500/60 text-amber-300 text-xs font-medium hover:bg-amber-500/20 hover:border-amber-400 hover:shadow-[0_0_10px_rgba(212,175,55,0.25)] transition-all flex items-center space-x-1 active:scale-95"
                    >
                      <span>View Details</span>
                      {isPageLocked('accounts') && <Lock className="w-3 h-3 text-amber-400/80 ml-1" />}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-[#1b2130]/80 text-xs sm:text-sm pt-1">
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-neutral-400">Account Holder:</span>
                      <span className="font-semibold text-white tracking-wide">{fullName}</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-neutral-400">Account Number:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-neutral-200 tracking-wider">
                          {!isBalanceVisible ? '••••••••••••' : (showAccountFull ? fullAccountNumber : accountNumber)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAccountFull(!showAccountFull)}
                          className="text-neutral-400 hover:text-amber-400 transition-colors p-0.5"
                          title={showAccountFull ? "Hide account number" : "Reveal full account number"}
                        >
                          {showAccountFull ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-neutral-400">Account Type:</span>
                      <span className="text-neutral-200">{accountType}</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-neutral-400">Account Currency:</span>
                      <span className="font-semibold text-white">USD</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-neutral-400">Account Status:</span>
                      <span className="flex items-center space-x-1.5 text-green-400 font-medium">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                        </span>
                        <span>Active</span>
                      </span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-neutral-400">Opening Date:</span>
                      <span className="text-neutral-300">{openingDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: PORTFOLIO ALLOCATION */}
              <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#121622] via-[#0d1017] to-[#080a0f] p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(212,175,55,0.06)] flex flex-col justify-between">
                <div>
                  {/* Card Header */}
                  <div className="flex items-center space-x-2.5 pb-4 border-b border-[#202738]/80">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <PieChart className="w-4 h-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-serif font-semibold text-white tracking-wide">
                      Portfolio Allocation
                    </h3>
                  </div>

                  {/* Body: Donut Chart & Legend */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-around gap-6">
                    
                    {/* Donut Chart SVG */}
                    <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_12px_rgba(212,175,55,0.2)]" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#181e2b"
                          strokeWidth="11"
                        />
                        {/* Golden segment */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="url(#goldGradientDonut)"
                          strokeWidth="11"
                          strokeDasharray="251.2"
                          strokeDashoffset={balance > 0 ? "0" : "0"}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="goldGradientDonut" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f7d58a" />
                            <stop offset="50%" stopColor="#d4af37" />
                            <stop offset="100%" stopColor="#bf953f" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Center Info */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-bold text-white tracking-tight drop-shadow-sm">
                          {formatCurrency(balance)}
                        </span>
                        <span className="text-[10px] text-amber-300/80 uppercase tracking-widest font-serif font-medium mt-0.5">
                          Total
                        </span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-2.5 w-full sm:w-auto text-xs sm:text-sm">
                      <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f3c651] shadow-[0_0_6px_#f3c651]" />
                          <span className="text-neutral-300">USD Cash Balance</span>
                        </div>
                        <div className="flex items-center space-x-2 font-mono">
                          <span className="text-white">{formatCurrency(balance)}</span>
                          <span className="text-neutral-400">{balance > 0 ? '100.00%' : '0.00%'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_6px_#3b82f6]" />
                          <span className="text-neutral-300">EUR Currency Account</span>
                        </div>
                        <div className="flex items-center space-x-2 font-mono">
                          <span className="text-white">€0.00</span>
                          <span className="text-neutral-400">0.00%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] shadow-[0_0_6px_#a855f7]" />
                          <span className="text-neutral-300">GBP Currency Account</span>
                        </div>
                        <div className="flex items-center space-x-2 font-mono">
                          <span className="text-white">£0.00</span>
                          <span className="text-neutral-400">0.00%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
                          <span className="text-neutral-300">Investment Holdings</span>
                        </div>
                        <div className="flex items-center space-x-2 font-mono">
                          <span className="text-white">$0.00</span>
                          <span className="text-neutral-400">0.00%</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* ======================= TWO COLUMN ROW 2: CURRENCY BALANCES & QUICK ACTIONS ======================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* CARD 3: CURRENCY BALANCES */}
              <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#121622] via-[#0d1017] to-[#080a0f] p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(212,175,55,0.06)]">
                {/* Card Header */}
                <div className="flex items-center space-x-2.5 pb-4 border-b border-[#202738]/80">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Coins className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-white tracking-wide">
                    Currency Balances
                  </h3>
                </div>

                {/* Currency list with flags */}
                <div className="mt-4 space-y-3">
                  
                  {/* USD */}
                  <div 
                    onClick={() => {
                      if (isFeatureRestricted('transfers')) {
                        setLockedModalItem({ label: 'Transfers' });
                        return;
                      }
                      router.push('/transfer');
                    }}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#141926]/80 border border-[#232b3f]/70 hover:border-amber-500/50 hover:bg-[#181f30] hover:shadow-[0_0_16px_rgba(212,175,55,0.12)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <UsFlag />
                      <span className="text-xs sm:text-sm font-medium text-white group-hover:text-amber-200 transition-colors">
                        USD – US Dollar
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm sm:text-base font-semibold text-white">
                        {formatCurrency(balance)}
                      </span>
                      {isPageLocked('transfers') ? (
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </div>

                  {/* EUR */}
                  <div 
                    onClick={() => {
                      if (isFeatureRestricted('transfers')) {
                        setLockedModalItem({ label: 'Transfers' });
                        return;
                      }
                      router.push('/transfer');
                    }}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#141926]/80 border border-[#232b3f]/70 hover:border-amber-500/50 hover:bg-[#181f30] hover:shadow-[0_0_16px_rgba(212,175,55,0.12)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <EuFlag />
                      <span className="text-xs sm:text-sm font-medium text-white group-hover:text-amber-200 transition-colors">
                        EUR – Euro
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm sm:text-base font-semibold text-white">
                        {isBalanceVisible ? '€0.00' : '••••••'}
                      </span>
                      {isPageLocked('transfers') ? (
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </div>

                  {/* GBP */}
                  <div 
                    onClick={() => {
                      if (isFeatureRestricted('transfers')) {
                        setLockedModalItem({ label: 'Transfers' });
                        return;
                      }
                      router.push('/transfer');
                    }}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#141926]/80 border border-[#232b3f]/70 hover:border-amber-500/50 hover:bg-[#181f30] hover:shadow-[0_0_16px_rgba(212,175,55,0.12)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <UkFlag />
                      <span className="text-xs sm:text-sm font-medium text-white group-hover:text-amber-200 transition-colors">
                        GBP – British Pound
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm sm:text-base font-semibold text-white">
                        {isBalanceVisible ? '£0.00' : '••••••'}
                      </span>
                      {isPageLocked('transfers') ? (
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* CARD 4: QUICK ACTIONS */}
              <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#121622] via-[#0d1017] to-[#080a0f] p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(212,175,55,0.06)]">
                {/* Card Header */}
                <div className="flex items-center space-x-2.5 pb-4 border-b border-[#202738]/80">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-white tracking-wide">
                    Quick Actions
                  </h3>
                </div>

                {/* 2x2 Grid Buttons */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Make a Transfer */}
                  <button
                    onClick={() => {
                      if (isFeatureRestricted('transfers')) {
                        setLockedModalItem({ label: 'Transfers' });
                        return;
                      }
                      router.push('/transfer');
                    }}
                    className="p-3.5 rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#161b28] to-[#101420] hover:border-amber-400 hover:bg-[#1a2132] hover:shadow-[0_0_18px_rgba(212,175,55,0.18)] transition-all flex items-center justify-center space-x-2.5 text-xs sm:text-sm font-medium text-white group active:scale-95"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Make a Transfer</span>
                    {isPageLocked('transfers') && <Lock className="w-3 h-3 text-amber-400/80 ml-1" />}
                  </button>

                  {/* Deposit Funds */}
                  <button
                    onClick={() => {
                      if (isFeatureRestricted('deposit')) {
                        setLockedModalItem({ label: 'Deposit Checks' });
                        return;
                      }
                      router.push('/deposit');
                    }}
                    className="p-3.5 rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#161b28] to-[#101420] hover:border-amber-400 hover:bg-[#1a2132] hover:shadow-[0_0_18px_rgba(212,175,55,0.18)] transition-all flex items-center justify-center space-x-2.5 text-xs sm:text-sm font-medium text-white group active:scale-95"
                  >
                    <ArrowDownToLine className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Deposit Funds</span>
                    {isPageLocked('deposit') && <Lock className="w-3 h-3 text-amber-400/80 ml-1" />}
                  </button>

                  {/* View Investments */}
                  <button
                    onClick={() => {
                      if (isFeatureRestricted('investments')) {
                        setLockedModalItem({ label: 'Investments' });
                        return;
                      }
                      setShowInvestmentsModal(true);
                    }}
                    className="p-3.5 rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#161b28] to-[#101420] hover:border-amber-400 hover:bg-[#1a2132] hover:shadow-[0_0_18px_rgba(212,175,55,0.18)] transition-all flex items-center justify-center space-x-2.5 text-xs sm:text-sm font-medium text-white group active:scale-95"
                  >
                    <TrendingUp className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>View Investments</span>
                    {isPageLocked('investments') && <Lock className="w-3 h-3 text-amber-400/80 ml-1" />}
                  </button>

                  {/* Contact UBS */}
                  <button
                    onClick={() => {
                      if (isFeatureRestricted('support')) {
                        setLockedModalItem({ label: 'Support & Concierge' });
                        return;
                      }
                      setShowContactModal(true);
                    }}
                    className="p-3.5 rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#161b28] to-[#101420] hover:border-amber-400 hover:bg-[#1a2132] hover:shadow-[0_0_18px_rgba(212,175,55,0.18)] transition-all flex items-center justify-center space-x-2.5 text-xs sm:text-sm font-medium text-white group active:scale-95"
                  >
                    <Headphones className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Contact UBS</span>
                    {isPageLocked('support') && <Lock className="w-3 h-3 text-amber-400/80 ml-1" />}
                  </button>

                </div>
              </div>

            </div>

            {/* ======================= BOTTOM ROW: RECENT TRANSACTIONS ======================= */}
            <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#121622] via-[#0d1017] to-[#080a0f] p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(212,175,55,0.06)]">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#202738]/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-white tracking-wide">
                    Recent Transactions
                  </h3>
                </div>
                <button
                  onClick={() => {
                    if (isFeatureRestricted('transactions')) {
                      setLockedModalItem({ label: 'Transaction History' });
                      return;
                    }
                    router.push('/transactions');
                  }}
                  className="text-xs sm:text-sm font-medium text-amber-300 hover:text-amber-200 flex items-center space-x-1 group"
                >
                  <span>View All</span>
                  {isPageLocked('transactions') && <Lock className="w-3 h-3 text-amber-400/80 ml-1 mr-0.5" />}
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Transactions Body */}
              <div className="pt-4">
                {recentTransactions && recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => router.push('/transactions')}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-[#141926]/70 border border-[#232b3f]/70 hover:border-amber-500/40 hover:bg-[#181f30] transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            tx.type === 'credit' 
                              ? 'bg-green-500/15 border border-green-500/30 text-green-400' 
                              : 'bg-red-500/15 border border-red-500/30 text-red-400'
                          }`}>
                            {tx.type === 'credit' ? (
                              <ArrowDownToLine className="w-4 h-4" />
                            ) : (
                              <ArrowLeftRight className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                            <p className="text-xs text-neutral-400 truncate">{tx.date} • {tx.category}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-mono font-semibold text-sm ${
                            tx.type === 'credit' ? 'text-green-400' : 'text-neutral-200'
                          }`}>
                            {tx.type === 'credit' ? '+' : '-'}
                            ${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-14 flex flex-col items-center justify-center text-center space-y-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#161b28] to-[#0f131d] border border-amber-500/25 flex items-center justify-center text-amber-400/80 shadow-[0_0_15px_rgba(212,175,55,0.08)]">
                      <Search className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm sm:text-base font-serif font-medium text-white tracking-wide">
                        No recent transactions
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-400 max-w-sm">
                        Your transaction history will appear here once activity begins.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ======================= MODAL: ACCESS RESTRICTED / FEATURE LOCKED ======================= */}
      {lockedModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/40 bg-gradient-to-b from-[#181119] via-[#120d14] to-[#0a070c] p-6 shadow-2xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-900/30 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(230,0,0,0.25)]">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white mb-2">
              {lockedModalItem.label} Access Restricted
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-5">
              Access to <strong>{lockedModalItem.label}</strong> has been restricted on your private wealth portfolio by your portfolio administrator. Please contact your dedicated UBS Wealth Advisor to request access.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setLockedModalItem(null);
                  setShowContactModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#dfba60] via-[#eed187] to-[#c79a40] text-[#090b10] font-bold text-xs sm:text-sm hover:brightness-110 shadow-md transition-all active:scale-95"
              >
                Contact UBS Advisor
              </button>
              <button
                onClick={() => setLockedModalItem(null)}
                className="w-full py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold hover:bg-neutral-800/50 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: VIEW DETAILS ======================= */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-gradient-to-b from-[#141824] to-[#0a0d14] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#212635]">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-white tracking-wide">Account Specifications</h3>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#181d2c]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-[#1b2130]">
                <span className="text-neutral-400">Account Holder</span>
                <span className="font-semibold text-white">{fullName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#1b2130]">
                <span className="text-neutral-400">Account Number</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-amber-200">
                    {showAccountFull ? fullAccountNumber : accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAccountFull(!showAccountFull)}
                    className="text-neutral-400 hover:text-amber-400 transition-colors p-0.5"
                    title={showAccountFull ? "Hide account number" : "Reveal full account number"}
                  >
                    {showAccountFull ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1b2130]">
                <span className="text-neutral-400">Swiss IBAN</span>
                <span className="font-mono text-neutral-200">
                  {showAccountFull ? 'CH93 0023 0784 5632 1000 0' : 'CH93 0023 XXXX XXXX XXXX X'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1b2130]">
                <span className="text-neutral-400">BIC / SWIFT Code</span>
                <span className="font-mono text-neutral-200">UBSWCHZH80A</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1b2130]">
                <span className="text-neutral-400">Clearing Code</span>
                <span className="font-mono text-neutral-200">0230</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1b2130]">
                <span className="text-neutral-400">Domicile Branch</span>
                <span className="text-neutral-200">UBS Switzerland AG, Zurich Head Office</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-400">Management Tier</span>
                <span className="text-amber-300 font-serif">Ultra-High Net Worth Multi-Currency</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#dfba60] via-[#eed187] to-[#c79a40] text-[#090b10] font-bold text-xs sm:text-sm hover:brightness-110 shadow-md transition-all active:scale-95"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: CONTACT UBS ======================= */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-gradient-to-b from-[#141824] to-[#0a0d14] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#212635]">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Headphones className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-white tracking-wide">UBS Private Concierge</h3>
              </div>
              <button 
                onClick={() => setShowContactModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#181d2c]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-4 text-xs sm:text-sm">
              <p className="text-neutral-300 leading-relaxed">
                Your dedicated UBS Wealth Advisor is available 24 hours a day, 7 days a week for portfolio management, private transactions, and global advisory.
              </p>
              <div className="p-3.5 rounded-xl bg-[#141824] border border-[#232a3d] space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-300 font-semibold">
                  <Phone className="w-4 h-4" />
                  <span>Private Wealth Hotline (Switzerland)</span>
                </div>
                <p className="font-mono text-white text-sm">+41 44 234 1111</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#141824] border border-[#232a3d] space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-300 font-semibold">
                  <Phone className="w-4 h-4" />
                  <span>International Toll-Free (US / Americas)</span>
                </div>
                <p className="font-mono text-white text-sm">+1 800 555 8271</p>
              </div>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  router.push('/messages');
                }}
                className="w-full py-2.5 rounded-xl border border-amber-500/50 text-amber-300 hover:bg-amber-500/15 font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Open Secure Messaging Portal</span>
              </button>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#dfba60] via-[#eed187] to-[#c79a40] text-[#090b10] font-bold text-xs sm:text-sm hover:brightness-110 shadow-md transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: BANKING SECURELY WITH UBS ======================= */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-gradient-to-b from-[#141824] to-[#0a0d14] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#212635]">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-white tracking-wide">Banking Securely with UBS</h3>
              </div>
              <button 
                onClick={() => setShowSecurityModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#181d2c]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3.5 text-xs sm:text-sm text-neutral-300">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white font-serif">Swiss Banking Standard Encryption</h4>
                  <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                    End-to-end 256-bit AES encryption with multi-signature authorization protecting all funds and communications.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white font-serif">Asset Custody & Protection</h4>
                  <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                    Segregated accounts backed by Swiss Federal Banking regulations and international deposit guarantee schemes.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white font-serif">Biometric Multi-Factor Authentication</h4>
                  <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                    Hardware token validation and automated fraud screening monitor transaction security around the clock.
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setShowSecurityModal(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#dfba60] via-[#eed187] to-[#c79a40] text-[#090b10] font-bold text-xs sm:text-sm hover:brightness-110 shadow-md transition-all active:scale-95"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: VIEW INVESTMENTS / WEALTH PLANNING ======================= */}
      {showInvestmentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-gradient-to-b from-[#141824] to-[#0a0d14] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#212635]">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-white tracking-wide">UBS Global Investment Portfolios</h3>
              </div>
              <button 
                onClick={() => setShowInvestmentsModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#181d2c]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3.5 text-xs sm:text-sm text-neutral-300">
              <p className="leading-relaxed">
                UBS Global Wealth Management offers bespoke discretionary and advisory portfolios tailored to your long-term capital preservation and growth objectives.
              </p>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-[#141824] border border-[#232a3d]">
                  <p className="text-[11px] text-amber-300 font-semibold font-serif">Swiss Core Equities</p>
                  <p className="text-xs text-neutral-300 mt-1">SMI Blue Chip & Defensive Growth</p>
                </div>
                <div className="p-3 rounded-xl bg-[#141824] border border-[#232a3d]">
                  <p className="text-[11px] text-amber-300 font-semibold font-serif">Global Fixed Income</p>
                  <p className="text-xs text-neutral-300 mt-1">Sovereign & AAA Corporate Debt</p>
                </div>
                <div className="p-3 rounded-xl bg-[#141824] border border-[#232a3d]">
                  <p className="text-[11px] text-amber-300 font-semibold font-serif">Precious Metals</p>
                  <p className="text-xs text-neutral-300 mt-1">Physical Allocated Gold Bullion</p>
                </div>
                <div className="p-3 rounded-xl bg-[#141824] border border-[#232a3d]">
                  <p className="text-[11px] text-amber-300 font-semibold font-serif">Private Markets</p>
                  <p className="text-xs text-neutral-300 mt-1">Direct Infrastructure & Real Estate</p>
                </div>
              </div>
              <p className="text-[11px] text-neutral-400 italic">
                *To activate discretionary portfolio trading on this account, initial funding settlement is required.
              </p>
            </div>
            <div className="pt-2 flex space-x-3">
              <button
                onClick={() => {
                  if (isFeatureRestricted('deposit')) {
                    setShowInvestmentsModal(false);
                    setLockedModalItem({ label: 'Deposit & Funding' });
                    return;
                  }
                  setShowInvestmentsModal(false);
                  router.push('/deposit');
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba60] via-[#eed187] to-[#c79a40] text-[#090b10] font-bold text-xs sm:text-sm hover:brightness-110 shadow-md transition-all active:scale-95"
              >
                Fund Account
              </button>
              <button
                onClick={() => setShowInvestmentsModal(false)}
                className="py-2.5 px-4 rounded-xl border border-neutral-700 text-neutral-300 font-semibold text-xs sm:text-sm hover:bg-neutral-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
