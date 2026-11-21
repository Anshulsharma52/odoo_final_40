import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, User, Mail, Lock, Phone, MapPin, IndianRupee, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Customer', // Strictly locked to Customer
    phone: '',
    address: '',
    monthlyBill: 3000
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Force role to Customer
    const submissionData = { ...formData, role: 'Customer' };
    const result = await register(submissionData);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-500/20">
          <Sun className="w-7 h-7" />
        </div>
        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Customer Account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Join SunPower rooftop solar platform as a Homeowner
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-3xl border border-slate-200/80 sm:px-10">
          {/* Security policy notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Self-Registration Clearance:
              </span>
              <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-300 font-bold text-[10px]">
                Customer Only
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Functional roles (Admin, Director, Sales, Survey & Installation Technicians, Warehouse) cannot be created independently. They are created and approved exclusively by System Administrators.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Sunil Mehta"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="+91 98200 00000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Installation Site Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. 402, Green Acres, Baner, Pune"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Average Monthly Electricity Bill (₹)</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="500"
                  required
                  value={formData.monthlyBill}
                  onChange={(e) => setFormData({ ...formData, monthlyBill: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="3000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Read-only role confirmation */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">Account Role: Customer</span>
                  <span className="text-[10px] text-emerald-700">Accesses Customer Portal Dashboard</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-200/60 px-2 py-0.5 rounded">
                Verified Client
              </span>
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
                  <span>Create Customer Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center gap-2 text-xs">
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold">
              Already have an account? Sign In
            </Link>
            <span className="text-slate-400 text-[11px]">
              Internal Staff or Technician? <Link to="/login" className="text-slate-600 font-semibold underline">Use Login Portal</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;