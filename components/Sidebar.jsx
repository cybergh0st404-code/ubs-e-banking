import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  ArrowLeftRight,
  History,
  Settings,
  Shield,
  Users,
  CreditCard,
  Send,
  Camera,
  Receipt,
  FileText,
  TrendingUp,
  Mail,
  X,
  LogOut,
  User as UserIcon,
  Lock,
  Compass,
  PieChart,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { DEFAULT_CORE_MENU_IDS, normalizeMenuIds } from '../lib/navigationConfig.js';

const Sidebar = ({ isAdmin = false }) => {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [allowedPages, setAllowedPages] = useState(user?.allowedPages || null);
  const [lockedPages, setLockedPages] = useState(user?.lockedPages || []);
  const [lockedModalItem, setLockedModalItem] = useState(null);

  // Listen to mobile menu toggle event dispatched by Navbar
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    if (typeof window !== 'undefined') {
      window.addEventListener('toggle-bank-sidebar', handleToggle);
      return () => window.removeEventListener('toggle-bank-sidebar', handleToggle);
    }
  }, []);

  // Sync allowed and locked pages from account-data API
  useEffect(() => {
    if (isAdmin || !user) return;
    const fetchPerms = async () => {
      try {
        const query = user.id ? `?userId=${user.id}&email=${encodeURIComponent(user.email || '')}` : '';
        const res = await fetch(`/api/user/account-data${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.allowedPages && Array.isArray(data.allowedPages)) {
            setAllowedPages(data.allowedPages);
          }
          if (data.lockedPages && Array.isArray(data.lockedPages)) {
            setLockedPages(data.lockedPages);
          }
          if (updateUser && (data.allowedPages || data.lockedPages)) {
            updateUser({
              allowedPages: data.allowedPages || [],
              lockedPages: data.lockedPages || [],
            });
          }
        }
      } catch (err) {
        console.error('Failed to sync sidebar pages:', err);
      }
    };
    fetchPerms();
  }, [isAdmin, user]);

  const allUserMenuItems = [
    { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'accounts', path: '/dashboard', icon: CreditCard, label: 'Accounts' },
    { id: 'transfers', path: '/transfer', icon: ArrowLeftRight, label: 'Transfers' },
    { id: 'transactions', path: '/transactions', icon: History, label: 'Transactions' },
    { id: 'investments', path: '/dashboard', icon: TrendingUp, label: 'Investments' },
    { id: 'wealth-planning', path: '/dashboard', icon: PieChart, label: 'Wealth Planning' },
    { id: 'market-insights', path: '/dashboard', icon: Compass, label: 'Market Insights' },
    { id: 'statements', path: '/statements', icon: FileText, label: 'Statements' },
    { id: 'messages', path: '/messages', icon: Mail, label: 'Secure Messages' },
    { id: 'settings', path: '/settings', icon: Settings, label: 'Settings' },
    { id: 'support', path: '/messages', icon: HelpCircle, label: 'Support' },
    { id: 'wire-transfer', path: '/wire-transfer', icon: Send, label: 'Wire Transfer' },
    { id: 'deposit', path: '/deposit', icon: Camera, label: 'Deposit Checks' },
    { id: 'bill-pay', path: '/bill-pay', icon: Receipt, label: 'Bill Pay' },
    { id: 'cards', path: '/cards', icon: CreditCard, label: 'Cards & Virtual' },
    { id: 'credit-score', path: '/credit-score', icon: TrendingUp, label: 'Credit Score' },
    { id: 'security', path: '/security', icon: Shield, label: 'Security & Sessions' },
  ];

  const adminMenuItems = [
    { id: 'admin-users', path: '/admin', icon: Users, label: 'User Management' },
    { id: 'admin-accounts', path: '/admin/accounts', icon: CreditCard, label: 'All Accounts' },
    { id: 'admin-transactions', path: '/admin/transactions', icon: History, label: 'All Transactions' },
  ];

  // Filter items by allowed pages if user is not admin
  const userMenuItems = allowedPages && Array.isArray(allowedPages)
    ? allUserMenuItems.filter((item) => item.id === 'dashboard' || allowedPages.includes(item.id))
    : allUserMenuItems.filter((item) => DEFAULT_CORE_MENU_IDS.includes(item.id));

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  // Map current path to page id to check if user navigated directly to a locked or disallowed page
  const currentItem = allUserMenuItems.find((i) => i.path === router.pathname);
  const isCurrentPageLocked = !isAdmin && currentItem && lockedPages.includes(currentItem.id);
  const isCurrentPageDisallowed = !isAdmin && currentItem && allowedPages && Array.isArray(allowedPages) && currentItem.id !== 'dashboard' && !allowedPages.includes(currentItem.id);

  const handleMenuClick = (item) => {
    if (!isAdmin && lockedPages.includes(item.id)) {
      setLockedModalItem(item.label);
      return;
    }
    router.push(item.path);
    setIsOpen(false);
  };

  const renderNavLinks = () => (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = isAdmin
          ? router.pathname.startsWith(item.path) || (item.path === '/admin' && router.pathname === '/admin')
          : router.pathname === item.path;
        const isLocked = !isAdmin && lockedPages.includes(item.id);

        return (
          <button
            key={item.id || item.path}
            onClick={() => handleMenuClick(item)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-bank text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-blue text-white shadow-bank'
                : isLocked
                ? 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'
                : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary-navy'
            }`}
          >
            <div className="flex items-center space-x-3 truncate">
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : isLocked ? 'text-neutral-400' : 'text-neutral-500'}`} />
              <span className="truncate">{item.label}</span>
            </div>
            {isLocked && (
              <span className="flex items-center space-x-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                <Lock className="w-2.5 h-2.5" />
                <span>Locked</span>
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* MOBILE DRAWER (Below lg) */}
      <div className="lg:hidden">
        {/* Backdrop Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Slide-out Drawer */}
        <div
          className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Top Header */}
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
            <div className="flex items-center space-x-2">
              <img
                src="/ubslogo.png"
                alt="UBS"
                className="h-6 w-auto object-contain"
              />
              <span className="h-4 w-px bg-neutral-300"></span>
              <span className="font-bold text-primary-navy text-sm">E-Banking</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Mini Badge */}
          {user && (
            <div className="p-3.5 mx-3 mt-3 bg-blue-50/70 border border-blue-100 rounded-bank flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-primary-blue text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-primary-navy truncate">{user.name || 'Account Holder'}</div>
                <div className="text-[11px] text-neutral-500 truncate">{isAdmin ? 'Administrator' : user.email}</div>
              </div>
            </div>
          )}

          {/* Navigation Links Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">
              Navigation Menu
            </div>
            {renderNavLinks()}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-3 border-t border-neutral-200 bg-neutral-50">
            <button
              onClick={() => {
                if (logout) logout();
                router.push('/login');
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-accent-red hover:bg-red-50 rounded-bank transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP SIDEBAR (lg and above) */}
      <aside className="hidden lg:block w-64 bg-white border-r border-neutral-200 min-h-screen pt-6 pb-12 z-30 flex-shrink-0">
        <div className="px-3">
          {renderNavLinks()}
        </div>
      </aside>

      {/* FEATURE RESTRICTED / LOCKED MODAL (Triggered when user clicks locked sidebar item) */}
      {lockedModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111318] text-neutral-100 border border-[#d4af37]/40 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-xl font-serif text-center font-bold text-[#f5ecd7] mb-2">
              Access Restricted
            </h3>
            <p className="text-xs uppercase tracking-widest text-center text-[#d4af37] font-semibold mb-3">
              {lockedModalItem}
            </p>
            <p className="text-xs text-neutral-300 text-center leading-relaxed mb-6">
              This service is currently locked on your account by your private wealth administrator. 
              Please contact your dedicated relationship manager or support to request access.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setLockedModalItem(null)}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#d4af37] to-[#b38e2e] text-[#0a0a0c] font-semibold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all uppercase tracking-wider"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-PAGE RESTRICTION GUARD (If user navigated directly via URL to a locked or disallowed page) */}
      {(isCurrentPageLocked || isCurrentPageDisallowed) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#111318] text-neutral-100 border border-amber-500/50 rounded-2xl max-w-lg w-full p-8 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mb-5">
              <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#f5ecd7] mb-2">
              {isCurrentPageLocked ? 'Feature Locked' : 'Access Restricted'}
            </h2>
            <p className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold mb-4">
              {currentItem?.label || 'Private Banking Module'}
            </p>
            <p className="text-sm text-neutral-300 leading-relaxed mb-6">
              {isCurrentPageLocked 
                ? 'Access to this service has been restricted by your Swiss wealth administration team. You do not have authorization to view or initiate operations in this section.'
                : 'This service is not enabled for your banking tier. Please contact your dedicated relationship manager to request access.'}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="py-3 px-8 bg-gradient-to-r from-[#d4af37] to-[#b38e2e] text-[#0a0a0c] font-bold text-xs uppercase tracking-widest rounded-xl shadow-xl hover:brightness-110 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
