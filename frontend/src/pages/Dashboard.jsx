import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Wallet, Building2, Smartphone, Plus, RefreshCw, Send, History, Shield, TrendingUp, IndianRupee, ArrowUpRight } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import LoadingScreen from '../components/LoadingScreen';
import LinkBankModal from '../components/LinkBankModal';
import CreateUpiModal from '../components/CreateUpiModal';
import SendMoneyModal from '../components/SendMoneyModal';

// Animated Counter Hook
function useAnimatedCounter(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0 || target === undefined) { setValue(0); return; }
    const start = 0;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return value;
}

export default function Dashboard() {
  const { user, logout, loading } = useContext(AuthContext);
  const toast = useToast();
  
  const [bankAccounts, setBankAccounts] = useState([]);
  const [upiAccounts, setUpiAccounts] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  
  const [isLinkBankOpen, setIsLinkBankOpen] = useState(false);
  const [isCreateUpiOpen, setIsCreateUpiOpen] = useState(false);
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    try {
      const [bankRes, upiRes] = await Promise.all([
        api.get('/accounts/bank'),
        api.get('/accounts/upi')
      ]);
      setBankAccounts(bankRes.data);
      setUpiAccounts(upiRes.data);
    } catch (error) {
      console.error('Failed to fetch account data:', error);
      toast.error('Failed to fetch account data');
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Compute total balance for animated counter
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const animatedBalance = useAnimatedCounter(totalBalance, 1200);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Get current greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen text-slate-100 font-sans">
      {/* Navbar */}
      <nav className="glass-nav sticky top-0 z-15 backdrop-blur-xl animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-110 transition-transform duration-300 cursor-pointer">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">UPI Simulator</span>
            </div>
            <div className="flex items-center gap-4">
              {user.roles && user.roles.includes('ADMIN') && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-600/40 border border-indigo-500/30 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-950/20 hover:shadow-indigo-500/20 group"
                >
                  <Shield className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
                  <span>Admin Panel</span>
                </Link>
              )}
              <div className="flex items-center gap-2 text-slate-300 bg-slate-950/50 border border-white/5 px-4 py-1.5 rounded-full text-sm font-medium hover:border-indigo-500/20 transition-all cursor-default">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{user.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                {user.name}
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors text-sm font-medium cursor-pointer group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10 animate-slide-up">
          <div>
            <p className="text-sm text-slate-400 mb-1">{greeting} 👋</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Welcome, <span className="gradient-text">{user.name}</span>
            </h1>
            <p className="text-slate-400 mt-1.5 text-sm">Monitor your connected bank vaults and virtual payment addresses.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSendMoneyOpen(true)}
              disabled={upiAccounts.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/45 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group ripple"
            >
              <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> Send Money
            </button>
            <Link 
              to="/transactions"
              className="flex items-center gap-2 bg-slate-950/40 hover:bg-slate-950/70 text-slate-300 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:border-indigo-500/20 group"
            >
              <History className="w-4 h-4 group-hover:rotate-[-15deg] transition-transform" /> History
            </Link>
            <button 
              onClick={fetchData}
              disabled={isFetching}
              className="p-2.5 text-slate-400 hover:text-white bg-slate-950/30 hover:bg-slate-950/60 border border-white/5 rounded-xl transition-all disabled:animate-spin cursor-pointer hover:border-indigo-500/20"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 stagger-children">
          <div className="glass-interactive p-5 rounded-2xl flex items-center gap-4 group">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <IndianRupee className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Balance</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">
                ₹{animatedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="glass-interactive p-5 rounded-2xl flex items-center gap-4 group">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bank Accounts</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">{bankAccounts.length}</p>
            </div>
          </div>
          <div className="glass-interactive p-5 rounded-2xl flex items-center gap-4 group">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">UPI Addresses</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">{upiAccounts.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bank Accounts Section */}
          <div className="glass p-6 rounded-2xl border border-white/5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Linked Bank Accounts
              </h2>
              <span className="text-xs text-slate-500 bg-slate-950/30 px-3 py-1 rounded-full border border-white/5">
                {bankAccounts.length} linked
              </span>
            </div>
            
            {isFetching ? (
              <div className="space-y-4">
                <div className="h-20 skeleton" />
                <div className="h-20 skeleton" />
              </div>
            ) : bankAccounts.length > 0 ? (
              <div className="space-y-4 mb-6 stagger-children">
                {bankAccounts.map(acc => (
                  <div key={acc.id} className="p-4 rounded-xl bg-slate-950/30 border border-white/5 flex justify-between items-center group hover:border-indigo-500/30 hover:bg-slate-950/50 transition-all duration-300 cursor-default">
                    <div>
                      <p className="font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                        {acc.bankName}
                        <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-1">IFSC: {acc.ifsc} • Account: XXXX{acc.accountNumber.slice(-4)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-0.5">Available Balance</p>
                      <p className="font-extrabold text-indigo-400 text-lg">₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-sm mb-6 text-center py-8 border border-white/5 border-dashed rounded-xl">
                <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-slate-400 font-medium">No bank accounts linked yet.</p>
                <p className="text-xs text-slate-500 mt-1">Connect a mock bank vault to start generating UPI addresses.</p>
              </div>
            )}

            <button 
              onClick={() => setIsLinkBankOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 py-3.5 rounded-xl text-sm font-semibold transition-all border border-indigo-500/20 border-dashed hover:border-indigo-500/40 cursor-pointer group ripple"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> Link New Bank Account
            </button>
          </div>

          {/* UPI IDs Section */}
          <div className="glass p-6 rounded-2xl border border-white/5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
             <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-purple-400" />
                Your UPI VPAs
              </h2>
              <span className="text-xs text-slate-500 bg-slate-950/30 px-3 py-1 rounded-full border border-white/5">
                {upiAccounts.length} active
              </span>
            </div>

            {isFetching ? (
              <div className="space-y-4">
                <div className="h-20 skeleton" />
              </div>
            ) : upiAccounts.length > 0 ? (
              <div className="space-y-4 mb-6 stagger-children">
                {upiAccounts.map(upi => {
                  const linkedBank = bankAccounts.find(b => b.id === upi.bankAccountId);
                  return (
                    <div key={upi.id} className="p-4 rounded-xl bg-slate-950/30 border border-white/5 flex justify-between items-center group hover:border-purple-500/30 hover:bg-slate-950/50 transition-all duration-300 cursor-default">
                      <div>
                        <p className="font-extrabold text-white tracking-wide group-hover:text-purple-300 transition-colors font-mono">{upi.upiId}</p>
                        <p className="text-xs text-slate-400 mt-1">Linked Bank: {linkedBank ? `${linkedBank.bankName} (XXXX${linkedBank.accountNumber.slice(-4)})` : 'Unknown Bank'}</p>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform" title="Active">
                        <div className="relative">
                          <div className="h-3 w-3 rounded-full bg-emerald-400" />
                          <div className="absolute inset-0 h-3 w-3 rounded-full bg-emerald-400 animate-ping opacity-50" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-slate-500 text-sm mb-6 text-center py-8 border border-white/5 border-dashed rounded-xl">
                <Smartphone className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-slate-400 font-medium">No UPI IDs created yet.</p>
                <p className="text-xs text-slate-500 mt-1">Create a unique virtual address tied to your connected bank account.</p>
              </div>
            )}

            <button 
              onClick={() => setIsCreateUpiOpen(true)}
              disabled={bankAccounts.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 py-3.5 rounded-xl text-sm font-semibold transition-all border border-purple-500/20 border-dashed hover:border-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group ripple"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> Create New UPI ID
            </button>
            {bankAccounts.length === 0 && (
                <p className="text-xs text-center text-slate-500 mt-2.5">Link a bank account first to create a UPI address</p>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <LinkBankModal 
        isOpen={isLinkBankOpen} 
        onClose={() => setIsLinkBankOpen(false)} 
        onSuccess={() => {
          setIsLinkBankOpen(false);
          fetchData();
          toast.success('Bank account linked successfully!');
        }}
      />
      
      <CreateUpiModal 
        isOpen={isCreateUpiOpen} 
        onClose={() => setIsCreateUpiOpen(false)} 
        bankAccounts={bankAccounts}
        onSuccess={() => {
          setIsCreateUpiOpen(false);
          fetchData();
          toast.success('UPI ID created successfully!');
        }}
      />

      <SendMoneyModal 
        isOpen={isSendMoneyOpen} 
        onClose={() => setIsSendMoneyOpen(false)} 
        upiAccounts={upiAccounts}
        onSuccess={() => {
          setIsSendMoneyOpen(false);
          fetchData();
          toast.success('Transaction completed successfully! 🎉');
        }}
      />

    </div>
  );
}
