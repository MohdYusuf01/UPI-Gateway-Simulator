import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Wallet, ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      await register(name, email, password);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 25, label: 'Weak', color: 'bg-rose-500' };
    if (password.length < 8) return { strength: 50, label: 'Fair', color: 'bg-amber-500' };
    if (password.length < 12) return { strength: 75, label: 'Good', color: 'bg-indigo-500' };
    return { strength: 100, label: 'Strong', color: 'bg-emerald-500' };
  };
  const pwStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/3 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer mb-5">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex gap-2">
            Create <span className="gradient-text">Account</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Join the digital banking simulator ecosystem
          </p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Gradient top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-slide-down">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-200">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 animate-scale-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-200">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-11 pr-3 py-3.5 input-focus"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-3 py-3.5 input-focus"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-3 py-3.5 input-focus"
                  placeholder="••••••••"
                />
              </div>
              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="flex items-center gap-3 mt-2 animate-fade-in">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${pwStrength.color}`}
                      style={{ width: `${pwStrength.strength}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${
                    pwStrength.strength <= 25 ? 'text-rose-400' :
                    pwStrength.strength <= 50 ? 'text-amber-400' :
                    pwStrength.strength <= 75 ? 'text-indigo-400' : 'text-emerald-400'
                  }`}>{pwStrength.label}</span>
                </div>
              )}
              <p className="text-xs text-slate-500 pl-1 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3 h-3" />
                Must be at least 6 characters
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !!success}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer ripple"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="40 60" /></svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Sign up
                    {!success && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
