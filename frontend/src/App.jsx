import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { PublicVault } from './pages/PublicVault/PublicVault';
import { AdminLogin } from './pages/AdminLogin/AdminLogin';
import { AdminLayout } from './components/AdminLayout/AdminLayout';
import { DashboardOverview } from './pages/AdminDashboard/DashboardOverview';
import { SiblingList } from './pages/Siblings/SiblingList';
import { SiblingForm } from './pages/SiblingEditor/SiblingForm';
import { RecordingManager } from './pages/RecordingEditor/RecordingManager';
import { QRManager } from './pages/QRManagement/QRManager';
import { Heart, QrCode, Lock, Shield, Sparkles } from 'lucide-react';

// Protected Route Guard for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] flex items-center justify-center text-rose-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Home Landing Page (for direct root visits)
const HomeLanding = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0e] text-white flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)]">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-serif font-bold text-xl tracking-wide">Sibling Vault</span>
        </div>

        <Link
          to="/admin/login"
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all"
        >
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span>Admin Portal</span>
        </Link>
      </header>

      {/* Hero */}
      <main className="max-w-2xl mx-auto text-center my-auto py-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold tracking-widest uppercase mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Physical License Card Experience</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-white mb-6 leading-tight">
          Where Memories Live in Song.
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-lg mx-auto leading-relaxed mb-8">
          A private digital sanctuary paired with physical Sibling Cards. Scan your QR code and enter your secret key to unlock your personal vault.
        </p>

        {/* Quick Demo Links */}
        <div className="glass-panel-glow rounded-3xl p-6 border border-white/10 max-w-md mx-auto text-left shadow-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            <span>Sample Vault Cards to Test</span>
          </div>

          <div className="space-y-2.5">
            <Link
              to="/s/THR7X9"
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 transition-all group"
            >
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-rose-300">
                  Thrailokya (3 Songs: Video + Photo BG)
                </div>
                <div className="text-xs text-slate-400 font-mono">Code: 060705 • Case C</div>
              </div>
              <span className="text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              to="/s/SIB1S1"
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 transition-all group"
            >
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-rose-300">
                  Aajadh (1 Song: Direct Player Flow)
                </div>
                <div className="text-xs text-slate-400 font-mono">Code: 112233 • Case B</div>
              </div>
              <span className="text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              to="/s/MEM0S0"
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 transition-all group"
            >
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-rose-300">
                  Little Star (0 Songs: Empty State)
                </div>
                <div className="text-xs text-slate-400 font-mono">Code: 998877 • Case A</div>
              </div>
              <span className="text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-white/5 max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Sibling Memory Vault • Production Full-Stack Application</span>
        <span className="font-mono">End-to-End Encrypted Card Access</span>
      </footer>
    </div>
  );
};

export const App = () => {
  return (
    <Routes>
      {/* Root Landing */}
      <Route path="/" element={<HomeLanding />} />

      {/* Public Sibling Vault URL (Scanned from QR code) */}
      <Route path="/s/:cardId" element={<PublicVault />} />

      {/* Admin Authentication */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Console */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="siblings" element={<SiblingList />} />
        <Route path="siblings/new" element={<SiblingForm />} />
        <Route path="siblings/:id/edit" element={<SiblingForm />} />
        <Route path="siblings/:id/recordings" element={<RecordingManager />} />
        <Route path="qr" element={<QRManager />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
