import React, { useState } from 'react';
import { Bell, User, Menu, X, ChevronDown, LogOut, Settings, AlertCircle, Mail } from 'lucide-react';
import { useRouter } from 'next/router';

const Navbar = ({ user, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const isRegAdmin = user?.role === 'admin';
    if (onLogout) {
      await onLogout();
    }
    router.replace(isRegAdmin ? '/admin/login' : '/login');
  };

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggle-bank-sidebar'));
    }
  };

  const noticeMessagesList =
    user?.notice && Array.isArray(user.notice.messages) && user.notice.messages.length > 0
      ? user.notice.messages
      : user?.notice && (user.notice.sendAsMessage || user.notice.enabled) && user.notice.message
      ? [user.notice]
      : [];
  const hasNoticeMessage = noticeMessagesList.length > 0;

  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left: Mobile Menu Hamburger + Brand Logo */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
              onClick={handleToggleSidebar}
              className="lg:hidden p-2 rounded-bank text-neutral-600 hover:text-primary-navy hover:bg-neutral-100 transition-colors focus:outline-none"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-shrink-0 flex items-center space-x-2">
              <img
                src="/ubslogo.png"
                alt="UBS"
                className="h-7 sm:h-8 w-auto flex-shrink-0 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="h-5 w-px bg-neutral-300"></span>
              <div className="text-primary-navy font-bold text-sm sm:text-base md:text-lg tracking-tight leading-none">
                E-Banking
              </div>
            </div>
          </div>

          {/* Right side: Notifications & Profile Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 text-neutral-600 hover:text-primary-blue hover:bg-accent-soft rounded-full transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent-red rounded-full ${hasNoticeMessage ? 'animate-ping' : ''}`}></span>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent-red rounded-full"></span>
              </button>

              {showNotifMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-card shadow-bank-lg border border-neutral-200 py-2 z-20 animate-fade-in">
                    <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-primary-navy uppercase tracking-wider">Notifications & Messages</span>
                      <span className="text-[10px] font-semibold bg-blue-50 text-primary-blue px-2 py-0.5 rounded-full">
                        {`${1 + noticeMessagesList.length} ${1 + noticeMessagesList.length === 1 ? 'Alert' : 'Alerts'}`}
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                      {noticeMessagesList.map((nMsg, idx) => (
                        <div
                          key={nMsg.id || `nav-notice-${idx}`}
                          onClick={() => {
                            setShowNotifMenu(false);
                            router.push('/messages?open=notice');
                          }}
                          className="p-3.5 bg-blue-50/60 hover:bg-blue-100/60 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-red text-white px-2 py-0.5 rounded-full">
                              {idx === 0 ? 'New Notice' : 'Notice'}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              {nMsg.sentDate || 'Today'} {nMsg.sentTime ? `• ${nMsg.sentTime}` : ''}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-primary-navy">
                            {nMsg.subject || nMsg.progressLabel || 'Official Account & Compliance Notice'}
                          </div>
                          <p className="text-xs text-neutral-600 line-clamp-2 mt-0.5">
                            {nMsg.message}
                          </p>
                        </div>
                      ))}

                      <div
                        onClick={() => {
                          setShowNotifMenu(false);
                          router.push('/messages');
                        }}
                        className="p-3.5 hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <div className="text-xs font-semibold text-neutral-800">Welcome to your Preferred Online Banking Portal</div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">
                          Your accounts and security monitoring facilities are active.
                        </p>
                      </div>
                    </div>

                    <div className="px-3 pt-2 pb-1 border-t border-neutral-100">
                      <button
                        onClick={() => {
                          setShowNotifMenu(false);
                          router.push('/messages');
                        }}
                        className="w-full py-1.5 text-xs font-semibold text-primary-blue hover:bg-blue-50 rounded-bank transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Open Secure Message Center</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifMenu(false);
                }}
                className="flex items-center space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-neutral-700 hover:bg-accent-soft rounded-bank transition-colors"
              >
                <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:block font-medium text-sm text-neutral-800 max-w-[120px] truncate">
                  {user?.name || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowProfileMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-card shadow-bank-lg border border-neutral-200 py-1.5 z-20 animate-fade-in">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-xs font-semibold text-neutral-800 truncate">{user?.name || 'User'}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{user?.email || ''}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-xs sm:text-sm text-accent-red hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2 text-accent-red" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
