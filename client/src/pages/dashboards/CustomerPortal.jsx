import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  Sun,
  ShieldCheck,
  FileSpreadsheet,
  Receipt,
  Headphones,
  CheckCircle,
  XCircle,
  PlusCircle,
  Clock,
  ArrowRight,
  Zap,
  MapPin,
  Barcode,
  Search,
  Sparkles,
  CreditCard,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle,
  Wrench,
  Check,
  Eye,
  Printer,
  FileText,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerPortal = () => {
  const { user } = useAuth();

  const [enquiries, setEnquiries] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedOrderForPay, setSelectedOrderForPay] = useState(null);

  // Component & Invoice Inspection Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [isQuoteViewModalOpen, setIsQuoteViewModalOpen] = useState(false);
  const [selectedQuoteForView, setSelectedQuoteForView] = useState(null);

  // Forms dynamically bound to the authenticated user
  const [enquiryForm, setEnquiryForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    systemType: 'On-Grid',
    proposedCapacity: 3,
    monthlyBill: 3500,
    shadowFreeArea: 400
  });

  const [ticketForm, setTicketForm] = useState({
    issueCategory: 'Inverter Fault',
    faultCode: 'ERR-302',
    serialNumber: '',
    description: '',
    priority: 'High'
  });

  const [payAmount, setPayAmount] = useState(25000);

  // Rapid Serial Number / Barcode Warranty Verification in Customer Portal
  const [customerSerialSearch, setCustomerSerialSearch] = useState('');
  const [customerSerialResult, setCustomerSerialResult] = useState(null);
  const [isVerifyingCustomerSerial, setIsVerifyingCustomerSerial] = useState(false);

  const handleVerifyCustomerSerial = async (e) => {
    e?.preventDefault();
    if (!customerSerialSearch.trim()) return;

    setIsVerifyingCustomerSerial(true);
    try {
      const res = await api.get(`/warranties/verify/${encodeURIComponent(customerSerialSearch.trim())}`);
      if (res.data.success) {
        setCustomerSerialResult(res.data);
        toast.success(`Warranty record verified: ${res.data.isUnderWarranty ? 'ACTIVE (Free Coverage)' : 'OUT OF WARRANTY'}`);
      }
    } catch (err) {
      setCustomerSerialResult(null);
      toast.error(err.response?.data?.message || 'No warranty record found for this serial/phone number');
    } finally {
      setIsVerifyingCustomerSerial(false);
    }
  };

  // Keep form fields synced when auth user is available
  useEffect(() => {
    if (user) {
      setEnquiryForm((prev) => ({
        ...prev,
        name: user.name || prev.name || '',
        phone: user.phone || prev.phone || '',
        email: user.email || prev.email || '',
        address: user.address || prev.address || ''
      }));
    }
  }, [user]);

  const fetchCustomerData = async () => {
    try {
      const [enqRes, surRes, quoRes, ordRes, invRes, warRes, tktRes, payRes] = await Promise.all([
        api.get('/enquiries'),
        api.get('/surveys'),
        api.get('/quotations'),
        api.get('/orders'),
        api.get('/invoices'),
        api.get('/warranties'),
        api.get('/service-tickets'),
        api.get('/payments')
      ]);

      if (enqRes.data.success) setEnquiries(enqRes.data.enquiries || []);
      if (surRes.data.success) setSurveys(surRes.data.surveys || []);
      if (quoRes.data.success) setQuotations(quoRes.data.quotations || []);
      if (ordRes.data.success) setOrders(ordRes.data.orders || []);
      if (invRes.data.success) setInvoices(invRes.data.invoices || []);
      if (warRes.data.success) setWarranties(warRes.data.warranties || []);
      if (tktRes.data.success) setTickets(tktRes.data.tickets || []);
      if (payRes.data.success) setPayments(payRes.data.payments || []);
    } catch (err) {
      console.error('Error fetching customer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleRespondQuotation = async (quotationId, action) => {
    try {
      const res = await api.post(`/quotations/${quotationId}/respond`, {
        action,
        feedback: action === 'accept' ? 'Approved through customer online portal' : 'Declined by customer'
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchCustomerData();
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...enquiryForm,
        name: (enquiryForm.name || user?.name || '').trim(),
        phone: (enquiryForm.phone || user?.phone || '').trim(),
        email: (enquiryForm.email || user?.email || '').trim(),
        address: (enquiryForm.address || user?.address || '').trim()
      };

      if (!payload.name || !payload.phone) {
        toast.error('Name and Phone number are required');
        return;
      }

      const res = await api.post('/enquiries', payload);
      if (res.data.success) {
        toast.success('Rooftop solar request submitted! Our engineering team will contact you.');
        setIsEnquiryModalOpen(false);
        fetchCustomerData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting enquiry');
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customerName: (user?.name || enquiryForm.name || 'Customer').trim(),
        customerPhone: (user?.phone || enquiryForm.phone || '').trim(),
        customerEmail: (user?.email || enquiryForm.email || '').trim(),
        customerAddress: (user?.address || enquiryForm.address || '').trim(),
        ...ticketForm
      };

      if (!payload.customerPhone || !payload.description) {
        toast.error('Phone number and issue description are required');
        return;
      }

      const res = await api.post('/service-tickets', payload);
      if (res.data.success) {
        toast.success(`Ticket ${res.data.ticket.ticketNumber} logged! Warranty: ${res.data.warrantyStatus}`);
        setIsTicketModalOpen(false);
        setTicketForm({
          issueCategory: 'Inverter Fault',
          faultCode: '',
          serialNumber: '',
          description: '',
          priority: 'High'
        });
        fetchCustomerData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not log ticket');
    }
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    if (!selectedOrderForPay) return;

    try {
      const res = await api.post('/payments', {
        orderId: selectedOrderForPay._id,
        amount: Number(payAmount),
        paymentType: 'Milestone',
        paymentMethod: 'UPI',
        transactionRef: `UPI-${Date.now().toString().slice(-8)}`
      });
      if (res.data.success) {
        toast.success(`Payment of ₹${payAmount.toLocaleString('en-IN')} confirmed! Receipt issued.`);
        setIsPayModalOpen(false);
        fetchCustomerData();
      }
    } catch (err) {
      toast.error('Payment processing failed');
    }
  };

  // Helper to open invoice modal for an order
  const handleOpenOrderInvoice = (order) => {
    // Find matching invoice or construct invoice view from order
    const matchingInv = invoices.find((inv) => inv.orderId === order._id || inv.orderNumber === order.orderNumber);
    if (matchingInv) {
      setSelectedInvoice(matchingInv);
    } else {
      setSelectedInvoice({
        invoiceNumber: `INV-${order.orderNumber?.replace('ORD-', '') || '2026-0001'}`,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        customerAddress: order.customerAddress,
        systemType: order.systemType,
        capacityKw: order.capacityKw,
        items: order.bomItems || [],
        subtotal: order.totalAmount,
        discount: 0,
        subsidyDeduction: order.subsidyAmount,
        grandTotal: order.netPayable,
        paidAmount: order.advancePaid,
        balanceDue: order.balanceDue,
        status: order.balanceDue === 0 ? 'Fully Paid' : 'Partially Paid',
        createdAt: order.createdAt
      });
    }
    setIsInvoiceModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const latestOrder = orders[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold mb-3">
            <Sun className="w-3.5 h-3.5 text-amber-300" /> Homeowner Solar Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Valued Homeowner'}!
          </h1>
          <p className="text-sm text-emerald-100 mt-2 leading-relaxed">
            Track your solar requests, inspect certified component bills & tax invoices, approve quotations, monitor live installation milestones, and manage 20-year certified warranties.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200 mt-3">
            {user?.phone && (
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full">
                <Phone className="w-3 h-3 text-emerald-300" /> {user.phone}
              </span>
            )}
            {user?.email && (
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full">
                <Mail className="w-3 h-3 text-emerald-300" /> {user.email}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Request Rooftop Solar System
            </button>
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-all backdrop-blur-sm border border-white/20 flex items-center gap-1.5"
            >
              <Headphones className="w-4 h-4 text-emerald-200" /> Raise Service Complaint
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Solar Requests"
          value={enquiries.length}
          subtext={`${enquiries.filter((e) => e.status === 'New').length} pending review`}
          icon={Sun}
          color="amber"
        />
        <StatCard
          title="Quotations Received"
          value={quotations.length}
          subtext={`${quotations.filter((q) => q.status === 'Sent').length} awaiting decision`}
          icon={FileSpreadsheet}
          color="blue"
        />
        <StatCard
          title="Commissioned Plants"
          value={orders.length}
          subtext="Active rooftop installations"
          icon={Zap}
          color="emerald"
        />
        <StatCard
          title="Service & Maintenance"
          value={tickets.length}
          subtext={`${tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length} resolved`}
          icon={Headphones}
          color="purple"
        />
      </div>

      {/* Quotations Awaiting Customer Decision */}
      {quotations.filter((q) => q.status === 'Sent').length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-amber-950">Quotation Ready for Your Approval!</h2>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
              Action Required
            </span>
          </div>
          <p className="text-xs text-amber-800 mb-4">
            Our solar engineers have prepared a verified solar package quote with complete itemized component pricing based on your rooftop survey. Inspect components and approve below.
          </p>

          <div className="space-y-3">
            {quotations
              .filter((q) => q.status === 'Sent')
              .map((quote) => (
                <div
                  key={quote._id}
                  className="p-4 rounded-xl bg-white border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500">{quote.quotationNumber}</span>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">
                      {quote.capacityKw} kW {quote.systemType} Solar Package
                    </h3>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-600 mt-2">
                      <span>Base Value: <strong>₹{quote.totalAmount?.toLocaleString('en-IN')}</strong></span>
                      <span className="text-emerald-600 font-semibold">
                        Subsidy (DBT): -₹{quote.subsidyAmount?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-slate-900 font-bold">
                        Net Payable: ₹{quote.netPayable?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedQuoteForView(quote);
                        setIsQuoteViewModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-blue-600" /> View Components & BOM
                    </button>
                    <button
                      onClick={() => handleRespondQuotation(quote._id, 'reject')}
                      className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl font-semibold text-xs transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleRespondQuotation(quote._id, 'accept')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Accept Quotation & Order
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SECTION 1: Customer's Rooftop Solar Requests & Site Surveys */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" /> My Rooftop Solar Requests & Survey Status
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking of your feasibility requests, scheduled engineer roof surveys, and quotation readiness.
            </p>
          </div>
          <button
            onClick={() => setIsEnquiryModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-xl text-xs flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" /> New Solar Request
          </button>
        </div>

        {enquiries.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Sun className="w-10 h-10 text-amber-400 mx-auto mb-2 opacity-80" />
            <h3 className="font-bold text-sm text-slate-800">No Solar Requests Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Ready to save up to 80% on electricity bills? Submit your rooftop solar feasibility request now and our field engineer will schedule a site visit.
            </p>
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
            >
              + Submit Rooftop Solar Request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {enquiries.map((enq) => {
              const matchingSurvey = surveys.find(
                (s) => s.enquiryId === enq._id || (s.customerPhone && s.customerPhone === enq.customerPhone)
              );

              return (
                <div
                  key={enq._id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {enq.proposedCapacity || 3} kW {enq.systemType || 'On-Grid'} Solar System
                        </span>
                        <StatusBadge status={enq.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" /> {enq.customerName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {enq.customerPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> Requested: {new Date(enq.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" /> {enq.address || 'Address on file'}
                      </p>
                    </div>

                    <div className="sm:text-right space-y-1 bg-white sm:bg-transparent p-2 sm:p-0 rounded-lg border sm:border-0 border-slate-200">
                      <div className="text-slate-600">
                        Monthly Bill: <strong className="text-slate-800">₹{(enq.monthlyBill || 0).toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Shadow-free roof: <strong>{enq.shadowFreeArea || 0} sq ft</strong>
                      </div>
                    </div>
                  </div>

                  {matchingSurvey && (
                    <div className="mt-3 pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
                      <div className="flex items-center gap-2 text-emerald-900 font-medium">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>
                          Site Survey Visit: <strong>{new Date(matchingSurvey.scheduledDate).toLocaleDateString()}</strong> by Engineer <strong>{matchingSurvey.technicianName}</strong>
                        </span>
                      </div>
                      <StatusBadge status={matchingSurvey.status} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Active System, Installation Tracker & Itemized Invoice */}
      {latestOrder && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Your Rooftop Solar Project</span>
              <h2 className="text-lg font-bold text-slate-900">{latestOrder.capacityKw} kW {latestOrder.systemType} System</h2>
            </div>
            <StatusBadge status={latestOrder.status} />
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-100 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-600 uppercase block">1. Quotation & Order</span>
              <span className="font-semibold text-slate-800 mt-1 block">Confirmed ✓</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-600 uppercase block">2. Warehouse Packing</span>
              <span className="font-semibold text-slate-800 mt-1 block">Serials Scanned ✓</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-600 uppercase block">3. Dispatch & Truck</span>
              <span className="font-semibold text-slate-800 mt-1 block">Delivered on Site ✓</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">4. Installation & Sync</span>
              <span className="font-semibold text-emerald-950 mt-1 block">Live & Warranted ✓</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <p className="text-slate-500">
                Order: <strong>{latestOrder.orderNumber}</strong> • Balance Due:{' '}
                <span className="text-rose-600 font-bold">₹{(latestOrder.balanceDue || 0).toLocaleString('en-IN')}</span>
              </p>
              <p className="text-slate-500">Site Location: {latestOrder.customerAddress}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenOrderInvoice(latestOrder)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> View Installation Components & Invoice
              </button>
              {latestOrder.balanceDue > 0 && (
                <button
                  onClick={() => {
                    setSelectedOrderForPay(latestOrder);
                    setPayAmount(latestOrder.balanceDue);
                    setIsPayModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <CreditCard className="w-4 h-4" /> Pay Balance Online
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Service & Maintenance Tickets */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Headphones className="w-5 h-5 text-purple-600" /> My Service & Maintenance Requests
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track open complaints, inverter error diagnostics, assigned support technicians, and resolution logs.
            </p>
          </div>
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="px-3.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold rounded-xl text-xs flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Raise Complaint
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h3 className="font-bold text-sm text-slate-800">No Active Service Complaints</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your solar system is operating normally. If you ever experience generation issues, error codes, or require routine panel cleaning, submit a ticket anytime.
            </p>
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs transition-all shadow-xs"
            >
              Raise Service Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((tkt) => (
              <div
                key={tkt._id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-purple-300 transition-all text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        {tkt.ticketNumber}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{tkt.issueCategory}</span>
                      <StatusBadge status={tkt.status} />
                      {tkt.isUnderWarranty ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Warranty Covered (Free)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Standard Fee: ₹{tkt.costBilledToCustomer || 2500}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-700 font-medium">{tkt.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px]">
                      <span>Fault Code: <strong className="text-slate-700">{tkt.faultCode || 'None'}</strong></span>
                      <span>Product: <strong className="text-slate-700">{tkt.productName || 'Solar Inverter'}</strong></span>
                      {tkt.serialNumber && tkt.serialNumber !== 'NOT-PROVIDED' && (
                        <span>Serial: <strong className="font-mono text-slate-700">{tkt.serialNumber}</strong></span>
                      )}
                      <span>Assigned Tech: <strong className="text-purple-700">{tkt.assignedTechnicianName || 'Support Team'}</strong></span>
                      <span>Logged: <strong>{new Date(tkt.createdAt).toLocaleDateString()}</strong></span>
                    </div>
                  </div>

                  <div className="sm:text-right flex-shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        tkt.priority === 'Urgent' || tkt.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tkt.priority} Priority
                    </span>
                  </div>
                </div>

                {tkt.resolutionNotes && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-slate-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                    <strong className="text-emerald-800">Technician Resolution:</strong> {tkt.resolutionNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Active Warranties & Invoices/Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warranty Certificates */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Active Warranty Certificates
              </h3>
              <span className="text-xs text-slate-400 font-semibold">{warranties.length} Certified Devices</span>
            </div>

            {/* Quick Equipment Serial Number Scanner / Lookup */}
            <form onSubmit={handleVerifyCustomerSerial} className="mb-3.5 flex gap-1.5">
              <div className="relative flex-1">
                <Barcode className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={customerSerialSearch}
                  onChange={(e) => setCustomerSerialSearch(e.target.value)}
                  placeholder="Verify Equipment Serial (e.g. INV-3KW-8842 or phone)..."
                  className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isVerifyingCustomerSerial}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 flex items-center gap-1 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Verify</span>
              </button>
            </form>

            {/* Verification Result Card if Searched */}
            {customerSerialResult && (
              <div className="mb-3.5 p-3 rounded-xl bg-slate-900 text-white text-xs border border-emerald-500/40">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-700">
                  <span className="font-mono font-bold text-emerald-300">
                    {customerSerialResult.warranty?.serialNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    customerSerialResult.isUnderWarranty ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                  }`}>
                    {customerSerialResult.isUnderWarranty ? '✓ UNDER WARRANTY' : 'EXPIRED'}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Equipment</span>
                    <span className="font-medium text-white">{customerSerialResult.warranty?.productName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Valid Until</span>
                    <span className="font-medium text-white">
                      {new Date(customerSerialResult.warranty?.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-semibold">
                    {customerSerialResult.isUnderWarranty ? 'Zero-Cost Free Replacement / Repair' : 'Standard Out-of-Warranty Service'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketForm((prev) => ({
                        ...prev,
                        serialNumber: customerSerialResult.warranty?.serialNumber || customerSerialSearch,
                        issueCategory: 'Inverter Fault'
                      }));
                      setIsTicketModalOpen(true);
                    }}
                    className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-[10px]"
                  >
                    Raise Ticket
                  </button>
                </div>
              </div>
            )}

            {warranties.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                Warranty certificates are issued upon solar plant commissioning.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {warranties.map((war) => (
                  <div
                    key={war._id}
                    className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950">{war.productName}</span>
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-200 text-emerald-900">
                        {war.warrantyYears} Years Protection
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 pt-0.5">
                      <span className="font-mono text-slate-500 flex items-center gap-1 text-[11px]">
                        <Barcode className="w-3.5 h-3.5" /> {war.serialNumber}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Valid till: <strong>{new Date(war.endDate).toLocaleDateString()}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Official Tax Invoices & Payment Receipts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" /> Tax Invoices & Receipts
            </h3>
            <span className="text-xs text-slate-400">{invoices.length + payments.length} Documents</span>
          </div>

          {invoices.length === 0 && payments.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              Official tax invoices and payment receipts will appear here upon order confirmation.
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {/* Invoices */}
              {invoices.map((inv) => (
                <div
                  key={inv._id}
                  className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-emerald-900">{inv.invoiceNumber}</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Order: {inv.orderNumber} • {inv.capacityKw} kW {inv.systemType}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 text-sm">
                        ₹{inv.grandTotal?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold block">{inv.status}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setIsInvoiceModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </div>
                </div>
              ))}

              {/* Payment Receipts */}
              {payments.map((pay) => (
                <div
                  key={pay._id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900">{pay.receiptNo}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Order: {pay.orderNumber} • Method: {pay.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-700 text-sm">
                      ₹{pay.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(pay.paymentDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Official Tax Invoice & Installation Component Bill */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Official Tax Invoice & Installation Components"
      >
        <div id="printable-invoice" className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
          {/* Invoice Header */}
          <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-emerald-400 font-extrabold text-base tracking-tight flex items-center gap-1.5">
                  <Sun className="w-5 h-5 text-amber-400" /> SunPower Solar Solutions Pvt. Ltd.
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Ministry of New and Renewable Energy (MNRE) Empanelled Rooftop Installer
                </p>
                <p className="text-[10px] text-slate-400">GSTIN: 27AABCS1429E1Z8 • Pune, Maharashtra</p>
              </div>
              <div className="sm:text-right">
                <span className="font-mono text-sm font-bold text-amber-300 block">
                  {selectedInvoice?.invoiceNumber}
                </span>
                <span className="text-[11px] text-slate-300 block">
                  Date: {selectedInvoice?.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </span>
                <span className="text-[10px] text-emerald-300 uppercase font-semibold">
                  Status: {selectedInvoice?.status || 'Issued'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & System Particulars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Particulars:</span>
              <p className="font-bold text-sm text-slate-900 mt-0.5">{selectedInvoice?.customerName}</p>
              <p className="text-slate-600 mt-0.5">{selectedInvoice?.customerPhone}</p>
              <p className="text-slate-600 text-[11px] mt-0.5">{selectedInvoice?.customerAddress}</p>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Installation Project:</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {selectedInvoice?.capacityKw} kW {selectedInvoice?.systemType} Rooftop Plant
              </p>
              <p className="text-slate-600 mt-0.5">Order Ref: {selectedInvoice?.orderNumber || 'Standard Package'}</p>
              <p className="text-emerald-700 font-semibold text-[11px] mt-0.5">
                Certified DBT Subsidy Eligible: Yes ✓
              </p>
            </div>
          </div>

          {/* Itemized Components Used in Installation */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-3.5 py-2 font-bold text-slate-800 flex items-center justify-between">
              <span>List of Components Used in Installation (Bill of Materials)</span>
              <span className="text-[11px] font-normal text-slate-500">
                {(selectedInvoice?.items || []).length} Verified Items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Equipment / Component</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price (₹)</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedInvoice?.items || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        Component package details linked with Order {selectedInvoice?.orderNumber}
                      </td>
                    </tr>
                  ) : (
                    (selectedInvoice?.items || []).map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{it.name}</span>
                          {it.allocatedSerials && it.allocatedSerials.length > 0 && (
                            <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5 inline-block">
                              Serials: {it.allocatedSerials.join(', ')}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{it.category}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-700">₹{(it.unitPrice || 0).toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          ₹{((it.quantity || 1) * (it.unitPrice || 0)).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Totals Statement */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Gross Component Base Value:</span>
              <span className="font-semibold text-slate-800">
                ₹{(selectedInvoice?.subtotal || selectedInvoice?.grandTotal || 0).toLocaleString('en-IN')}
              </span>
            </div>
            {selectedInvoice?.discount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Special Promotional Rebate:</span>
                <span className="font-semibold text-rose-600">-₹{selectedInvoice.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Direct Benefit Transfer (DBT) Subsidy:</span>
              <span className="font-semibold text-emerald-700">
                -₹{(selectedInvoice?.subsidyDeduction || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Net Invoice Amount Payable:</span>
              <span className="text-emerald-700">₹{(selectedInvoice?.grandTotal || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Amount Paid to Date:</span>
              <span className="font-semibold text-slate-900">
                ₹{(selectedInvoice?.paidAmount || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-rose-600">
              <span>Balance Due:</span>
              <span>₹{(selectedInvoice?.balanceDue || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-[11px] text-slate-400 text-center italic">
            Certified installation backed by SunPower 20-year linear performance warranty. All panels compliant with ALMM.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save Invoice
            </button>
            <button
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: View Quotation Component Bill of Materials (Customer Review) */}
      <Modal
        isOpen={isQuoteViewModalOpen}
        onClose={() => setIsQuoteViewModalOpen(false)}
        title={`Quotation Component Bill: ${selectedQuoteForView?.quotationNumber || ''}`}
      >
        <div className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-slate-500 font-bold block">{selectedQuoteForView?.quotationNumber}</span>
              <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                {selectedQuoteForView?.capacityKw} kW {selectedQuoteForView?.systemType} Solar Package
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Prepared for: {selectedQuoteForView?.customerName}</p>
            </div>
            <StatusBadge status={selectedQuoteForView?.status} />
          </div>

          {/* Component Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 font-bold text-slate-800">
              Quoted Components Bill of Materials
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Component / Equipment</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price (₹)</th>
                    <th className="py-2 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedQuoteForView?.items || []).map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{it.name}</td>
                      <td className="py-2 px-3 text-slate-500">{it.category}</td>
                      <td className="py-2 px-3 text-center font-bold text-slate-800">{it.quantity}</td>
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

          {/* Financial Breakdown */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Gross Component Base Value:</span>
              <span className="font-semibold text-slate-800">
                ₹{selectedQuoteForView?.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Special Promotional Discount:</span>
              <span className="font-semibold text-rose-600">
                -₹{(selectedQuoteForView?.discount || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Government DBT Subsidy Deduction:</span>
              <span className="font-semibold text-emerald-600">
                -₹{selectedQuoteForView?.subsidyAmount?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Net Customer Payable:</span>
              <span className="text-emerald-700">₹{selectedQuoteForView?.netPayable?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
              <span>20% Booking Commitment Advance:</span>
              <span className="font-bold text-slate-800">
                ₹{selectedQuoteForView?.advanceRequired?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            {selectedQuoteForView?.status === 'Sent' && (
              <>
                <button
                  onClick={() => {
                    handleRespondQuotation(selectedQuoteForView._id, 'reject');
                    setIsQuoteViewModalOpen(false);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-lg font-semibold text-xs transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => {
                    handleRespondQuotation(selectedQuoteForView._id, 'accept');
                    setIsQuoteViewModalOpen(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                >
                  Accept & Confirm Order
                </button>
              </>
            )}
            <button
              onClick={() => setIsQuoteViewModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: New Solar Request */}
      <Modal isOpen={isEnquiryModalOpen} onClose={() => setIsEnquiryModalOpen(false)} title="Submit Rooftop Solar Request">
        <form onSubmit={handleCreateEnquiry} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Full Name *</label>
              <input
                type="text"
                required
                value={enquiryForm.name}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                placeholder="e.g. Ramesh Sharma"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={enquiryForm.phone}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={enquiryForm.email}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                placeholder="e.g. user@gmail.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Desired Capacity</label>
              <select
                value={enquiryForm.proposedCapacity}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, proposedCapacity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value={1}>1 kW (2 Panels, saves ~₹1,200/mo)</option>
                <option value={2}>2 kW (4 Panels, saves ~₹2,500/mo)</option>
                <option value={3}>3 kW (6 Panels, saves ~₹3,800/mo)</option>
                <option value={5}>5 kW (10 Panels, saves ~₹6,500/mo)</option>
                <option value={10}>10 kW (Commercial / Large Home)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Installation Address *</label>
            <input
              type="text"
              required
              value={enquiryForm.address}
              onChange={(e) => setEnquiryForm({ ...enquiryForm, address: e.target.value })}
              placeholder="e.g. Flat 301, Sunshine Heights, Pune"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">System Type</label>
              <select
                value={enquiryForm.systemType}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, systemType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="On-Grid">On-Grid (Lower bill, grid connection)</option>
                <option value="Off-Grid">Off-Grid (Power cuts backup with batteries)</option>
                <option value="Hybrid">Hybrid (Grid + Battery backup)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Bill (₹)</label>
              <input
                type="number"
                value={enquiryForm.monthlyBill}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, monthlyBill: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Roof Area (Sq Ft)</label>
              <input
                type="number"
                value={enquiryForm.shadowFreeArea}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, shadowFreeArea: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEnquiryModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
            >
              Submit Rooftop Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Service Complaint */}
      <Modal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} title="Raise Service & Maintenance Request">
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-purple-900">
            <p className="font-semibold">
              Submitting for: <span className="font-bold">{user?.name || 'Customer'}</span> ({user?.phone || 'Phone on profile'})
            </p>
            <p className="text-[11px] text-purple-700 mt-0.5">
              Tickets are automatically checked against your active warranties for free parts replacement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Category *</label>
              <select
                value={ticketForm.issueCategory}
                onChange={(e) => setTicketForm({ ...ticketForm, issueCategory: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Inverter Fault">Inverter Red LED / Fault Code</option>
                <option value="Zero Generation">Solar App Shows Zero Generation</option>
                <option value="Battery Problem">Battery Not Charging</option>
                <option value="Physical Damage">Physical Module Damage</option>
                <option value="Cleaning & Routine Check">Routine Maintenance Request</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={ticketForm.priority}
                onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Low">Low (General inquiry / cleaning)</option>
                <option value="Medium">Medium (Minor issue)</option>
                <option value="High">High (Generation reduced)</option>
                <option value="Urgent">Urgent (Complete shutdown)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fault Code (if visible)</label>
              <input
                type="text"
                value={ticketForm.faultCode}
                onChange={(e) => setTicketForm({ ...ticketForm, faultCode: e.target.value })}
                placeholder="e.g. ERR-302, E-01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Equipment Serial Number (optional)</label>
              {warranties.length > 0 ? (
                <select
                  value={ticketForm.serialNumber}
                  onChange={(e) => setTicketForm({ ...ticketForm, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">Select from installed equipment</option>
                  {warranties.map((w) => (
                    <option key={w._id} value={w.serialNumber}>
                      {w.productName} ({w.serialNumber})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={ticketForm.serialNumber}
                  onChange={(e) => setTicketForm({ ...ticketForm, serialNumber: e.target.value })}
                  placeholder="e.g. INV-3KW-8842"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description of Issue *</label>
            <textarea
              rows={3}
              required
              value={ticketForm.description}
              onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              placeholder="Describe what happened, when the problem started, and current behavior..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTicketModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm"
            >
              Submit Service Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Make Payment */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Make Online Payment">
        <form onSubmit={handleMakePayment} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500">Order: {selectedOrderForPay?.orderNumber}</span>
            <div className="text-sm font-bold text-slate-900 mt-1">
              Outstanding Balance: ₹{(selectedOrderForPay?.balanceDue || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹) *</label>
            <input
              type="number"
              required
              min={100}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-emerald-800 text-base focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Payment Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg border-2 border-emerald-500 bg-emerald-50/50 font-semibold text-center cursor-pointer">
                UPI / NetBanking / Cards
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 text-center text-slate-500 cursor-not-allowed">
                NEFT / RTGS Direct
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
            >
              Authorize ₹{Number(payAmount).toLocaleString('en-IN')} Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerPortal;
