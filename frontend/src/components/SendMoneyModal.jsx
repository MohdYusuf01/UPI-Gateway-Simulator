import React, { useState } from 'react';
import { X, Send, Lock, IndianRupee, AtSign, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../utils/api';

export default function SendMoneyModal({ isOpen, onClose, onSuccess, upiAccounts }) {
  const [senderUpiId, setSenderUpiId] = useState(upiAccounts[0]?.upiId || '');
  const [receiverUpiId, setReceiverUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/transactions/send', {
        senderUpiId,
        receiverUpiId,
        amount: parseFloat(amount),
        transactionPin
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed');
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
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />
        
        <button 
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 rounded-xl p-2 transition-all duration-200 cursor-pointer group"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        </button>
        
        <div className="flex items-center gap-3 mb-7">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
            <Send className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Send Money</h2>
            <p className="text-xs text-slate-400 mt-0.5">Instant UPI payment transfer</p>
          </div>
        </div>

        {/* Amount Display */}
        {amount && (
          <div className="text-center mb-6 py-4 bg-slate-950/30 rounded-2xl border border-white/5 animate-scale-in">
            <p className="text-xs text-slate-400 mb-1">You are sending</p>
            <p className="text-4xl font-extrabold text-white">
              ₹<span className="gradient-text">{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-slide-down">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Pay From UPI ID</label>
            <select
              required
              value={senderUpiId}
              onChange={(e) => setSenderUpiId(e.target.value)}
              className="w-full select-dark"
            >
              <option value="" disabled>Select your UPI ID</option>
              {upiAccounts.map((upi) => (
                <option key={upi.id} value={upi.upiId}>
                  {upi.upiId}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Pay To UPI ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <AtSign className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                required
                value={receiverUpiId}
                onChange={(e) => setReceiverUpiId(e.target.value.toLowerCase())}
                className="block w-full pl-11 pr-3 py-3.5 input-focus"
                placeholder="receiver@upi"
              />
            </div>
          </div>

          {/* Transfer Flow Indicator */}
          {senderUpiId && receiverUpiId && (
            <div className="flex items-center justify-center gap-3 py-2 text-xs animate-fade-in">
              <span className="text-indigo-400 font-mono font-bold">{senderUpiId}</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="text-emerald-400 font-mono font-bold">{receiverUpiId}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Amount (₹)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <IndianRupee className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-11 pr-3 py-3.5 input-focus text-lg font-bold"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">UPI PIN</label>
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
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !senderUpiId}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 px-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer ripple"
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="40 60" /></svg>
                  Processing Payment...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {amount ? `Pay ₹${parseFloat(amount).toLocaleString('en-IN')}` : 'Enter Amount'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
