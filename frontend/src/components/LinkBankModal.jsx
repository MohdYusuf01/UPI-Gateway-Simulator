import React, { useState } from 'react';
import { X, Building, CreditCard, Hash, IndianRupee, AlertCircle } from 'lucide-react';
import api from '../utils/api';

export default function LinkBankModal({ isOpen, onClose, onSuccess }) {
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [initialBalance, setInitialBalance] = useState(10000);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/accounts/bank', {
        accountNumber,
        ifsc,
        bankName,
        initialBalance
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link bank account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-overlay"
         style={{ backgroundColor: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(8px)' }}
         onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass w-full max-w-md rounded-3xl p-8 relative animate-modal-content border border-white/10">
        {/* Decorative gradient top */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <button 
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 rounded-xl p-2 transition-all duration-200 cursor-pointer group"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        </button>
        
        <div className="flex items-center gap-3 mb-7">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
            <Building className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Link Bank Account</h2>
            <p className="text-xs text-slate-400 mt-0.5">Connect a mock bank vault to your profile</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-slide-down">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Bank Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="block w-full pl-11 pr-3 py-3.5 input-focus"
                placeholder="e.g. State Bank of India"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Account Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                required
                pattern="[0-9]{9,18}"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="block w-full pl-11 pr-3 py-3.5 input-focus font-mono"
                placeholder="Enter account number"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">IFSC Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                required
                pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                className="block w-full pl-11 pr-3 py-3.5 input-focus uppercase font-mono"
                placeholder="SBIN0001234"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Mock Initial Balance (₹)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <IndianRupee className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="number"
                required
                min="0"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="block w-full pl-11 pr-3 py-3.5 input-focus font-semibold"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 gradient-btn py-3.5 px-4 rounded-xl text-sm font-semibold shadow-lg disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer ripple"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="40 60" /></svg>
                  Linking...
                </>
              ) : (
                <>
                  <Building className="w-4 h-4" />
                  Link Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
