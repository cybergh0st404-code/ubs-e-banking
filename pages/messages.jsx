'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Mail, 
  Inbox, 
  Send, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Clock, 
  User, 
  Building,
  AlertTriangle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../utils/AuthContext';

const MessagesPage = () => {
  const router = useRouter();
  const { user, accountCache, logout, updateUser, updateAccountCache, loading: authLoading } = useAuth();

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [notice, setNotice] = useState(accountCache?.notice || user?.notice || null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, router, authLoading]);

  useEffect(() => {
    if (accountCache?.notice && !notice) {
      setNotice(accountCache.notice);
    }
  }, [accountCache?.notice]);

  useEffect(() => {
    if (!user?.id && !user?.email) return;
    let isMounted = true;
    const fetchAccountData = async () => {
      try {
        const query = user.id ? `?userId=${user.id}&email=${encodeURIComponent(user.email || '')}` : '';
        const res = await fetch(`/api/user/account-data${query}`);
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          if (data.notice) {
            setNotice(data.notice);
            const rawHistory =
              Array.isArray(data.notice.messages) && data.notice.messages.length > 0
                ? data.notice.messages
                : (data.notice.sendAsMessage || data.notice.enabled) && data.notice.message
                ? [data.notice]
                : [];
            // If URL has ?open=notice and notice is sent as message or enabled, open the latest notice automatically
            if (
              typeof window !== 'undefined' &&
              new URLSearchParams(window.location.search).get('open') === 'notice' &&
              rawHistory.length > 0
            ) {
              const latest = rawHistory[0];
              setSelectedMessage({
                id: latest.id || 'msg-admin-notice-0',
                sender: latest.sender || 'UBS Wealth Management & Compliance',
                subject: latest.subject || latest.progressLabel || 'Official Account & Compliance Notice',
                preview: latest.message || '',
                date: latest.sentDate || 'Today',
                time: latest.sentTime || 'Priority',
                unread: true,
                isPriorityNotice: true,
                category: latest.category || 'Notices',
                body: latest.message || '',
                progress: latest.progress,
                progressStatus: latest.progressStatus,
                progressLabel: latest.progressLabel,
                showProgress: Boolean(latest.enabled ?? data.notice.enabled),
              });
            }
          }

          if (updateAccountCache && data) {
            updateAccountCache({
              totalBalance: data.totalBalance !== undefined ? Number(data.totalBalance) || 0 : undefined,
              allowedPages: data.allowedPages || undefined,
              lockedPages: data.lockedPages || undefined,
              notice: data.notice || null,
              accountStatus: (data.user?.status || 'active').toLowerCase(),
              transactions: data.transactions || [],
            });
          }

          if (updateUser && data) {
            updateUser({
              totalBalance: data.totalBalance !== undefined ? Number(data.totalBalance) || 0 : user.totalBalance,
              allowedPages: data.allowedPages || user.allowedPages,
              lockedPages: data.lockedPages || user.lockedPages,
              notice: data.notice || user.notice,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching account data:', err);
      }
    };
    fetchAccountData();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email]);

  const baseMessages = [
    {
      id: 'msg-1',
      sender: 'UBS Executive Client Care',
      subject: 'Welcome to your Preferred Online Banking Portal',
      preview: 'We are pleased to confirm your high-balance online banking enrollment...',
      date: 'Sep 01, 2026',
      time: '09:00 AM',
      unread: false,
      category: 'Notices',
      body: `Dear Valued Client,\n\nWelcome to your customized UBS Global Wealth Management online banking portal. Your accounts and linked card facilities are now active and provisioned.\n\nAs a preferred account holder, you have direct access to your relationship manager, wire transfers, e-statements, and our 24/7 security monitoring team.\n\nThank you for banking with UBS.\n\nSincerely,\nExecutive Client Care Division\nUBS Global Wealth Management`
    },
    {
      id: 'msg-2',
      sender: 'Fraud & Security Operations',
      subject: 'Security Notice: New Sign-In Verification',
      preview: 'Your recent sign-in was verified using Two-Factor Authentication...',
      date: 'Aug 29, 2026',
      time: '04:15 PM',
      unread: false,
      category: 'Security',
      body: `Dear Client,\n\nThis is an automated confirmation that a secure login session was initiated and verified on your account using your multi-factor authentication code.\n\nDevice: Verified Web Browser\nLocation: Encrypted Session\n\nIf you authorized this session, no further action is required. If you did not initiate this sign-in, please immediately contact our security operations department.\n\nSecurity Operations Center\nUBS`
    },
    {
      id: 'msg-3',
      sender: 'Treasury & Wire Division',
      subject: 'Scheduled Wire & Settlement Processing Hours',
      preview: 'Please note the upcoming international and domestic wire processing windows...',
      date: 'Aug 15, 2026',
      time: '11:30 AM',
      unread: false,
      category: 'Notices',
      body: `Dear Account Holder,\n\nPlease be reminded that domestic wire submissions are processed continuously on banking business days between 8:00 AM and 5:00 PM.\n\nFor international wire transfers, beneficiary crediting typically takes 1 to 2 business days depending on the destination institution's SWIFT clearing timezone.\n\nTreasury Services\nUBS`
    },
  ];

  const rawNoticeHistory =
    notice && Array.isArray(notice.messages) && notice.messages.length > 0
      ? notice.messages
      : notice && (notice.sendAsMessage || notice.enabled) && notice.message
      ? [notice]
      : [];

  const adminNoticeMessages = rawNoticeHistory.map((nItem, idx) => ({
    id: nItem.id || `msg-admin-notice-${idx}`,
    sender: nItem.sender || 'UBS Wealth Management & Compliance',
    subject: nItem.subject || nItem.progressLabel || 'Official Account & Compliance Notice',
    preview: nItem.message || '',
    date: nItem.sentDate || 'Today',
    time: nItem.sentTime || 'Priority',
    unread: true,
    isPriorityNotice: true,
    category: nItem.category || 'Notices',
    body: nItem.message || '',
    progress: nItem.progress,
    progressStatus: nItem.progressStatus,
    progressLabel: nItem.progressLabel,
    showProgress: Boolean(nItem.enabled ?? notice?.enabled),
  }));

  const adminNoticeMessage = adminNoticeMessages[0] || null;
  const messages = [...adminNoticeMessages, ...baseMessages];

  const filtered = activeFilter === 'all'
    ? messages
    : messages.filter((m) => m.category.toLowerCase() === activeFilter.toLowerCase());

  const noticesCount = messages.filter((m) => m.category.toLowerCase() === 'notices').length;
  const securityCount = messages.filter((m) => m.category.toLowerCase() === 'security').length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar user={user} onLogout={logout} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-primary-navy mb-1">Secure Message Center</h1>
              <p className="text-neutral-600 text-sm">Official encrypted correspondence, compliance notices, and customer care alerts.</p>
            </div>

            {/* If restriction banner is also active, show a compact alert banner at the top while keeping the Inbox accessible */}
            {notice && notice.enabled && (
              <div
                onClick={() => adminNoticeMessage && setSelectedMessage(adminNoticeMessage)}
                className="cursor-pointer p-4 rounded-card bg-red-50 border border-red-200 flex items-start space-x-3 shadow-sm hover:bg-red-100/70 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-accent-red flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-red-900 uppercase tracking-wide">
                      {notice.subject || notice.progressLabel || 'Action Required: Account Restriction Notice'}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-accent-red border border-red-300">
                      {notice.progressStatus || `${notice.progress || 65}%`}
                    </span>
                  </div>
                  <p className="text-xs text-red-800 mt-1 line-clamp-2">{notice.message}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Sidebar Filter */}
              <div className="lg:col-span-3">
                <Card className="p-3">
                  <nav className="space-y-1">
                    <button
                      onClick={() => setActiveFilter('all')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-bank text-xs font-semibold transition-colors ${
                        activeFilter === 'all'
                          ? 'bg-primary-blue text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Inbox className="w-4 h-4" />
                        <span>All Messages</span>
                      </div>
                      <span className="text-[10px] bg-white bg-opacity-20 px-1.5 py-0.5 rounded">
                        {messages.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveFilter('notices')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-bank text-xs font-semibold transition-colors ${
                        activeFilter === 'notices'
                          ? 'bg-primary-blue text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4" />
                        <span>Official Notices</span>
                      </div>
                      <span className="text-[10px] opacity-80">{noticesCount}</span>
                    </button>

                    <button
                      onClick={() => setActiveFilter('security')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-bank text-xs font-semibold transition-colors ${
                        activeFilter === 'security'
                          ? 'bg-primary-blue text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Security Alerts</span>
                      </div>
                      <span className="text-[10px] opacity-80">{securityCount}</span>
                    </button>
                  </nav>
                </Card>
              </div>

              {/* Messages List */}
              <div className="lg:col-span-9">
                <Card title={`Inbox (${filtered.length})`} subtitle="Encrypted banking communications">
                  <div className="divide-y divide-neutral-200">
                    {filtered.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => setSelectedMessage(msg)}
                        className={`py-4 px-3 rounded-bank cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          msg.isPriorityNotice
                            ? 'bg-blue-50/70 hover:bg-blue-100/70 border-l-4 border-primary-blue my-1'
                            : 'hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            msg.isPriorityNotice
                              ? 'bg-primary-blue text-white shadow-sm'
                              : 'bg-blue-100 text-primary-blue'
                          }`}>
                            {msg.isPriorityNotice ? <AlertCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-neutral-900">{msg.sender}</span>
                              {msg.isPriorityNotice && (
                                <span className="text-[10px] bg-accent-red text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  New Notice
                                </span>
                              )}
                              <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-semibold">
                                {msg.category}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-neutral-800 mt-0.5">{msg.subject}</div>
                            <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{msg.preview}</p>
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-neutral-500 whitespace-nowrap sm:pl-4 font-medium">
                          <div>{msg.date}</div>
                          <div>{msg.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

            </div>

            {/* Message Modal Reader */}
            {selectedMessage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
                <div className="bg-white rounded-card shadow-bank-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
                  
                  {/* Modal Header */}
                  <div className="flex justify-between items-start pb-4 border-b border-neutral-200 mb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-primary-blue px-2 py-0.5 rounded">
                          {selectedMessage.category}
                        </span>
                        {selectedMessage.isPriorityNotice && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-accent-red px-2 py-0.5 rounded">
                            Official Account Notice
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-primary-navy mt-1.5">{selectedMessage.subject}</h3>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        From: <strong className="text-neutral-800">{selectedMessage.sender}</strong> • {selectedMessage.date} {selectedMessage.time ? `at ${selectedMessage.time}` : ''}
                      </div>
                    </div>
                    <button onClick={() => setSelectedMessage(null)} className="text-neutral-400 hover:text-neutral-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="text-sm text-neutral-800 whitespace-pre-line leading-relaxed bg-neutral-50 p-4 rounded-bank border border-neutral-200 mb-5 font-sans">
                    {selectedMessage.body}
                  </div>

                  {selectedMessage.showProgress && (
                    <div className="p-3.5 bg-red-50/70 rounded-bank border border-red-200 mb-5">
                      <div className="text-xs font-semibold text-neutral-700 mb-1.5 flex justify-between">
                        <span>{selectedMessage.progressLabel || 'Authorization Progress'}</span>
                        <span className="text-accent-red font-bold">{selectedMessage.progressStatus || `${selectedMessage.progress || 65}%`}</span>
                      </div>
                      <div className="w-full h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-red rounded-full transition-all" style={{ width: `${selectedMessage.progress || 65}%` }}></div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-200">
                    <Button variant="secondary" onClick={() => setSelectedMessage(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;
