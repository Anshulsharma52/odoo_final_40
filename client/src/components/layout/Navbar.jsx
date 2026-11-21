import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Sun, LogOut, CheckCheck, Menu, X, ShieldCheck, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Sun className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent">
              SunPower
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 block leading-none">
              Solar ERP
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Link to Landing/Home */}
        <Link
          to="/"
          title="Return to Home & Role Selector"
          className="text-xs font-semibold text-slate-500 hover:text-emerald-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden md:inline-flex items-center gap-1"
        >
          <span>Home Page</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Notifications</h4>
                  <span className="text-xs text-slate-400">{unreadCount} unread updates</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications right now
                  </div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        markAsRead(n._id);
                        if (n.link) navigate(n.link);
                        setShowNotifications(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className={`text-xs font-semibold ${!n.read ? 'text-emerald-950 font-bold' : 'text-slate-700'}`}>
                          {n.title}
                        </h5>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full border border-emerald-200 object-cover"
          />
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-slate-800 block leading-tight">
              {user?.name || 'Guest'}
            </span>
            <span className="text-[10px] font-medium text-emerald-600 block">
              {user?.role || 'Guest'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
