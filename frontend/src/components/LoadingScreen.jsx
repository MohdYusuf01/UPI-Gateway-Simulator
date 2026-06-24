import React from 'react';
import { Wallet } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading your dashboard...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      {/* Animated Logo */}
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-float">
          <Wallet className="w-10 h-10 text-white" />
        </div>
        {/* Orbiting ring */}
        <div className="absolute -inset-4 rounded-full border-2 border-indigo-500/20 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute -inset-4 rounded-full border-t-2 border-indigo-400/50 animate-spin" style={{ animationDuration: '2s' }} />
      </div>

      {/* Shimmer text */}
      <div className="text-center">
        <p className="text-slate-300 font-medium text-sm tracking-wide">{message}</p>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
