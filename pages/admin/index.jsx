'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CreditCard, 
  History, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Power, 
  PowerOff, 
  Shield, 
  UserPlus, 
  Edit, 
  Trash2, 
  Key, 
  AlertTriangle,
  Lock, 
  Unlock,
  X,
  DollarSign,
  Eye,
  EyeOff,
  TrendingUp,
  LogOut,
  Ban,
  PauseCircle,
  ShieldAlert
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../utils/AuthContext';
import {
  ALL_NAVIGATION_MENUS,
  ALL_MENU_IDS,
  DEFAULT_CORE_MENU_IDS,
  normalizeMenuIds,
} from '../../lib/navigationConfig.js';

const ALL_AVAILABLE_PAGES = ALL_NAVIGATION_MENUS;
const DEFAULT_PAGES = ALL_MENU_IDS;

const AdminUsersPage = () => {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [websiteOpen, setWebsiteOpen] = useState(true);
  const [loadingWebsiteStatus, setLoadingWebsiteStatus] = useState(true);
  const [showSpendingOverview, setShowSpendingOverview] = useState(true);
  const [loadingSpendingToggle, setLoadingSpendingToggle] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeUser, setNoticeUser] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUser, setStatusUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [actionLoading, setActionLoading] = useState(false);

  // Forms state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    twoFactorCode: '',
    initialBalance: '0',
    initialDepositDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString().split('T')[0],
    accountType: 'Checking',
    status: 'active',
    allowedPages: DEFAULT_PAGES,
    lockedPages: [],
  });

  const [editUser, setEditUser] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    twoFactorCode: '',
    balance: '',
    initialDepositDate: '',
    createdAt: '',
    status: 'active',
    allowedPages: [],
    lockedPages: [],
  });

  const [noticeForm, setNoticeForm] = useState({
    enabled: false,
    message: '',
    progress: 65,
    progressStatus: '65% • Failed',
    progressLabel: 'Authorization Progress',
  });

  // Redirect non-admins to 404
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/404');
    }
  }, [user, router, authLoading]);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch website status
  useEffect(() => {
    const fetchWebsiteStatus = async () => {
      setLoadingWebsiteStatus(true);
      try {
        const res = await fetch('/api/website-status');
        if (res.ok) {
          const data = await res.json();
          setWebsiteOpen(data.isOpen);
          if (typeof data.showSpendingOverview === 'boolean') {
            setShowSpendingOverview(data.showSpendingOverview);
          }
        }
      } catch (error) {
        console.error('Error fetching website status:', error);
      } finally {
        setLoadingWebsiteStatus(false);
      }
    };
    fetchWebsiteStatus();
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to create user.');
        setActionLoading(false);
        return;
      }
      alert(`User ${newUser.name} created successfully!`);
      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        twoFactorCode: String(Math.floor(100000 + Math.random() * 900000)),
        initialBalance: '50000',
        initialDepositDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0],
        accountType: 'Checking',
        status: 'active',
        allowedPages: DEFAULT_PAGES,
        lockedPages: [],
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Network error while creating user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to update user.');
        setActionLoading(false);
        return;
      }
      alert('User details updated successfully!');
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Network error while updating user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This will remove all their accounts and transactions.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('User deleted successfully.');
        fetchUsers();
      } else {
        alert('Failed to delete user.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting user.');
    }
  };

  const openStatusModal = (u) => {
    setStatusUser(u);
    setSelectedStatus(u.status || 'active');
    setShowStatusModal(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!statusUser) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: statusUser.id, status: selectedStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to update account status.');
        return;
      }
      alert(`Account status for ${statusUser.name} updated to ${selectedStatus.toUpperCase()}.`);
      setShowStatusModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Error updating status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceLogout = async (u) => {
    if (!confirm(`Are you sure you want to log out ${u.name}? All active sessions across all devices will be immediately terminated.`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id, forceLogout: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to log out user.');
        return;
      }
      alert(`User ${u.name} has been successfully logged out of all active sessions.`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Error logging out user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = (user) => {
    openStatusModal(user);
  };

  const openEditModal = (u) => {
    // Read the exact user allowedPages from database and normalize
    const cleanAllowed = Array.isArray(u.allowedPages) ? normalizeMenuIds(u.allowedPages) : DEFAULT_CORE_MENU_IDS;
    const cleanLocked = Array.isArray(u.lockedPages) ? normalizeMenuIds(u.lockedPages) : [];

    setEditUser({
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      password: '', // Blank by default so password is never accidentally re-hashed
      twoFactorCode: '', // Blank by default so 2FA code is never accidentally re-hashed
      balance: u.totalBalance !== undefined ? String(u.totalBalance) : '',
      initialDepositDate: u.initialDepositDate || u.createdAt || new Date().toISOString().split('T')[0],
      createdAt: u.createdAt || new Date().toISOString().split('T')[0],
      status: u.status || 'active',
      allowedPages: cleanAllowed,
      lockedPages: cleanLocked,
    });
    setShowEditModal(true);
  };

  const openNoticeModal = (u) => {
    setNoticeUser(u);
    const n = u.notice || {};
    setNoticeForm({
      enabled: n.enabled !== undefined ? n.enabled : false,
      message: n.message || "Notice: Please note that full and complete payment is required before access and authorization to your online account and credit card can be granted. Kindly ensure all outstanding balances are settled to avoid delays.",
      progress: typeof n.progress === 'number' ? n.progress : 65,
      progressStatus: n.progressStatus || "65% • Failed",
      progressLabel: n.progressLabel || "Authorization Progress",
    });
    setShowNoticeModal(true);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    if (!noticeUser) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: noticeUser.id,
          notice: noticeForm,
        }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === noticeUser.id ? { ...u, notice: { ...noticeForm } } : u))
        );
        alert(`Notice settings for ${noticeUser.name} updated successfully!`);
        setShowNoticeModal(false);
        fetchUsers();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || 'Failed to save notice settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating notice settings: ' + (err.message || ''));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'active').toLowerCase();
    const styles = {
      active: 'bg-green-100 text-green-700 border-green-200',
      inactive: 'bg-neutral-100 text-neutral-600 border-neutral-300',
      pending: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
      flagged: 'bg-rose-100 text-rose-700 border-rose-200 font-semibold',
      suspended: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      blocked: 'bg-red-100 text-red-700 border-red-300 font-bold',
    };
    const dotColors = {
      active: 'bg-green-500',
      inactive: 'bg-neutral-400',
      pending: 'bg-amber-500',
      flagged: 'bg-rose-500',
      suspended: 'bg-amber-500',
      blocked: 'bg-red-500',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${styles[s] || styles.active}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[s] || dotColors.active}`}></span>
        {s}
      </span>
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'users', label: 'Users', icon: Users, path: '/admin' },
    { id: 'accounts', label: 'Accounts', icon: CreditCard, path: '/admin/accounts' },
    { id: 'transactions', label: 'Transactions', icon: History, path: '/admin/transactions' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {authLoading ? (
        <div className="flex items-center justify-center min-h-screen text-lg text-neutral-600">
          Loading authentication status...
        </div>
      ) : (!user || user.role !== 'admin') ? (
        <div className="flex items-center justify-center min-h-screen text-lg text-neutral-600">
          Redirecting to login...
        </div>
      ) : (
        <>
          <Navbar user={user} onLogout={logout} />
          <div className="flex">
            <Sidebar isAdmin={true} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header & Master Switch */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-primary-navy mb-1">User & Account Management</h1>
                    <p className="text-neutral-600 text-sm">Create, manage, and configure users, credentials, balances, and access.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <Button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center space-x-2 bg-primary-blue text-white px-4 py-2.5 rounded-bank hover:bg-opacity-90 shadow-bank"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add New User</span>
                    </Button>

                    <Card className="p-2 px-4 shadow-sm border border-neutral-200">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-primary-blue" />
                          <span className="text-xs font-semibold text-neutral-700">Site Status:</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            websiteOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {websiteOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <Button
                          variant={websiteOpen ? 'danger' : 'primary'}
                          onClick={async () => {
                            const newStatus = !websiteOpen;
                            try {
                              const res = await fetch('/api/website-status', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ isOpen: newStatus }),
                              });
                              if (res.ok) {
                                setWebsiteOpen(newStatus);
                                alert(`Website has been ${newStatus ? 'opened' : 'closed'}.`);
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="px-3 py-1 text-xs"
                        >
                          {websiteOpen ? <PowerOff className="w-3.5 h-3.5 mr-1 inline" /> : <Power className="w-3.5 h-3.5 mr-1 inline" />}
                          {websiteOpen ? 'Close Site' : 'Open Site'}
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-2 px-4 shadow-sm border border-neutral-200">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-primary-blue" />
                          <span className="text-xs font-semibold text-neutral-700">Spending Overview:</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            showSpendingOverview ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            {showSpendingOverview ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                        <Button
                          variant={showSpendingOverview ? 'danger' : 'primary'}
                          disabled={loadingSpendingToggle}
                          onClick={async () => {
                            const nextVal = !showSpendingOverview;
                            setLoadingSpendingToggle(true);
                            try {
                              const res = await fetch('/api/website-status', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ showSpendingOverview: nextVal }),
                              });
                              if (res.ok) {
                                setShowSpendingOverview(nextVal);
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setLoadingSpendingToggle(false);
                            }
                          }}
                          className="px-3 py-1 text-xs"
                        >
                          {showSpendingOverview ? <EyeOff className="w-3.5 h-3.5 mr-1 inline" /> : <Eye className="w-3.5 h-3.5 mr-1 inline" />}
                          {showSpendingOverview ? 'Hide' : 'Show'}
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-card shadow-bank p-1 flex space-x-1 overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Link
                        key={tab.id}
                        href={tab.path}
                        className={`flex-1 min-w-[130px] sm:min-w-0 flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-bank transition-all text-xs sm:text-sm whitespace-nowrap ${
                          router.pathname === tab.path
                            ? 'bg-primary-blue text-white shadow-bank font-semibold'
                            : 'text-neutral-600 hover:bg-accent-soft'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{tab.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Search */}
                <Card className="p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 text-sm"
                    />
                  </div>
                </Card>

                {/* Users Table */}
                <Card 
                  title={`All Registered Users (${filteredUsers.length})`}
                  subtitle="Manage accounts, login passwords, 2FA codes, and balances"
                >
                  {/* Desktop Table (Hidden on Mobile) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200 text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
                          <th className="text-left py-3 px-4 font-semibold">User</th>
                          <th className="text-left py-3 px-4 font-semibold">Email</th>
                          <th className="text-left py-3 px-4 font-semibold">Password</th>
                          <th className="text-left py-3 px-4 font-semibold">2FA Code</th>
                          <th className="text-left py-3 px-4 font-semibold">Total Balance</th>
                          <th className="text-left py-3 px-4 font-semibold">Status</th>
                          <th className="text-right py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {loadingUsers ? (
                          <tr>
                            <td colSpan="7" className="text-center py-8 text-neutral-500">
                              Loading users...
                            </td>
                          </tr>
                        ) : filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-8 text-neutral-500">
                              No users found matching "{searchQuery}".
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary-navy text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-neutral-900">{u.name}</div>
                                    <div className="flex items-center space-x-1.5 text-xs text-neutral-500 font-mono">
                                      <span>{u.primaryAccount ? u.primaryAccount.accountNumber : 'No account'}</span>
                                      {u.lockedPages && u.lockedPages.length > 0 && (
                                        <span className="inline-flex items-center text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded font-sans" title={`Locked menus: ${u.lockedPages.join(', ')}`}>
                                          <Lock className="w-2.5 h-2.5 mr-0.5" />
                                          {u.lockedPages.length} Locked
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-neutral-700">{u.email}</td>
                              <td className="py-3 px-4 font-mono text-neutral-600">
                                <span className="bg-neutral-100 px-2 py-1 rounded text-xs">
                                  ••••••••
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-50 text-primary-blue border border-blue-200">
                                  <Key className="w-3 h-3 mr-1" />
                                  {u.twoFactorCode ? (u.twoFactorCode.startsWith('pbkdf2:') ? '••••••' : u.twoFactorCode) : 'Enabled'}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-semibold text-neutral-900">
                                ${(Number(u.totalBalance) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  type="button"
                                  onClick={() => openStatusModal(u)}
                                  className="hover:opacity-80 transition-opacity"
                                  title="Click to manage account status"
                                >
                                  {getStatusBadge(u.status)}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => openNoticeModal(u)}
                                    className={`p-1.5 rounded transition-colors ${
                                      u.notice?.enabled
                                        ? 'text-accent-red bg-red-100 hover:bg-red-200 ring-1 ring-red-400'
                                        : 'text-neutral-500 hover:text-accent-red hover:bg-neutral-100'
                                    }`}
                                    title={u.notice?.enabled ? "Warning Active (Click to edit/disable)" : "Configure Account Warning Notice"}
                                  >
                                    <AlertTriangle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openStatusModal(u)}
                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                    title="Manage Account Status (Block / Suspend / Activate)"
                                  >
                                    <ShieldAlert className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openEditModal(u)}
                                    className="p-1.5 text-primary-blue hover:bg-blue-50 rounded transition-colors"
                                    title="Edit User & Balance"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleForceLogout(u)}
                                    className="p-1.5 text-amber-700 hover:bg-amber-100 rounded transition-colors"
                                    title="Force Log Out User (Terminate Session)"
                                  >
                                    <LogOut className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                    className="p-1.5 text-accent-red hover:bg-red-50 rounded transition-colors"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View (Visible on Phones below md) */}
                  <div className="md:hidden divide-y divide-neutral-200">
                    {loadingUsers ? (
                      <div className="text-center py-8 text-neutral-500 text-sm">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-8 text-neutral-500 text-sm">No users found matching "{searchQuery}".</div>
                    ) : (
                      filteredUsers.map((u) => (
                        <div key={u.id} className="py-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="w-9 h-9 bg-primary-navy text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-neutral-900 text-sm truncate">{u.name}</div>
                                <div className="text-xs text-neutral-500 truncate">{u.email}</div>
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-2">{getStatusBadge(u.status)}</div>
                          </div>

                          <div className="bg-neutral-50 p-3 rounded-bank border border-neutral-200 text-xs space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-neutral-500">Account:</span>
                              <span className="font-mono font-medium text-neutral-800">
                                {u.primaryAccount ? u.primaryAccount.accountNumber : 'No account'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-neutral-500">Balance:</span>
                              <span className="font-bold text-sm text-neutral-900">
                                ${(Number(u.totalBalance) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-1.5 border-t border-neutral-200">
                              <span className="text-neutral-500">Password / 2FA:</span>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-[11px]">
                                  ••••••••
                                </span>
                                <span className="font-mono font-bold bg-blue-50 text-primary-blue px-1.5 py-0.5 rounded border border-blue-200 text-[11px]">
                                  {u.twoFactorCode ? (u.twoFactorCode.startsWith('pbkdf2:') ? '••••••' : u.twoFactorCode) : 'Enabled'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
                            <button
                              onClick={() => openNoticeModal(u)}
                              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors ${
                                u.notice?.enabled
                                  ? 'bg-red-100 text-accent-red ring-1 ring-red-400'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{u.notice?.enabled ? 'Notice On' : 'Notice'}</span>
                            </button>

                            <button
                              onClick={() => openStatusModal(u)}
                              className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded text-xs font-semibold transition-colors"
                              title="Block / Suspend / Activate"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Status</span>
                            </button>

                            <button
                              onClick={() => openEditModal(u)}
                              className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-50 text-primary-blue hover:bg-blue-100 rounded text-xs font-semibold transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleForceLogout(u)}
                              className="p-1.5 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded transition-colors"
                              title="Force Log Out User"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 bg-red-50 text-accent-red hover:bg-red-100 rounded transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

              </div>
            </main>
          </div>

          {/* ADD USER MODAL */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
              <div className="bg-white rounded-card shadow-bank-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-200 mb-4">
                  <div className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5 text-primary-blue" />
                    <h3 className="text-xl font-bold text-primary-navy">Add New Bank User</h3>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name *</label>
                    <Input
                      required
                      placeholder="e.g. Robert M. Vance"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address (Login Username) *</label>
                    <Input
                      type="email"
                      required
                      placeholder="e.g. robert@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Login Password *</label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. Secure@123"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">6-Digit 2FA Code *</label>
                      <Input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="6-digit security code"
                        value={newUser.twoFactorCode}
                        onChange={(e) => setNewUser({ ...newUser, twoFactorCode: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Initial Balance ($) *</label>
                      <Input
                        type="number"
                        step="0.01"
                        required
                        placeholder="50000.00"
                        value={newUser.initialBalance}
                        onChange={(e) => setNewUser({ ...newUser, initialBalance: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Deposit Date *</label>
                      <Input
                        type="date"
                        required
                        value={newUser.initialDepositDate}
                        onChange={(e) => setNewUser({ ...newUser, initialDepositDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Opening Date *</label>
                      <Input
                        type="date"
                        required
                        value={newUser.createdAt}
                        onChange={(e) => setNewUser({ ...newUser, createdAt: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Account Type</label>
                      <select
                        value={newUser.accountType}
                        onChange={(e) => setNewUser({ ...newUser, accountType: e.target.value })}
                        className="input-field text-sm"
                      >
                        <option value="Checking">Checking</option>
                        <option value="Savings">Savings</option>
                        <option value="Money Market">Money Market</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Account Status</label>
                      <select
                        value={newUser.status || 'active'}
                        onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                        className="input-field text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                        <option value="flagged">Flagged</option>
                        <option value="suspended">Suspended</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                  </div>

                  {/* Dashboard Modules / Pages Permission & Locks */}
                  <div className="pt-2 border-t border-neutral-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-neutral-800">
                          Sidebar Menus & Access Control ({newUser.allowedPages.length}/{ALL_AVAILABLE_PAGES.length} Visible, {newUser.lockedPages?.length || 0} Locked)
                        </label>
                        <p className="text-[11px] text-neutral-500">Check to display on sidebar. Toggle the Lock to restrict user access.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setNewUser({ ...newUser, allowedPages: ALL_MENU_IDS })}
                          className="px-2 py-0.5 rounded bg-blue-50 text-primary-blue hover:bg-blue-100 font-semibold"
                        >
                          Show All
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewUser({ ...newUser, allowedPages: DEFAULT_CORE_MENU_IDS })}
                          className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        >
                          Core Only
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewUser({ ...newUser, lockedPages: ALL_MENU_IDS.filter(p => p !== 'dashboard') })}
                          className="px-2 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100 font-semibold"
                        >
                          Lock All
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewUser({ ...newUser, lockedPages: [] })}
                          className="px-2 py-0.5 rounded bg-green-50 text-green-700 hover:bg-green-100 font-semibold"
                        >
                          Unlock All
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-neutral-50 p-3 rounded-bank border border-neutral-200 max-h-60 overflow-y-auto">
                      {ALL_AVAILABLE_PAGES.map((page) => {
                        const isVisible = newUser.allowedPages.includes(page.id);
                        const isLocked = newUser.lockedPages?.includes(page.id);
                        return (
                          <div
                            key={page.id}
                            className={`flex items-center justify-between p-2 rounded border transition-all ${
                              !isVisible 
                                ? 'bg-neutral-100/70 border-neutral-200 opacity-60' 
                                : isLocked
                                  ? 'bg-amber-50 border-amber-300 shadow-sm'
                                  : 'bg-white border-neutral-200 hover:border-blue-300'
                            }`}
                          >
                            <label className="flex items-center space-x-2 cursor-pointer flex-1 min-w-0 mr-1.5">
                              <input
                                type="checkbox"
                                checked={isVisible}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewUser({ ...newUser, allowedPages: [...newUser.allowedPages, page.id] });
                                  } else {
                                    setNewUser({ ...newUser, allowedPages: newUser.allowedPages.filter((p) => p !== page.id) });
                                  }
                                }}
                                className="rounded text-primary-blue focus:ring-primary-blue h-3.5 w-3.5"
                              />
                              <span className="text-xs font-medium text-neutral-800 truncate">{page.label}</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const currentLocks = newUser.lockedPages || [];
                                const updated = isLocked ? currentLocks.filter(p => p !== page.id) : [...currentLocks, page.id];
                                setNewUser({ ...newUser, lockedPages: updated });
                              }}
                              title={isLocked ? "Unlock service" : "Lock service (user cannot access)"}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition-all ${
                                isLocked
                                  ? 'bg-red-500 text-white shadow-sm hover:bg-red-600'
                                  : 'bg-neutral-200/80 text-neutral-600 hover:bg-neutral-300'
                              }`}
                            >
                              {isLocked ? (
                                <>
                                  <Lock className="w-3 h-3" />
                                  <span>LOCKED</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3 text-neutral-500" />
                                  <span>OPEN</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                    <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={actionLoading}>
                      {actionLoading ? 'Creating User...' : 'Create User & Account'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* EDIT USER MODAL */}
          {showEditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
              <div className="bg-white rounded-card shadow-bank-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-200 mb-4">
                  <div className="flex items-center space-x-2">
                    <Edit className="w-5 h-5 text-primary-blue" />
                    <h3 className="text-xl font-bold text-primary-navy">Edit User & Balance</h3>
                  </div>
                  <button onClick={() => setShowEditModal(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                    <Input
                      required
                      value={editUser.name}
                      onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
                    <Input
                      type="email"
                      required
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Password</label>
                      <Input
                        type="text"
                        placeholder="Enter new password"
                        value={editUser.password}
                        onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">2FA Login Code</label>
                      <Input
                        type="text"
                        maxLength={6}
                        value={editUser.twoFactorCode}
                        onChange={(e) => setEditUser({ ...editUser, twoFactorCode: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Account Balance ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        required
                        value={editUser.balance}
                        onChange={(e) => setEditUser({ ...editUser, balance: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Deposit Date</label>
                      <Input
                        type="date"
                        value={editUser.initialDepositDate}
                        onChange={(e) => setEditUser({ ...editUser, initialDepositDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Opening Date</label>
                      <Input
                        type="date"
                        value={editUser.createdAt}
                        onChange={(e) => setEditUser({ ...editUser, createdAt: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Account Status</label>
                      <select
                        value={editUser.status}
                        onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                        className="input-field text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                        <option value="flagged">Flagged</option>
                        <option value="suspended">Suspended</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                  </div>

                  {/* Dashboard Modules / Pages Permission & Locks */}
                  <div className="pt-2 border-t border-neutral-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-neutral-800">
                          Sidebar Menus & Access Control ({editUser.allowedPages?.length || 0}/{ALL_AVAILABLE_PAGES.length} Visible, {editUser.lockedPages?.length || 0} Locked)
                        </label>
                        <p className="text-[11px] text-neutral-500">Check to display on sidebar. Toggle the Lock to restrict user access.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setEditUser({ ...editUser, allowedPages: ALL_MENU_IDS })}
                          className="px-2 py-0.5 rounded bg-blue-50 text-primary-blue hover:bg-blue-100 font-semibold"
                        >
                          Show All
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditUser({ ...editUser, allowedPages: DEFAULT_CORE_MENU_IDS })}
                          className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        >
                          Core Only
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditUser({ ...editUser, lockedPages: ALL_MENU_IDS.filter(p => p !== 'dashboard') })}
                          className="px-2 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100 font-semibold"
                        >
                          Lock All
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditUser({ ...editUser, lockedPages: [] })}
                          className="px-2 py-0.5 rounded bg-green-50 text-green-700 hover:bg-green-100 font-semibold"
                        >
                          Unlock All
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-neutral-50 p-3 rounded-bank border border-neutral-200 max-h-60 overflow-y-auto">
                      {ALL_AVAILABLE_PAGES.map((page) => {
                        const isVisible = editUser.allowedPages?.includes(page.id);
                        const isLocked = editUser.lockedPages?.includes(page.id);
                        return (
                          <div
                            key={page.id}
                            className={`flex items-center justify-between p-2 rounded border transition-all ${
                              !isVisible 
                                ? 'bg-neutral-100/70 border-neutral-200 opacity-60' 
                                : isLocked
                                  ? 'bg-amber-50 border-amber-300 shadow-sm'
                                  : 'bg-white border-neutral-200 hover:border-blue-300'
                            }`}
                          >
                            <label className="flex items-center space-x-2 cursor-pointer flex-1 min-w-0 mr-1.5">
                              <input
                                type="checkbox"
                                checked={isVisible}
                                onChange={(e) => {
                                  const current = editUser.allowedPages || [];
                                  if (e.target.checked) {
                                    setEditUser({ ...editUser, allowedPages: [...current, page.id] });
                                  } else {
                                    setEditUser({ ...editUser, allowedPages: current.filter((p) => p !== page.id) });
                                  }
                                }}
                                className="rounded text-primary-blue focus:ring-primary-blue h-3.5 w-3.5"
                              />
                              <span className="text-xs font-medium text-neutral-800 truncate">{page.label}</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const currentLocks = editUser.lockedPages || [];
                                const updated = isLocked ? currentLocks.filter(p => p !== page.id) : [...currentLocks, page.id];
                                setEditUser({ ...editUser, lockedPages: updated });
                              }}
                              title={isLocked ? "Unlock service" : "Lock service (user cannot access)"}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition-all ${
                                isLocked
                                  ? 'bg-red-500 text-white shadow-sm hover:bg-red-600'
                                  : 'bg-neutral-200/80 text-neutral-600 hover:bg-neutral-300'
                              }`}
                            >
                              {isLocked ? (
                                <>
                                  <Lock className="w-3 h-3" />
                                  <span>LOCKED</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3 text-neutral-500" />
                                  <span>OPEN</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                    <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={actionLoading}>
                      {actionLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* NOTICE & WARNING RESTRICTION MODAL */}
          {showNoticeModal && noticeUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
              <div className="bg-white rounded-card shadow-bank-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative border-t-4 border-accent-red">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-200 mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-accent-red" />
                    <h3 className="text-xl font-bold text-primary-navy">Account Warning & Restriction</h3>
                  </div>
                  <button onClick={() => setShowNoticeModal(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-neutral-50 p-3 rounded-bank border border-neutral-200 mb-4 text-xs">
                  <div><span className="text-neutral-500">Target User:</span> <span className="font-semibold text-neutral-800">{noticeUser.name} ({noticeUser.email})</span></div>
                  <div className="mt-1 text-neutral-500">
                    When active, this warning will pop up on their dashboard upon login, and completely block access to Transaction History & Transfer Money.
                  </div>
                </div>

                <form onSubmit={handleSaveNotice} className="space-y-4">
                  {/* Master Toggle */}
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-bank">
                    <div>
                      <div className="text-sm font-bold text-red-900">Enable Restriction Warning</div>
                      <div className="text-xs text-red-700">Display warning popup & block Transfer/Transactions</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={noticeForm.enabled}
                        onChange={(e) => setNoticeForm({ ...noticeForm, enabled: e.target.value })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-red"></div>
                    </label>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Warning Notice Message *</label>
                    <textarea
                      rows={4}
                      required
                      value={noticeForm.message}
                      onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })}
                      className="input-field text-sm leading-relaxed"
                      placeholder="Enter warning notice message..."
                    />
                  </div>

                  {/* Progress % and Status Label */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Progress Percentage (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={noticeForm.progress}
                        onChange={(e) => setNoticeForm({ ...noticeForm, progress: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Status Badge Text</label>
                      <Input
                        type="text"
                        value={noticeForm.progressStatus}
                        onChange={(e) => setNoticeForm({ ...noticeForm, progressStatus: e.target.value })}
                        placeholder="e.g. 65% • Failed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Progress Bar Label</label>
                    <Input
                      type="text"
                      value={noticeForm.progressLabel}
                      onChange={(e) => setNoticeForm({ ...noticeForm, progressLabel: e.target.value })}
                      placeholder="e.g. Authorization Progress"
                    />
                  </div>

                  {/* Live Preview of Progress */}
                  <div className="p-3 bg-neutral-50 rounded-bank border border-neutral-200">
                    <div className="text-xs font-semibold text-neutral-600 mb-1.5 flex justify-between">
                      <span>{noticeForm.progressLabel || 'Progress'}</span>
                      <span className="text-accent-red font-bold">{noticeForm.progressStatus || `${noticeForm.progress}%`}</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-red rounded-full transition-all" style={{ width: `${noticeForm.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                    <Button variant="secondary" type="button" onClick={() => setShowNoticeModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={actionLoading}>
                      {actionLoading ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MANAGE STATUS & FORCE LOGOUT MODAL */}
          {showStatusModal && statusUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
              <div className="bg-white rounded-card shadow-bank-lg max-w-md w-full p-6 relative">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-200 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary-navy">Account Status & Session</h3>
                      <p className="text-xs text-neutral-500">{statusUser.name} • {statusUser.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowStatusModal(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveStatus} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-2">Select Account Status</label>
                    <div className="space-y-2">
                      {[
                        {
                          val: 'active',
                          label: 'Active',
                          desc: 'Full access to online banking, dashboard, and wire transfers.',
                          badgeClass: 'bg-green-100 text-green-700 border-green-200',
                          borderActive: 'border-green-500 bg-green-50/50',
                        },
                        {
                          val: 'inactive',
                          label: 'Inactive',
                          desc: 'Account is dormant or inactive. Access restricted until reactivated.',
                          badgeClass: 'bg-neutral-100 text-neutral-600 border-neutral-300',
                          borderActive: 'border-neutral-500 bg-neutral-50/50',
                        },
                        {
                          val: 'pending',
                          label: 'Pending',
                          desc: 'Account verification or approval pending.',
                          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
                          borderActive: 'border-amber-500 bg-amber-50/50',
                        },
                        {
                          val: 'flagged',
                          label: 'Flagged / Restricted',
                          desc: 'Flagged for compliance review with warning notice enabled.',
                          badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
                          borderActive: 'border-rose-500 bg-rose-50/50',
                        },
                        {
                          val: 'suspended',
                          label: 'Suspended',
                          desc: 'Temporarily freeze account. User cannot transact or view portfolio.',
                          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
                          borderActive: 'border-amber-500 bg-amber-50/50',
                        },
                        {
                          val: 'blocked',
                          label: 'Blocked',
                          desc: 'Strict lockout. Access denied and all active sessions are revoked.',
                          badgeClass: 'bg-red-100 text-red-700 border-red-300',
                          borderActive: 'border-red-500 bg-red-50/50',
                        },
                      ].map((s) => (
                        <label
                          key={s.val}
                          className={`flex items-start p-3 rounded-bank border cursor-pointer transition-all ${
                            selectedStatus === s.val ? s.borderActive + ' shadow-sm' : 'border-neutral-200 hover:bg-neutral-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="userStatusRadio"
                            value={s.val}
                            checked={selectedStatus === s.val}
                            onChange={() => setSelectedStatus(s.val)}
                            className="mt-1 text-primary-navy focus:ring-primary-navy"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-neutral-800">{s.label}</span>
                              <span className={`px-2 py-0.2 rounded-full text-[10px] font-semibold uppercase border ${s.badgeClass}`}>
                                {s.val}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">{s.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Force Log Out Action Section */}
                  <div className="p-3 bg-neutral-50 rounded-bank border border-neutral-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-800 flex items-center space-x-1.5">
                        <LogOut className="w-3.5 h-3.5 text-amber-600" />
                        <span>Force Log Out User</span>
                      </div>
                      <p className="text-[11px] text-neutral-500">Terminate all active device sessions immediately.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleForceLogout(statusUser)}
                      className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-xs font-semibold transition-colors"
                    >
                      Log Out Now
                    </button>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                    <Button variant="secondary" type="button" onClick={() => setShowStatusModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={actionLoading}>
                      {actionLoading ? 'Saving...' : 'Apply Status'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
};

export default AdminUsersPage;

export async function getServerSideProps(context) {
  const { req } = context;
  const token = req.cookies?.session_token;
  const { verifySessionToken } = await import('../../lib/security.js');
  const session = token ? await verifySessionToken(token) : null;

  if (!session || session.role !== 'admin') {
    return {
      notFound: true,
    };
  }

  return {
    props: {},
  };
}
