import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Wrench,
  Headphones,
  CheckCircle2,
  Clock,
  ArrowRight,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Landmark,
  Percent,
  FileSpreadsheet,
  Shield,
  Layers,
  Settings,
  PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';
  const isAdmin = role === 'Admin';
  const isDirector = role === 'Director';

  // Active view tab: Director defaults to analytics, Admin defaults to operations
  const [activeTab, setActiveTab] = useState(isDirector ? 'analytics' : 'operations');

  const [analyticsData, setAnalyticsData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dirRes, ordRes, stockRes] = await Promise.all([
          api.get('/director/analytics'),
          api.get('/orders'),
          api.get('/inventory/low-stock')
        ]);

        if (dirRes.data.success) setAnalyticsData(dirRes.data);
        if (ordRes.data.success) setOrders(ordRes.data.orders);
        if (stockRes.data.success) setLowStock(stockRes.data.products);
      } catch (err) {
        console.error('Error fetching admin/director data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Update tab default if role switches
  useEffect(() => {
    if (isDirector) {
      setActiveTab('analytics');
    } else if (isAdmin) {
      setActiveTab('operations');
    }
  }, [role]);

  if (loading || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { summary, installationsProfitList, techPerformance, monthlyTrends, capacityDistribution } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Executive & Admin Operations Dashboard
            </h1>
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold border bg-purple-50 text-purple-800 border-purple-200">
              Admin & Director Command Center
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Unified executive administration: user management, operations oversight, DBT subsidy cashflow, and enterprise P&L analytics.
          </p>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab buttons */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl border border-slate-300/80">
            <button
              onClick={() => setActiveTab('operations')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'operations'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Operations & Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>P&L & Analytics</span>
            </button>
          </div>

          <Link
            to="/users"
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Users</span>
          </Link>

          <Link
            to="/enquiries"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (Combining Financial and Operational metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Recognized Revenue"
          value={`₹${summary.totalRevenue.toLocaleString('en-IN')}`}
          subtext="Actual customer receipts collected"
          icon={TrendingUp}
          color="emerald"
          trend="+22.5% YoY"
        />
        <StatCard
          title="Net Gross Profit"
          value={`₹${summary.netProfit.toLocaleString('en-IN')}`}
          subtext={`Avg Margin: ${summary.profitMargin} (Expenses: ₹${summary.totalExpenses.toLocaleString('en-IN')})`}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Active & Completed Orders"
          value={summary.totalOrdersCount || orders.length}
          subtext={`${summary.completedInstalls || 1} installations commissioned`}
          icon={ShoppingBag}
          color="purple"
        />
        <StatCard
          title="Pending Receivables"
          value={`₹${summary.pendingCustomerPayments.toLocaleString('en-IN')}`}
          subtext="Unpaid balances on confirmed orders"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* SUB-SECTION 1: FINANCIAL P&L & BUSINESS ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Charts Row: Monthly P&L Trend & Capacity Mix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Revenue vs Expenses Recharts */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Monthly Revenue vs Expenses vs Net Profit</h3>
                  <p className="text-xs text-slate-400">Financial performance progression across past 6 operating months</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" /> Margin: {summary.profitMargin}
                </span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="revenue" fill="#10b981" name="Gross Revenue (₹)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#f43f5e" name="Expenses (₹)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="#3b82f6" name="Net Profit (₹)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* System Capacity Share Pie Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">System Capacity Distribution</h3>
                <p className="text-xs text-slate-400 mb-2">Package volume breakdown (1kW to 5kW)</p>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={capacityDistribution}
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {capacityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {capacityDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      {item.name}
                    </span>
                    <span className="font-bold text-slate-900">{item.value} Projects</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subsidy Paperwork Tracking Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Government Solar Subsidy (DBT) Paperwork & Cashflow</h3>
              </div>
              <span className="text-xs text-slate-400">Direct Benefit Transfer Scheme</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Subsidy Claimed</span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">
                  ₹{summary.subsidyClaimed.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">Submitted to MNRE / State Discom</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase block">Disbursed by Government</span>
                <span className="text-xl font-extrabold text-emerald-900 mt-0.5 block">
                  ₹{summary.subsidyDisbursed.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Successfully credited to customer accounts</span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] font-semibold text-amber-700 uppercase block">Pending Inspection / Disbursement</span>
                <span className="text-xl font-extrabold text-amber-900 mt-0.5 block">
                  ₹{summary.subsidyPending.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-600 font-medium">Awaiting net-meter discom synchronization</span>
              </div>
            </div>
          </div>

          {/* Profit Per Installation Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Profitability Per Installation Job</h3>
                <p className="text-xs text-slate-400">Order revenue versus hardware BOM & technician labor cost breakdown</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {installationsProfitList.length} Order Audits
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-3">Order #</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Package / System</th>
                    <th className="py-3 px-3">Customer Revenue</th>
                    <th className="py-3 px-3">BOM & Labor Cost</th>
                    <th className="py-3 px-3">Net Margin (₹)</th>
                    <th className="py-3 px-3">Margin %</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {installationsProfitList.map((inst, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{inst.orderNumber}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{inst.customerName}</td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-emerald-800">{inst.capacity}</span>
                        <span className="text-[11px] text-slate-400 block">{inst.systemType}</span>
                      </td>
                      <td className="py-3 px-3 font-bold">₹{inst.revenue.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-rose-600 font-medium">₹{inst.cost.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-emerald-600 font-extrabold">₹{inst.profit.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {inst.margin}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={inst.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Field Crew & Technician Performance Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" /> Crew & Technician Performance Scorecard
                </h3>
                <p className="text-xs text-slate-400">Field work audits, rooftop completed jobs, service speed, and customer ratings</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-3">Technician</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Surveys Done</th>
                    <th className="py-3 px-3">Installs Done</th>
                    <th className="py-3 px-3">Tickets Resolved</th>
                    <th className="py-3 px-3">Customer Rating</th>
                    <th className="py-3 px-3">On-Time Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {techPerformance.map((tech) => (
                    <tr key={tech.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{tech.name}</td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-600">
                          {tech.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold">{tech.surveysCompleted}</td>
                      <td className="py-3 px-3 font-semibold">{tech.installationsDone}</td>
                      <td className="py-3 px-3 font-semibold">{tech.ticketsResolved}</td>
                      <td className="py-3 px-3 text-amber-600 font-bold">★ {tech.rating} / 5.0</td>
                      <td className="py-3 px-3 font-semibold text-emerald-600">{tech.onTimeRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: ADMINISTRATIVE & OPERATIONS MASTER */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Solar Installation Orders</h2>
                  <p className="text-xs text-slate-400">Track end-to-end BOM, dispatch, and rooftop commissioning</p>
                </div>
                <Link to="/orders" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                    <tr>
                      <th className="py-3 px-3">Order #</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Capacity / System</th>
                      <th className="py-3 px-3">Net Amount</th>
                      <th className="py-3 px-3">Balance</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900">{order.orderNumber}</td>
                        <td className="py-3 px-3">
                          <span className="font-semibold block">{order.customerName}</span>
                          <span className="text-[11px] text-slate-400">{order.customerPhone}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium">{order.capacityKw} kW</span>
                          <span className="text-[11px] text-slate-400 block">{order.systemType}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold">₹{(order.netPayable || order.totalAmount).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-rose-600 font-medium">₹{(order.balanceDue || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Stock & System Health */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" /> Reorder Alerts
                  </h3>
                  <Link to="/inventory" className="text-[11px] font-semibold text-emerald-600 hover:underline">
                    Manage
                  </Link>
                </div>
                {lowStock.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">All warehouse stock is above minimum thresholds.</p>
                ) : (
                  <div className="space-y-2.5">
                    {lowStock.map((item) => (
                      <div key={item._id} className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-rose-950">{item.name}</p>
                          <p className="text-[11px] text-rose-600 mt-0.5">Min required: {item.minStockAlert}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-rose-200 text-rose-800 rounded font-bold">
                          {item.currentStock} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Admin-only quick user management card */}
              {isAdmin && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" /> User & Role Management
                    </h3>
                    <Link to="/users" className="text-[11px] font-semibold text-purple-600 hover:underline">
                      Open Console
                    </Link>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Configure staff permissions, activate/deactivate accounts, and reassign department roles.
                  </p>
                  <Link
                    to="/users"
                    className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Manage All 8 System Roles</span>
                  </Link>
                </div>
              )}

              {/* System Health */}
              <div className="bg-gradient-to-br from-emerald-800 to-slate-900 rounded-2xl p-5 text-white shadow-sm">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SunPower System Status
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Unified 6-dashboard architecture online. Real-time synchronization active across Sales quotes, Field Technician surveys & installations, Warehouse inventory, and Customer warranty certificates.
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-300">
                  <span>Database Sync</span>
                  <span className="font-bold">100% Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;