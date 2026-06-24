import React, { useState } from 'react';
import { X, Smartphone, Lock, AlertCircle } from 'lucide-react';
import api from '../utils/api';

export default function CreateUpiModal({ isOpen, onClose, onSuccess, bankAccounts }) {
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id || '');
  const [upiId, setUpiId] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/accounts/upi', {
        bankAccountId: parseInt(bankAccountId),
        upiId: `${upiId}@upi`,
        transactionPin
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create UPI ID');
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
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />
        
        <button 
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 rounded-xl p-2 transition-all duration-200 cursor-pointer group"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        </button>
        
        <div className="flex items-center gap-3 mb-7">
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Create UPI ID</h2>
            <p className="text-xs text-slate-400 mt-0.5">Generate a virtual payment address</p>
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
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Select Bank Account</label>
            <select
              required
              value={bankAccountId}
              onChange={(e) => setBankAccountId(e.target.value)}
              className="w-full select-dark"
            >
              <option value="" disabled>Select an account</option>
              {bankAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.bankName} - XXXX{acc.accountNumber.slice(-4)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Desired UPI ID</label>
            <div className="flex items-center">
              <input
                type="text"
                required
                pattern="[a-zA-Z0-9.\-_]{3,}"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                className="w-full pl-4 pr-2 py-3.5 input-focus rounded-r-none border-r-0"
                placeholder="yourname"
              />
              <span className="bg-indigo-500/10 px-5 py-3.5 border border-l-0 border-indigo-500/20 rounded-r-xl text-indigo-400 font-bold text-sm whitespace-nowrap">
                @upi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-1">Min 3 characters, letters, numbers, dots & dashes</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Set 4–6 Digit UPI PIN</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                required
                pattern="\d{4,6}"
                maxLength="6"
                value={transactionPin}
                onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ''))}
                className="block w-full pl-11 pr-3 py-3.5 input-focus tracking-[0.4em] font-mono text-center"
                placeholder="••••••"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-1">Numbers only</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !bankAccountId}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer ripple"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="40 60" /></svg>
                  Creating...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  Create UPI ID
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
