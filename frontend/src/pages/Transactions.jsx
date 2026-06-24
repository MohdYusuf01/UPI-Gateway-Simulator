import React, { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Clock, ArrowUpRight, ArrowDownLeft, CheckCircle2, XCircle, Search, Filter, IndianRupee } from 'lucide-react';
import api from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';

export default function Transactions() {
  const { user, loading } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, credit, debit

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions/history');
      setTransactions(res.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsFetching(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading transactions..." />;
  if (!user) return <Navigate to="/login" />;

  const getStatusIcon = (status) => {
    if (status === 'SUCCESS') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (status === 'FAILED') return <XCircle className="w-4 h-4 text-rose-400" />;
    return <Clock className="w-4 h-4 text-amber-400" />;
  };

  // Filter and search
  const filtered = transactions
    .filter(tx => filter === 'all' || (filter === 'credit' && tx.type === 'CREDIT') || (filter === 'debit' && tx.type === 'DEBIT'))
    .filter(tx => 
      !search || 
      tx.senderUpi?.toLowerCase().includes(search.toLowerCase()) ||
      tx.receiverUpi?.toLowerCase().includes(search.toLowerCase()) ||
      tx.referenceNumber?.toLowerCase().includes(search.toLowerCase())
    );

  // Quick stats
  const totalIn = transactions.filter(t => t.type === 'CREDIT' && t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'DEBIT' && t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-slide-up">
          <Link to="/dashboard" className="p-2.5 bg-slate-950/45 hover:bg-slate-950/80 border border-white/10 rounded-full shadow-sm transition-all hover:border-indigo-500/20 group">
            <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Transaction History</h1>
            <p className="text-xs text-slate-400 mt-0.5">{transactions.length} transactions recorded</p>
          </div>
        </div>

        {/* Quick Stats */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 stagger-children">
            <div className="glass-interactive p-5 rounded-2xl flex items-center gap-4 group">
              <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Received</p>
                <p className="text-xl font-extrabold text-emerald-400 mt-0.5">
                  +₹{totalIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="glass-interactive p-5 rounded-2xl flex items-center gap-4 group">
              <div className="w-11 h-11 bg-slate-800/40 border border-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Sent</p>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  -₹{totalOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by UPI ID or reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 input-focus text-sm"
            />
          </div>
          <div className="flex rounded-xl border border-white/10 overflow-hidden bg-slate-950/30">
            {['all', 'credit', 'debit'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  filter === f 
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {f === 'all' ? 'All' : f === 'credit' ? '↓ In' : '↑ Out'}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {isFetching ? (
            <div className="p-6 space-y-4">
              <div className="h-20 skeleton" />
              <div className="h-20 skeleton" />
              <div className="h-20 skeleton" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-800/40 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-slate-600" />
              </div>
              <p className="font-semibold text-slate-300">
                {search || filter !== 'all' ? 'No matching transactions' : 'No transactions found'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {search || filter !== 'all' ? 'Try adjusting your search or filter' : 'When you make or receive a payment, your receipts will be audited here.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((tx, index) => (
                <div 
                  key={tx.id} 
                  className="p-4 sm:p-6 hover:bg-slate-950/40 transition-all flex items-center justify-between group cursor-default"
                  style={{ animation: `slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.03}s forwards`, opacity: 0 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                      tx.type === 'CREDIT' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                        : 'bg-slate-800/40 border border-white/5'
                    }`}>
                      {tx.type === 'CREDIT' ? (
                        <ArrowDownLeft className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {tx.type === 'CREDIT' ? `Received from ${tx.senderUpi}` : `Paid to ${tx.receiverUpi}`}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 font-mono">{new Date(tx.timestamp).toLocaleString()}</span>
                        <span className="text-slate-700">•</span>
                        <span className={`text-xs flex items-center gap-1 font-semibold ${
                          tx.status === 'SUCCESS' ? 'text-emerald-400' :
                          tx.status === 'FAILED' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {getStatusIcon(tx.status)} {tx.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-1">Ref: {tx.referenceNumber}</p>
                    </div>
                  </div>
                  <div className={`text-right font-extrabold text-lg ${
                    tx.status === 'FAILED' ? 'text-slate-600 line-through' :
                    tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
