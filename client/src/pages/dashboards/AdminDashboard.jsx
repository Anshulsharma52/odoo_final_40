import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
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
  PlusCircle,
  Edit,
  Trash2,
  Plus,
  Save,
  Search,
  Eye,
  CheckCircle
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
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin Quotations & Component Price Management States
  const [quoteSearchTerm, setQuoteSearchTerm] = useState('');
  const [selectedQuoteForEdit, setSelectedQuoteForEdit] = useState(null);
  const [isEditQuoteModalOpen, setIsEditQuoteModalOpen] = useState(false);
  const [editQuoteData, setEditQuoteData] = useState({
    items: [],
    discount: 0,
    subsidyAmount: 0,
    notes: ''
  });

  const [selectedQuoteForView, setSelectedQuoteForView] = useState(null);
  const [isViewQuoteModalOpen, setIsViewQuoteModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [dirRes, ordRes, stockRes, quoRes] = await Promise.all([
        api.get('/director/analytics'),
        api.get('/orders'),
        api.get('/inventory/low-stock'),
        api.get('/quotations')
      ]);

      if (dirRes.data.success) setAnalyticsData(dirRes.data);
      if (ordRes.data.success) setOrders(ordRes.data.orders || []);
      if (stockRes.data.success) setLowStock(stockRes.data.products || []);
      if (quoRes.data.success) setQuotations(quoRes.data.quotations || []);
    } catch (err) {
      console.error('Error fetching admin/director data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Admin Handlers for Quotation Component Prices
  const handleOpenEditQuote = (quote) => {
    setSelectedQuoteForEdit(quote);
    setEditQuoteData({
      items: (quote.items || []).map((it) => ({
        name: it.name || 'Component',
        category: it.category || 'Equipment',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
        serialRequired: Boolean(it.serialRequired)
      })),
      discount: Number(quote.discount) || 0,
      subsidyAmount: Number(quote.subsidyAmount) || 0,
      notes: quote.notes || ''
    });
    setIsEditQuoteModalOpen(true);
  };

  const handleItemPriceChange = (index, field, value) => {
    const updated = [...editQuoteData.items];
    const item = { ...updated[index] };
    if (field === 'quantity' || field === 'unitPrice') {
      const num = Math.max(0, Number(value) || 0);
      item[field] = num;
      item.total = (field === 'quantity' ? num : item.quantity) * (field === 'unitPrice' ? num : item.unitPrice);
    } else {
      item[field] = value;
    }
    updated[index] = item;
    setEditQuoteData({ ...editQuoteData, items: updated });
  };

  const handleAddEditItem = () => {
    setEditQuoteData({
      ...editQuoteData,
      items: [
        ...editQuoteData.items,
        {
          name: 'Additional Balance of System Component',
          category: 'Balance of System',
          quantity: 1,
          unitPrice: 3500,
          total: 3500,
          serialRequired: false
        }
      ]
    });
  };

  const handleRemoveEditItem = (index) => {
    setEditQuoteData({
      ...editQuoteData,
      items: editQuoteData.items.filter((_, idx) => idx !== index)
    });
  };

  const handleSaveQuotePrices = async (e) => {
    e.preventDefault();
    if (!selectedQuoteForEdit) return;

    try {
      const res = await api.put(`/quotations/${selectedQuoteForEdit._id}`, editQuoteData);
      if (res.data.success) {
        toast.success(`Quotation ${selectedQuoteForEdit.quotationNumber} component prices updated in MongoDB!`);
        setIsEditQuoteModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quotation');
    }
  };

  const handleAcceptQuoteAsAdmin = async (id) => {
    try {
      const res = await api.post(`/quotations/${id}/respond`, { action: 'accept' });
      if (res.data.success) {
        toast.success('Quotation converted to Confirmed Order by Admin!');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Failed to convert quotation to order');
    }
  };

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
              onClick={() => setActiveTab('quotations')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'quotations'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>Quotations & Pricing</span>
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
            to="/quotations"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>All Quotes</span>
          </Link>

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

      {/* SUB-SECTION 3: QUOTATIONS & COMPONENT PRICING (ADMIN MASTER) */}
      {activeTab === 'quotations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    Customer Solar Quotations & Component Price Overrides
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Admin Superuser Mode
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect customer quotes, independently modify component unit prices, adjust variable government subsidies, and convert directly to confirmed orders.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={quoteSearchTerm}
                    onChange={(e) => setQuoteSearchTerm(e.target.value)}
                    placeholder="Search quote or customer..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <Link
                  to="/enquiries"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> + New Quote
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-3">Quotation #</th>
                    <th className="py-3 px-3">Customer & Contact</th>
                    <th className="py-3 px-3">System / Package</th>
                    <th className="py-3 px-3">Hardware BOM Total</th>
                    <th className="py-3 px-3">DBT Subsidy</th>
                    <th className="py-3 px-3">Net Customer Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {quotations
                    .filter((q) => {
                      const term = quoteSearchTerm.toLowerCase();
                      return (
                        (q.quotationNumber || '').toLowerCase().includes(term) ||
                        (q.customerName || '').toLowerCase().includes(term) ||
                        (q.customerPhone || '').toLowerCase().includes(term)
                      );
                    })
                    .map((q) => (
                      <tr key={q._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{q.quotationNumber}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{q.customerName}</span>
                          <span className="text-[11px] text-slate-400">{q.customerPhone}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-emerald-800">{q.capacityKw} kW</span>
                          <span className="text-[11px] text-slate-400 block">{q.systemType}</span>
                        </td>
                        <td className="py-3 px-3 font-mono">₹{(q.totalAmount || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-emerald-600 font-mono font-semibold">
                          -₹{(q.subsidyAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 font-extrabold text-slate-900 font-mono text-sm">
                          ₹{(q.netPayable || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={q.status} />
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedQuoteForView(q);
                              setIsViewQuoteModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg inline-flex items-center gap-1"
                            title="Inspect Bill of Materials"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditQuote(q)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg inline-flex items-center gap-1"
                            title="Edit Component Prices & Variable Subsidy"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Prices</span>
                          </button>
                          {q.status === 'Sent' && (
                            <button
                              onClick={() => handleAcceptQuoteAsAdmin(q._id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg inline-flex items-center gap-1 shadow-xs"
                              title="Directly convert quote to confirmed order"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Convert to Order</span>
                            </button>
                          )}
                          {q.status === 'Accepted' && (
                            <span className="text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Order Confirmed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN MODAL 1: VIEW QUOTATION BOM */}
      <Modal
        isOpen={isViewQuoteModalOpen}
        onClose={() => setIsViewQuoteModalOpen(false)}
        title={`Quotation Inspection: ${selectedQuoteForView?.quotationNumber || ''}`}
        size="lg"
      >
        <div className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-slate-500 font-bold block">{selectedQuoteForView?.quotationNumber}</span>
              <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                {selectedQuoteForView?.customerName} • {selectedQuoteForView?.capacityKw} kW {selectedQuoteForView?.systemType}
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">{selectedQuoteForView?.customerAddress}</p>
            </div>
            <StatusBadge status={selectedQuoteForView?.status} />
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 font-bold text-slate-800">
              Quoted Components Bill of Materials
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Component Name</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price (₹)</th>
                    <th className="py-2 px-3 text-right">Subtotal (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedQuoteForView?.items || []).map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{it.name}</td>
                      <td className="py-2 px-3 text-slate-500">{it.category}</td>
                      <td className="py-2 px-3 text-center font-bold">{it.quantity}</td>
                      <td className="py-2 px-3 text-right">₹{(it.unitPrice || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{((it.quantity || 1) * (it.unitPrice || 0)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Gross Component Value:</span>
              <span className="font-semibold text-slate-800">₹{(selectedQuoteForView?.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Special Promotional Discount:</span>
              <span className="font-semibold text-rose-600">-₹{(selectedQuoteForView?.discount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Government Subsidy (DBT):</span>
              <span className="font-semibold text-emerald-600">-₹{(selectedQuoteForView?.subsidyAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
              <span className="text-slate-900">Net Customer Payable:</span>
              <span className="text-emerald-700 text-base">₹{(selectedQuoteForView?.netPayable || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Booking Advance Required (20%):</span>
              <span className="font-semibold text-slate-800">₹{(selectedQuoteForView?.advanceRequired || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setIsViewQuoteModalOpen(false)}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ADMIN MODAL 2: EDIT QUOTATION & INDEPENDENT COMPONENT PRICES */}
      <Modal
        isOpen={isEditQuoteModalOpen}
        onClose={() => setIsEditQuoteModalOpen(false)}
        title={`Admin Component Price Override: ${selectedQuoteForEdit?.quotationNumber || ''}`}
        size="xl"
      >
        <form onSubmit={handleSaveQuotePrices} className="space-y-4 text-xs max-h-[82vh] overflow-y-auto pr-1">
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-purple-950 text-sm">{selectedQuoteForEdit?.customerName}</p>
              <p className="text-[11px] text-purple-700">
                {selectedQuoteForEdit?.capacityKw} kW {selectedQuoteForEdit?.systemType} System
              </p>
            </div>
            <span className="px-2.5 py-1 bg-purple-200 text-purple-900 font-bold rounded-lg text-xs">
              Executive Price Control Active
            </span>
          </div>

          {/* Component Pricing Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-800">Component BOM & Independent Price Quoting</span>
              <button
                type="button"
                onClick={handleAddEditItem}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3 h-3" /> Add Component
              </button>
            </div>

            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-600 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Component / Equipment</th>
                    <th className="py-2 px-2">Category</th>
                    <th className="py-2 px-2 text-center w-20">Qty</th>
                    <th className="py-2 px-2 text-right w-32">Unit Price (₹)</th>
                    <th className="py-2 px-3 text-right w-28">Total (₹)</th>
                    <th className="py-2 px-2 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {editQuoteData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemPriceChange(index, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={item.category}
                          onChange={(e) => handleItemPriceChange(index, 'category', e.target.value)}
                          className="w-full px-1.5 py-1.5 border border-slate-200 rounded text-xs text-slate-700 focus:ring-1 focus:ring-emerald-500 outline-none"
                        >
                          <option value="Solar Panel">Solar Panel</option>
                          <option value="Inverter">Inverter</option>
                          <option value="Structure">Structure</option>
                          <option value="Battery">Battery</option>
                          <option value="Balance of System">BOS / Electrical</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemPriceChange(index, 'quantity', e.target.value)}
                          className="w-16 px-1.5 py-1.5 border border-slate-200 rounded text-xs text-center font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={item.unitPrice}
                          onChange={(e) => handleItemPriceChange(index, 'unitPrice', e.target.value)}
                          className="w-28 px-2 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none text-right font-mono"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">
                        ₹{(item.total || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveEditItem(index)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600">Total Hardware Components (BOM):</span>
              <span className="font-extrabold text-sm text-slate-900 font-mono">
                ₹{editQuoteData.items.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Subsidy & Discount Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Special Promotional Discount (₹)</label>
              <input
                type="number"
                min="0"
                value={editQuoteData.discount}
                onChange={(e) => setEditQuoteData({ ...editQuoteData, discount: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Government Subsidy (DBT) (₹)
              </label>
              <input
                type="number"
                min="0"
                value={editQuoteData.subsidyAmount}
                onChange={(e) => setEditQuoteData({ ...editQuoteData, subsidyAmount: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/30 font-bold text-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />

              {/* Quick subsidy presets */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                <button
                  type="button"
                  onClick={() => setEditQuoteData({ ...editQuoteData, subsidyAmount: 78000 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 font-semibold"
                >
                  ₹78k (3kW+)
                </button>
                <button
                  type="button"
                  onClick={() => setEditQuoteData({ ...editQuoteData, subsidyAmount: 60000 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 font-semibold"
                >
                  ₹60k (2kW)
                </button>
                <button
                  type="button"
                  onClick={() => setEditQuoteData({ ...editQuoteData, subsidyAmount: 30000 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 font-semibold"
                >
                  ₹30k (1kW)
                </button>
                <button
                  type="button"
                  onClick={() => setEditQuoteData({ ...editQuoteData, subsidyAmount: 0 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-rose-100 text-slate-700 font-semibold"
                >
                  ₹0 (None)
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Recalculated Summary */}
          {(() => {
            const subtotal = editQuoteData.items.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
            const net = Math.max(0, subtotal - Number(editQuoteData.discount || 0) - Number(editQuoteData.subsidyAmount || 0));
            const advance = Math.round(net * 0.2);
            return (
              <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>Gross Hardware Base Value:</span>
                  <span className="font-semibold text-white font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>Special Promotional Rebate:</span>
                  <span className="font-semibold text-rose-300 font-mono">-₹{Number(editQuoteData.discount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>Direct Benefit Transfer (DBT) Subsidy:</span>
                  <span className="font-semibold text-emerald-300 font-mono">-₹{Number(editQuoteData.subsidyAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm">
                  <span className="font-bold text-amber-300">Net Customer Payable:</span>
                  <span className="font-extrabold text-lg text-emerald-400 font-mono">₹{net.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
                  <span>20% Booking Commitment Advance:</span>
                  <span className="font-bold text-amber-200 font-mono">₹{advance.toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })()}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Guarantee & Warranty Notes</label>
            <textarea
              rows={2}
              value={editQuoteData.notes}
              onChange={(e) => setEditQuoteData({ ...editQuoteData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditQuoteModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save Quotation & Prices to MongoDB
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;