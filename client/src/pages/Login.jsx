import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCredentialsHint, setShowCredentialsHint] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleFillSample = (sampleEmail) => {
    setEmail(sampleEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-500/20">
            <Sun className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to SunPower
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Solar Installation & Enterprise Operations Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-3xl border border-slate-200/80 sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick credentials hint accordion */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCredentialsHint(!showCredentialsHint)}
              className="w-full text-[11px] text-slate-500 hover:text-slate-700 flex items-center justify-between font-semibold py-1"
            >
              <span>Need test credentials? Click to view</span>
              {showCredentialsHint ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showCredentialsHint && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1.5 animate-in fade-in duration-150">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Click any of the 6 roles to prefill test credentials (Password: password123):
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleFillSample('customer@gmail.com')}
                    className="p-1.5 bg-white border border-slate-200 rounded text-left hover:border-emerald-500"
                  >
                    <span className="font-bold block text-slate-900 text-xs">Customer</span>
                    <span className="text-[10px] text-slate-400 truncate block">customer@gmail.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillSample('admin@sunpower.com')}
                    className="p-1.5 bg-white border border-slate-200 rounded text-left hover:border-purple-500"
                  >
                    <span className="font-bold block text-slate-900 text-xs">Admin (Exec + Director)</span>
                    <span className="text-[10px] text-slate-400 truncate block">admin@sunpower.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillSample('technician@sunpower.com')}
                    className="p-1.5 bg-white border border-slate-200 rounded text-left hover:border-amber-500"
                  >
                    <span className="font-bold block text-slate-900 text-xs">Technician (Survey + Install)</span>
                    <span className="text-[10px] text-slate-400 truncate block">technician@sunpower.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillSample('sales@sunpower.com')}
                    className="p-1.5 bg-white border border-slate-200 rounded text-left hover:border-blue-500"
                  >
                    <span className="font-bold block text-slate-900 text-xs">Sales</span>
                    <span className="text-[10px] text-slate-400 truncate block">sales@sunpower.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillSample('warehouse@sunpower.com')}
                    className="p-1.5 bg-white border border-slate-200 rounded text-left hover:border-teal-500"
                  >
                    <span className="font-bold block text-slate-900 text-xs">Warehouse</span>
                    <span className="text-[10px] text-slate-400 truncate block">warehouse@sunpower.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillSample('support@sunpower.com')}
                    className="p-1.5 bg-white border border-slate-200 rounded text-left hover:border-rose-500"
                  >
                    <span className="font-bold block text-slate-900 text-xs">Service & Support</span>
                    <span className="text-[10px] text-slate-400 truncate block">support@sunpower.com</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              ← Back to Homepage
            </Link>
            <Link to="/register" className="text-slate-600 hover:text-slate-900 font-bold">
              New Customer? Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;