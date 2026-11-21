import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sun,
  Shield,
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  PackageCheck,
  Wrench,
  Headphones,
  TrendingUp,
  FileQuestion,
  ClipboardCheck,
  LogIn,
  LogOut,
  Zap,
  Check,
  ArrowUpRight,
  Award,
  Clock,
  Landmark,
  BadgePercent,
  Layers
} from 'lucide-react';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Sun className="w-6 h-6 animate-spin-slow text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">SunPower</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  Solar ERP
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Solar Installation & Operations Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
          <a href="#portals" className="hover:text-emerald-400 transition-colors">Portals & Roles</a>
          <a href="#why-us" className="hover:text-emerald-400 transition-colors">Why SunPower</a>
        </nav>

        {/* Auth CTA Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-white block leading-tight">{user.name}</span>
                <span className="text-[10px] font-semibold text-emerald-400 block">{user.role}</span>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/30"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-8 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Next-Generation Solar EPC & Installation Management Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Clean Solar Energy Powered by{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Smart Operations
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From initial roof analysis and customized solar quotes to certified hardware dispatch, field installations, and lifetime warranty certificates — all in one unified, role-governed platform.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>Create Customer Account</span>
            </Link>
          </div>

          {/* Metric Highlights Strip */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block font-mono">45+ MW</span>
              <span className="text-xs font-bold text-white block mt-0.5">Clean Power Installed</span>
              <p className="text-[11px] text-slate-400 mt-1">Over 45 megawatts commissioned across rooftop sites.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 block font-mono">12,500+</span>
              <span className="text-xs font-bold text-white block mt-0.5">Satisfied Homeowners</span>
              <p className="text-[11px] text-slate-400 mt-1">Solar installations commissioned on schedule.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-400 block font-mono">99.8%</span>
              <span className="text-xs font-bold text-white block mt-0.5">Grid Sync Reliability</span>
              <p className="text-[11px] text-slate-400 mt-1">Precision inverter synchronization and safety earthing.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 block font-mono">25 Years</span>
              <span className="text-xs font-bold text-white block mt-0.5">Performance Warranty</span>
              <p className="text-[11px] text-slate-400 mt-1">Serial-tracked certified tier-1 solar components.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works: The Solar Lifecycle */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest block">
              End-to-End Solar Journey
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              How SunPower Solar Works
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
              From lead consultation to rooftop mounting and lifelong warranty coverage — experience a hassle-free transition to clean energy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Free Consultation & Solar Sizing',
                desc: 'Homeowners submit basic electricity consumption details. Our solar sales engineers calculate optimal system capacity (kW) and monthly bill savings.',
                icon: FileQuestion,
                badge: 'Customer & Sales'
              },
              {
                step: '02',
                title: 'Precision Rooftop Feasibility Survey',
                desc: 'Certified survey engineers inspect rooftop dimensions, true South azimuth angle, shadow-free space, and structural load capacity.',
                icon: ClipboardCheck,
                badge: 'Field Survey Tech'
              },
              {
                step: '03',
                title: 'Engineering Quotation & Subsidy',
                desc: 'Receive transparent component pricing, customized Bill of Materials (BOM), and direct benefit transfer (DBT) government solar subsidy estimates.',
                icon: FileSpreadsheet,
                badge: 'Commercial Engineering'
              },
              {
                step: '04',
                title: 'Barcoded Hardware Dispatch',
                desc: 'Warehouse scans and allocates tier-1 solar PV modules, hybrid inverters, and lithium storage batteries with verified manufacturer serial numbers.',
                icon: PackageCheck,
                badge: 'Warehouse & Logistics'
              },
              {
                step: '05',
                title: 'Turnkey Installation & Commissioning',
                desc: 'Trained technicians execute module rail mounting, inverter AC/DC wiring, safety dual earthing pits, and customer digital sign-off.',
                icon: Wrench,
                badge: 'Installation Tech'
              },
              {
                step: '06',
                title: 'Digital Warranty & Lifetime Care',
                desc: 'Immediate activation of 25-year solar warranty certificate, component serial lookup, rapid ticket resolution, and live PV monitoring.',
                icon: ShieldCheck,
                badge: 'Support & Warranty'
              }
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-500">
                        STAGE {step.step}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700/80 uppercase tracking-wider inline-block mb-2">
                      {step.badge}
                    </span>
                    <h3 className="font-bold text-base text-white mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stakeholder Portals (The 6 Consolidated Dashboard Layouts) */}
      <section id="portals" className="py-20 px-4 sm:px-8 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest block">
              Consolidated 6-Dashboard Ecosystem
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Dedicated Workspaces for Every Role
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
              Our unified platform provides customized interfaces tailored to each stakeholder while strictly preserving role security and privilege boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Customer Portal */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-teal-500/40 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Homeowner Access
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Customer Portal</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Homeowner self-service portal to review live solar installation stages, accept engineering quotations, download warranty certificates, and submit service tickets.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">Project Tracker</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">Digital Quotes</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">Warranties</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-teal-400 font-semibold">Self-registration open</span>
                <Link to="/register" className="font-bold text-white hover:text-teal-300 flex items-center gap-1">
                  Sign Up <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 2. Executive & Admin Dashboard */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-purple-500/40 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Admin + Director
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Executive & Admin Dashboard</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Shared executive command center. System Administrators manage users and operational settings; Executive Directors oversee business P&L, monthly trends, and crew scorecards.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">RBAC User Admin</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">P&L Analytics</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">DBT Subsidy Flow</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-purple-400 font-semibold">Admin Provisioned</span>
                <Link to="/login" className="font-bold text-white hover:text-purple-300 flex items-center gap-1">
                  Log In <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 3. Field Technician Dashboard */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-emerald-500/40 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Survey + Installation
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Field Technician Dashboard</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Shared engineering field center with dedicated modules: site inspections & roof measurements for Survey Techs; and mounting checklists, testing, and customer digital sign-off for Install Techs.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">Roof Measurements</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">Safety Checklist</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">Digital Signature</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold">Admin Provisioned</span>
                <Link to="/login" className="font-bold text-white hover:text-emerald-300 flex items-center gap-1">
                  Log In <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 4. Sales Dashboard */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-blue-500/40 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <FileQuestion className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Commercial & Leads
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Sales Dashboard</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Lead pipeline management, electricity bill consumption analysis, site survey review, customized solar sizing calculations, and quotation dispatch.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">Customer Leads</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">Quotation Engine</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">Order Closing</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-blue-400 font-semibold">Admin Provisioned</span>
                <Link to="/login" className="font-bold text-white hover:text-blue-300 flex items-center gap-1">
                  Log In <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 5. Warehouse & Logistics Dashboard */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-orange-500/40 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    Inventory & Logistics
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Warehouse Dashboard</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Real-time stock monitoring of solar modules, inverters, and lithium battery banks with individual barcode serial scanning and dispatch order allocation.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">Serial Barcodes</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">BOM Allocation</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">Reorder Alerts</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-orange-400 font-semibold">Admin Provisioned</span>
                <Link to="/login" className="font-bold text-white hover:text-orange-300 flex items-center gap-1">
                  Log In <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 6. Service & Support Dashboard */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-cyan-500/40 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    SLA & Support
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Service & Support Desk</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Customer assistance desk, serial warranty certificate verification, preventive maintenance scheduling, and rapid grievance SLA resolution.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">Ticket Resolution</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">Warranty Lookup</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">SLA Speed</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-semibold">Admin Provisioned</span>
                <Link to="/login" className="font-bold text-white hover:text-cyan-300 flex items-center gap-1">
                  Log In <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose SunPower */}
      <section id="why-us" className="py-20 px-4 sm:px-8 border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest block">
              Enterprise Excellence
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Why Solar Homeowners & Enterprises Choose SunPower
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-3">
                <BadgePercent className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Up to 90% Bill Savings</h4>
              <p className="text-xs text-slate-400">Reduce electricity expenses with optimal PV solar generation and net-metering.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-3">
                <Landmark className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">DBT Subsidy Assistance</h4>
              <p className="text-xs text-slate-400">Complete government paperwork assistance for direct subsidy transfer to your bank.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Tier-1 Hardware Only</h4>
              <p className="text-xs text-slate-400">High-efficiency monocrystalline PERC solar panels and pure sine-wave hybrid inverters.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">25-Year Warranty Cover</h4>
              <p className="text-xs text-slate-400">Every serial number registered in our master database for verifiable lifetime coverage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto w-full">
        <div className="bg-gradient-to-r from-emerald-900/60 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-12 border border-emerald-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white max-w-2xl mx-auto leading-tight relative z-10">
            Ready to Power Your Home with Clean Solar Energy?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mt-3 relative z-10">
            Create your homeowner account in under 60 seconds or sign in to access your customized operational dashboard.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link
              to="/register"
              className="px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-105"
            >
              <User className="w-4 h-4" />
              <span>Get Solar Quote / Register</span>
            </Link>
            <Link
              to="/login"
              className="px-7 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center gap-2 transition-all"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Log In to Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 px-4 sm:px-8 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-300">SunPower Solutions Solar ERP</span>
            <span>•</span>
            <span>Enterprise Version 2.4.0</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">Portal Login</Link>
            <span>•</span>
            <Link to="/register" className="hover:text-white transition-colors">Customer Registration</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;