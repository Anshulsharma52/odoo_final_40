import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  Sun,
  ShieldCheck,
  FileSpreadsheet,
  ShoppingBag,
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
  Sparkles,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerPortal = () => {
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedOrderForPay, setSelectedOrderForPay] = useState(null);

  // Forms
  const [enquiryForm, setEnquiryForm] = useState({
    name: 'Sunil Mehta',
    phone: '+91 98208 80008',
    email: 'customer@gmail.com',
    address: 'B-402, Green Acres Society, Baner, Pune 411045',
    systemType: 'On-Grid',
    proposedCapacity: 3,
    monthlyBill: 4200,
    shadowFreeArea: 400
  });

  const [ticketForm, setTicketForm] = useState({
    issueCategory: 'Inverter Fault',
    faultCode: 'ERR-302',
    description: 'Zero power being generated after thunderstorm. Inverter showing fault code.',
    priority: 'High'
  });

  const [payAmount, setPayAmount] = useState(25000);

  const fetchCustomerData = async () => {
    try {
      const [quoRes, ordRes, warRes, tktRes, payRes] = await Promise.all([
        api.get('/quotations'),
        api.get('/orders'),
        api.get('/warranties'),
        api.get('/service-tickets'),
        api.get('/payments')
      ]);

      if (quoRes.data.success) setQuotations(quoRes.data.quotations);
      if (ordRes.data.success) setOrders(ordRes.data.orders);
      if (warRes.data.success) setWarranties(warRes.data.warranties);
      if (tktRes.data.success) setTickets(tktRes.data.tickets);
      if (payRes.data.success) setPayments(payRes.data.payments);
    } catch (err) {
      console.error(err);
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
      const res = await api.post('/enquiries', enquiryForm);
      if (res.data.success) {
        toast.success('Rooftop solar request submitted! Our team will contact you.');
        setIsEnquiryModalOpen(false);
        fetchCustomerData();
      }
    } catch (err) {
      toast.error('Error submitting enquiry');
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/service-tickets', {
        customerName: 'Sunil Mehta',
        customerPhone: '+91 98208 80008',
        ...ticketForm
      });
      if (res.data.success) {
        toast.success(`Ticket ${res.data.ticket.ticketNumber} logged! Warranty: ${res.data.warrantyStatus}`);
        setIsTicketModalOpen(false);
        fetchCustomerData();
      }
    } catch (err) {
      toast.error('Could not log ticket');
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
            Welcome to SunPower Portal
          </h1>
          <p className="text-sm text-emerald-100 mt-2 leading-relaxed">
            Manage your solar quotations, track installation milestone progress, access 20-year digital warranty certificates, and raise service requests.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              + Request New Solar System
            </button>
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="px-4 py-2 bg-white/15 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-all backdrop-blur-sm border border-white/20"
            >
              Raise Service Complaint
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Active Solar Packages"
          value={orders.length}
          subtext="Commissioned rooftop systems"
          icon={Sun}
          color="amber"
        />
        <StatCard
          title="Active Warranties"
          value={warranties.length}
          subtext="Certified panels & inverters"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Quotations Received"
          value={quotations.length}
          subtext="Certified price proposals"
          icon={FileSpreadsheet}
          color="blue"
        />
        <StatCard
          title="Service Tickets"
          value={tickets.length}
          subtext={`${tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length} resolved`}
          icon={Headphones}
          color="purple"
        />
      </div>

      {/* Quotations Awaiting Customer Decision */}
      {quotations.filter(q => q.status === 'Sent').length > 0 && (
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
            Our solar engineers have prepared a verified solar package quote based on your rooftop survey. Accept below to initiate warehouse dispatch & installation.
          </p>

          <div className="space-y-3">
            {quotations.filter(q => q.status === 'Sent').map((quote) => (
              <div key={quote._id} className="p-4 rounded-xl bg-white border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-500">{quote.quotationNumber}</span>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">
                    {quote.capacityKw} kW {quote.systemType} Solar Package
                  </h3>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-600 mt-2">
                    <span>Base Value: <strong>₹{quote.totalAmount?.toLocaleString('en-IN')}</strong></span>
                    <span className="text-emerald-600 font-semibold">Subsidy: -₹{quote.subsidyAmount?.toLocaleString('en-IN')}</span>
                    <span className="text-slate-900 font-bold">Net Payable: ₹{quote.netPayable?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRespondQuotation(quote._id, 'reject')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl font-semibold text-xs transition-colors"
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

      {/* Active System & Installation Tracker */}
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
              <p className="text-slate-500">Order: <strong>{latestOrder.orderNumber}</strong> • Balance Due: <span className="text-rose-600 font-bold">₹{(latestOrder.balanceDue || 0).toLocaleString('en-IN')}</span></p>
              <p className="text-slate-500">Site Location: {latestOrder.customerAddress}</p>
            </div>
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
      )}

      {/* Grid: Active Warranties & Installed Equipment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warranty Certificates */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Active Warranty Certificates
            </h3>
            <span className="text-xs text-slate-400">{warranties.length} Certificates</span>
          </div>

          <div className="space-y-3">
            {warranties.map((war) => (
              <div
                key={war._id}
                className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-sm">{war.productName}</span>
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-200 text-emerald-900">
                    {war.warrantyYears} Years Protection
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 pt-1">
                  <span className="font-mono text-slate-500 flex items-center gap-1">
                    <Barcode className="w-3.5 h-3.5" /> {war.serialNumber}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Valid till: <strong>{new Date(war.endDate).toLocaleDateString()}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices & Payment Receipts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" /> Invoices & Payment Receipts
            </h3>
            <span className="text-xs text-slate-400">{payments.length} Payments</span>
          </div>

          <div className="space-y-3">
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
        </div>
      </div>

      {/* Modal: New Enquiry */}
      <Modal isOpen={isEnquiryModalOpen} onClose={() => setIsEnquiryModalOpen(false)} title="Submit Rooftop Solar Enquiry">
        <form onSubmit={handleCreateEnquiry} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Installation Address *</label>
            <input
              type="text"
              required
              value={enquiryForm.address}
              onChange={(e) => setEnquiryForm({ ...enquiryForm, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">System Type</label>
              <select
                value={enquiryForm.systemType}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, systemType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="On-Grid">On-Grid (Lower bill, grid connection)</option>
                <option value="Off-Grid">Off-Grid (Power cuts backup with batteries)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Desired Capacity</label>
              <select
                value={enquiryForm.proposedCapacity}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, proposedCapacity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value={1}>1 kW (2 Panels, saves ~₹1,200/mo)</option>
                <option value={3}>3 kW (6 Panels, saves ~₹3,800/mo)</option>
                <option value={5}>5 kW (10 Panels, saves ~₹6,500/mo)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Average Monthly Electricity Bill (₹)</label>
              <input
                type="number"
                value={enquiryForm.monthlyBill}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, monthlyBill: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Approx. Shadow-Free Roof Area (Sq Ft)</label>
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
            <label className="block font-semibold text-slate-700 mb-1">Fault Code (if visible on screen)</label>
            <input
              type="text"
              value={ticketForm.faultCode}
              onChange={(e) => setTicketForm({ ...ticketForm, faultCode: e.target.value })}
              placeholder="e.g. ERR-302, E-01"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description of Issue *</label>
            <textarea
              rows={3}
              required
              value={ticketForm.description}
              onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              placeholder="Explain when the problem started..."
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
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
