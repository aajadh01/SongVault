import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../config/api';
import {
  Users,
  Music,
  Video,
  Image as ImageIcon,
  QrCode,
  Plus,
  ExternalLink,
  Loader2,
  TrendingUp,
  Heart,
  Calendar,
} from 'lucide-react';

export const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [recentSiblings, setRecentSiblings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentSiblings(res.data.recentSiblings || []);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Siblings',
      value: stats?.totalSiblings || 0,
      sub: `${stats?.activeSiblings || 0} active vaults`,
      icon: Users,
      color: 'from-rose-500 to-pink-500',
    },
    {
      title: 'Total Recordings',
      value: stats?.totalRecordings || 0,
      sub: `${stats?.activeRecordings || 0} published songs`,
      icon: Music,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Background Videos',
      value: stats?.totalVideos || 0,
      sub: 'Motion visual tracks',
      icon: Video,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Background Images',
      value: stats?.totalImages || 0,
      sub: 'Atmospheric photo tracks',
      icon: ImageIcon,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'QR License Cards',
      value: stats?.totalQRCodes || 0,
      sub: 'Ready for physical cards',
      icon: QrCode,
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Vault Overview
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor and manage physical sibling license memory vaults.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/siblings/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-medium text-sm shadow-[0_4px_15px_rgba(244,63,94,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sibling</span>
          </Link>
          <Link
            to="/admin/qr"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card hover:bg-white/10 text-slate-200 text-sm font-medium transition-all"
          >
            <QrCode className="w-4 h-4 text-rose-400" />
            <span>Printable QR Cards</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {stat.title}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-sm`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Siblings */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-serif font-bold text-white">Recent Siblings</h2>
          </div>
          <Link
            to="/admin/siblings"
            className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
          >
            <span>View All</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentSiblings.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No siblings added yet. Click "Add Sibling" to create your first vault.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentSiblings.map((sib) => (
              <div
                key={sib._id}
                className="py-3.5 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xs font-mono">
                    {sib.cardId?.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{sib.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>Card ID: {sib.cardId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      sib.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}
                  >
                    {sib.isActive ? 'Active' : 'Inactive'}
                  </span>

                  <Link
                    to={`/admin/siblings/${sib._id}/recordings`}
                    className="px-3 py-1.5 rounded-lg glass-card hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-medium transition-all"
                  >
                    Manage Songs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
