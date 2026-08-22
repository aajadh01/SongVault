import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Music,
  QrCode,
  LogOut,
  Menu,
  X,
  Heart,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/siblings', label: 'Siblings', icon: Users },
    { to: '/admin/qr', label: 'QR Codes & Cards', icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0e] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#12121a] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
          <span className="font-serif font-bold text-white tracking-wide">Sibling Vault</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#12121a] border-r border-white/10 flex flex-col justify-between p-5 z-50 transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-white text-base tracking-wide leading-none">
                Sibling Vault
              </h1>
              <span className="text-[11px] text-rose-400 font-medium tracking-wider uppercase">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/10 text-rose-300 border border-rose-500/30 shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-rose-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {admin?.name || 'Vault Admin'}
              </div>
              <div className="text-[10px] text-slate-400 truncate font-mono">
                {admin?.email || 'admin@siblingvault.com'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-medium transition-all border border-white/5 hover:border-rose-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
