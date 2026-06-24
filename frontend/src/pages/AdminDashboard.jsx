import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  ArrowLeft, Users, Activity, Settings, ShieldAlert, ShieldCheck, 
  RefreshCw, Ban, CheckCircle, Search, DollarSign, Percent, Shield,
  TrendingUp, Zap, AlertTriangle, Save
} from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import LoadingScreen from '../components/LoadingScreen';

// Animated Counter Hook
function useAnimatedCounter(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0 || target === undefined || target === null) { setValue(0); return; }
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return value;
}

export default function AdminDashboard() {
  const { user, loading } = useContext(AuthContext);
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [maxLimitInput, setMaxLimitInput] = useState('');
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isFetching, setIsFetching] = useState(true);
  const [txSearch, setTxSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const fetchAdminData = useCallback(async () => {
    setIsFetching(true);
    try {
      const [statsRes, usersRes, txRes, configRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/transactions'),
        api.get('/admin/configs')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setTransactions(txRes.data);
      setConfigs(configRes.data);

      const limit = configRes.data.find(c => c.configKey === 'max_transaction_limit');
      if (limit) {
        setMaxLimitInput(limit.configValue);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Error fetching administration data. Make sure you are authorized.');
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.roles && user.roles.includes('ADMIN')) {
      fetchAdminData();
    }
  }, [user, fetchAdminData]);

  if (loading) return <LoadingScreen message="Loading admin console..." />;
  if (!user) return <Navigate to="/login" />;
  if (!user.roles || !user.roles.includes('ADMIN')) return <Navigate to="/dashboard" />;

  const handleToggleBlock = async (userId) => {
    const targetUser = users.find(u => u.id === userId);
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-block`);
      toast.success(res.data.message);
      
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? { ...u, blocked: !u.blocked } : u)
      );
      
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to toggle block status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user block status.');
    }
  };

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    if (!maxLimitInput || isNaN(maxLimitInput) || Number(maxLimitInput) <= 0) {
      toast.warning('Please enter a valid positive number for the limit.');
      return;
    }
    try {
      const res = await api.put('/admin/configs', {
        max_transaction_limit: maxLimitInput
      });
      toast.success(res.data.message);
      
      setConfigs(prev => 
        prev.map(c => c.configKey === 'max_transaction_limit' ? { ...c, configValue: maxLimitInput } : c)
      );
      
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to update config:', error);
      toast.error('Failed to update transaction limit configuration.');
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.senderUpi.toLowerCase().includes(txSearch.toLowerCase()) ||
    tx.receiverUpi.toLowerCase().includes(txSearch.toLowerCase()) ||
    tx.referenceNumber.toLowerCase().includes(txSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Animated stats
  const animTotalUsers = useAnimatedCounter(stats?.totalUsers, 600);
  const animSuccessRate = useAnimatedCounter(stats ? Math.round(stats.successRate * 10) : 0, 800);

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: Activity },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'transactions', label: 'Global Transactions', icon: DollarSign },
    { id: 'settings', label: 'Configurations', icon: Settings },
  ];

  return (
    <div className="min-h-screen text-slate-100 font-sans">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-15 backdrop-blur-xl animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="p-2.5 bg-slate-950/45 hover:bg-slate-950/80 border border-white/10 rounded-full shadow-sm transition-all hover:border-indigo-500/20 group">
                <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-white text-lg tracking-tight">Admin Console</span>
              </div>
            </div>
            <button
              onClick={fetchAdminData}
              disabled={isFetching}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white bg-slate-950/30 hover:bg-slate-950/60 border border-white/5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer hover:border-indigo-500/20 group"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : 'group-hover:rotate-90 transition-transform'}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Tab Switcher */}
        <div className="flex border-b border-white/5 mb-8 overflow-x-auto animate-slide-up">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-6 font-semibold text-sm border-b-2 whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer relative ${
                  activeTab === tab.id 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-400 hover:text-white hover:border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
              <div className="glass-interactive p-6 rounded-2xl flex items-center gap-4 group">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Users</p>
                  <p className="text-2xl font-extrabold text-white mt-0.5">{animTotalUsers}</p>
                </div>
              </div>

              <div className="glass-interactive p-6 rounded-2xl flex items-center gap-4 group">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Volume</p>
                  <p className="text-2xl font-extrabold text-white mt-0.5">
                    ₹{stats?.totalTransactionVolume?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) ?? '...'}
                  </p>
                </div>
              </div>

              <div className="glass-interactive p-6 rounded-2xl flex items-center gap-4 group">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Percent className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Success Rate</p>
                  <p className="text-2xl font-extrabold text-white mt-0.5">
                    {stats ? `${(animSuccessRate / 10).toFixed(1)}%` : '...'}
                  </p>
                </div>
              </div>

              <div className="glass-interactive p-6 rounded-2xl flex items-center gap-4 group">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tx Max Limit</p>
                  <p className="text-2xl font-extrabold text-white mt-0.5">
                    ₹{stats?.activeLimit?.toLocaleString('en-IN') ?? '...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass p-6 rounded-2xl border border-white/5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Transaction Summary
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl hover:bg-slate-950/30 transition-colors">
                    <span className="text-slate-400 text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Total Transactions
                    </span>
                    <span className="font-bold text-white text-lg">{stats?.totalTransactionCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl hover:bg-emerald-500/5 transition-colors">
                    <span className="text-emerald-400 text-sm font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Successful
                    </span>
                    <span className="font-extrabold text-emerald-400 text-lg">{stats?.successfulTransactions ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl hover:bg-rose-500/5 transition-colors">
                    <span className="text-rose-400 text-sm font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Failed
                    </span>
                    <span className="font-extrabold text-rose-400 text-lg">{stats?.failedTransactions ?? 0}</span>
                  </div>
                </div>

                {/* Visual Success Rate Bar */}
                {stats && stats.totalTransactionCount > 0 && (
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400">Success Rate</span>
                      <span className="text-indigo-400 font-bold">{stats.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-1000"
                        style={{ width: `${stats.successRate}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between animate-slide-up" style={{ animationDelay: '0.25s' }}>
                <div>
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Quick Actions
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">Navigate to management panels from here.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setActiveTab('users')} 
                    className="p-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-bold text-center transition-all cursor-pointer group ripple"
                  >
                    <Users className="w-5 h-5 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    Manage Users
                  </button>
                  <button 
                    onClick={() => setActiveTab('transactions')} 
                    className="p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold text-center transition-all cursor-pointer group ripple"
                  >
                    <DollarSign className="w-5 h-5 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    View Ledger
                  </button>
                  <button 
                    onClick={() => setActiveTab('settings')} 
                    className="p-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold text-center transition-all cursor-pointer group ripple col-span-2"
                  >
                    <Settings className="w-5 h-5 mx-auto mb-2 group-hover:rotate-90 transition-transform" />
                    Adjust Payment Limits
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass rounded-2xl border border-white/5 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Simulator Users</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {users.length} users registered • {users.filter(u => u.blocked).length} blocked
                </p>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 input-focus text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/30 border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Name / Email</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Banks Linked</th>
                    <th className="py-3.5 px-6">UPI IDs Created</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">No users found matching search criteria.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, index) => (
                      <tr 
                        key={u.id} 
                        className="hover:bg-slate-950/40 transition-colors"
                        style={{ animation: `slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.04}s forwards`, opacity: 0 }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-indigo-300">{u.name?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-bold text-white">{u.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800/40 text-slate-300 border border-white/5'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-300 font-medium">{u.bankAccountsCount}</td>
                        <td className="py-4 px-6 text-slate-300 font-medium">{u.upiAccountsCount}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.blocked 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {u.blocked ? (
                              <>
                                <ShieldAlert className="w-3.5 h-3.5" /> Blocked
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5" /> Active
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {u.role === 'ADMIN' ? (
                            <span className="text-xs text-slate-500 italic flex items-center gap-1 justify-end">
                              <Shield className="w-3 h-3" /> Protected
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleBlock(u.id)}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                u.blocked
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40'
                                  : 'bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 hover:border-rose-500/40'
                              }`}
                            >
                              {u.blocked ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5" /> Unblock
                                </>
                              ) : (
                                <>
                                  <Ban className="w-3.5 h-3.5" /> Block User
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="glass rounded-2xl border border-white/5 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Global Ledger Audit</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {transactions.length} transactions recorded across all users
                </p>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search by UPI or Ref..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 input-focus text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/30 border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Reference No</th>
                    <th className="py-3.5 px-6">Sender UPI</th>
                    <th className="py-3.5 px-6">Receiver UPI</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">No transactions audited.</td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx, index) => (
                      <tr 
                        key={tx.id} 
                        className="hover:bg-slate-950/40 transition-colors"
                        style={{ animation: `slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.03}s forwards`, opacity: 0 }}
                      >
                        <td className="py-4 px-6 font-mono text-xs text-slate-400">{tx.referenceNumber}</td>
                        <td className="py-4 px-6 text-slate-300 font-mono text-xs">{tx.senderUpi}</td>
                        <td className="py-4 px-6 text-slate-300 font-mono text-xs">{tx.receiverUpi}</td>
                        <td className="py-4 px-6 text-white font-extrabold">₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 px-6 text-xs text-slate-400">{new Date(tx.timestamp).toLocaleString()}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            tx.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl animate-fade-in">
            <div className="glass p-8 rounded-2xl border border-white/5">
              {/* Decorative gradient */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Global Transaction Limits</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Manage global controls governing payments processed by the simulator.</p>
                </div>
              </div>

              {/* Current Value Display */}
              {stats && (
                <div className="my-6 p-4 bg-slate-950/30 rounded-xl border border-white/5 flex items-center justify-between">
                  <span className="text-sm text-slate-400">Current Active Limit</span>
                  <span className="text-xl font-extrabold text-indigo-400">₹{stats.activeLimit?.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              <form onSubmit={handleUpdateLimit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                    New Maximum Transaction Limit (₹)
                  </label>
                  <input 
                    type="number"
                    value={maxLimitInput}
                    onChange={(e) => setMaxLimitInput(e.target.value)}
                    placeholder="Enter maximum transaction limit"
                    className="w-full input-focus px-4 py-3.5 text-lg font-bold"
                  />
                  <p className="text-xs text-slate-500 mt-1.5 pl-1">Transactions exceeding this value will fail automatically with a limit warning.</p>
                </div>
                
                <button 
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 gradient-btn px-8 py-3 rounded-xl text-sm font-semibold shadow-lg cursor-pointer ripple"
                >
                  <Save className="w-4 h-4" />
                  Save Configuration
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
