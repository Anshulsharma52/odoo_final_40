import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  FileQuestion,
  ClipboardCheck,
  FileSpreadsheet,
  PlusCircle,
  Calendar,
  Send,
  CheckCircle,
  Eye,
  Search,
  Filter,
  Trash2,
  Plus,
  Calculator,
  ShieldCheck,
  Layers,
  Printer,
  Receipt,
  Wrench,
  Percent
} from 'lucide-react';
import toast from 'react-hot-toast';

const SalesDashboard = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // Quote Inspection Modal (for reviewing generated quotes)
  const [selectedQuotePreview, setSelectedQuotePreview] = useState(null);
  const [isQuotePreviewModalOpen, setIsQuotePreviewModalOpen] = useState(false);

  // Forms state
  const [newEnquiry, setNewEnquiry] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    systemType: 'On-Grid',
    proposedCapacity: 3,
    monthlyBill: 3000,
    shadowFreeArea: 350,
    electricityConsumerNo: ''
  });

  const [surveySchedule, setSurveySchedule] = useState({
    scheduledDate: '',
    technicianName: 'Rohan Joshi',
    notes: 'Please measure roof tilt and inspect shadow from surrounding trees.'
  });

  // Quote data with independent component pricing & variable subsidy
  const [quoteData, setQuoteData] = useState({
    systemType: 'On-Grid',
    capacityKw: 3,
    items: [],
    discount: 5000,
    subsidyAmount: 78000,
    notes: 'Includes 5-year comprehensive maintenance, DBT subsidy liaison, and certified 20-year panel warranty.'
  });

  const fetchSalesData = async () => {
    try {
      const [enqRes, surRes, quoRes] = await Promise.all([
        api.get('/enquiries'),
        api.get('/surveys'),
        api.get('/quotations')
      ]);
      if (enqRes.data.success) setEnquiries(enqRes.data.enquiries || []);
      if (surRes.data.success) setSurveys(surRes.data.surveys || []);
      if (quoRes.data.success) setQuotations(quoRes.data.quotations || []);
    } catch (err) {
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  // Helper to load default template components & variable subsidy based on kW package
  const loadTemplateItems = async (capacity, sysType) => {
    try {
      const res = await api.get(`/quotations/template?capacityKw=${capacity}&systemType=${sysType}`);
      if (res.data.success && res.data.template) {
        const tmpl = res.data.template;
        setQuoteData((prev) => ({
          ...prev,
          capacityKw: Number(capacity),
          systemType: sysType,
          subsidyAmount: tmpl.subsidyAmount,
          items: tmpl.items.map((it) => ({
            name: it.name,
            category: it.category || 'Solar Equipment',
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
            serialRequired: Boolean(it.serialRequired)
          }))
        }));
      }
    } catch (err) {
      console.error('Failed to load quote template:', err);
    }
  };

  // Open quotation modal for an enquiry
  const handleOpenQuotationModal = (enq) => {
    setSelectedEnquiry(enq);
    const capacity = enq.proposedCapacity || 3;
    const sysType = enq.systemType || 'On-Grid';
    loadTemplateItems(capacity, sysType);
    setIsQuotationModalOpen(true);
  };

  // Handle independent component changes
  const handleItemChange = (index, field, value) => {
    setQuoteData((prev) => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Number(value) || 0 : Number(item.quantity) || 0;
        const price = field === 'unitPrice' ? Number(value) || 0 : Number(item.unitPrice) || 0;
        item.total = qty * price;
      }

      updatedItems[index] = item;
      return { ...prev, items: updatedItems };
    });
  };

  // Add custom component to quote
  const handleAddCustomItem = () => {
    setQuoteData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: '',
          category: 'Switchgear/Earthing',
          quantity: 1,
          unitPrice: 0,
          total: 0,
          serialRequired: false
        }
      ]
    }));
  };

  // Remove component from quote
  const handleRemoveItem = (index) => {
    setQuoteData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Calculate live financial summary
  const componentsSubtotal = (quoteData.items || []).reduce((sum, it) => sum + (Number(it.total) || 0), 0);
  const netPayable = Math.max(0, componentsSubtotal - Number(quoteData.discount || 0) - Number(quoteData.subsidyAmount || 0));
  const advanceRequired = Math.round(netPayable * 0.2); // 20% commitment advance

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/enquiries', newEnquiry);
      if (res.data.success) {
        toast.success('Customer enquiry recorded!');
        setIsEnquiryModalOpen(false);
        setNewEnquiry({
          name: '',
          phone: '',
          email: '',
          address: '',
          systemType: 'On-Grid',
          proposedCapacity: 3,
          monthlyBill: 3000,
          shadowFreeArea: 350,
          electricityConsumerNo: ''
        });
        fetchSalesData();
      }
    } catch (err) {
      toast.error('Failed to create enquiry');
    }
  };

  const handleScheduleSurvey = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    try {
      const res = await api.post('/surveys/schedule', {
        enquiryId: selectedEnquiry._id,
        scheduledDate: surveySchedule.scheduledDate,
        notes: surveySchedule.notes
      });
      if (res.data.success) {
        toast.success(`Survey scheduled for ${selectedEnquiry.customerName}!`);
        setIsSurveyModalOpen(false);
        fetchSalesData();
      }
    } catch (err) {
      toast.error('Error scheduling survey');
    }
  };

  const handleGenerateQuote = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    if (!quoteData.items || quoteData.items.length === 0) {
      toast.error('Please add at least one component to the quotation');
      return;
    }

    try {
      const res = await api.post('/quotations', {
        enquiryId: selectedEnquiry._id,
        customerName: selectedEnquiry.customerName || selectedEnquiry.name,
        customerPhone: selectedEnquiry.customerPhone || selectedEnquiry.phone || '',
        customerEmail: selectedEnquiry.customerEmail || selectedEnquiry.email || '',
        customerAddress: selectedEnquiry.address || selectedEnquiry.customerAddress || '',
        systemType: quoteData.systemType,
        capacityKw: Number(quoteData.capacityKw),
        customItems: quoteData.items, // Pass the independent component pricing
        discount: Number(quoteData.discount) || 0,
        subsidyAmount: Number(quoteData.subsidyAmount) || 0,
        notes: quoteData.notes
      });
      if (res.data.success) {
        toast.success(`Quotation ${res.data.quotation.quotationNumber} generated and sent to customer!`);
        setIsQuotationModalOpen(false);
        fetchSalesData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error generating quotation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales & Quotations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Capture rooftop leads, independently quote component BOM pricing, configure variable DBT subsidies, and dispatch certified quotes.
          </p>
        </div>
        <button
          onClick={() => setIsEnquiryModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Capture New Enquiry
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads & Enquiries"
          value={enquiries.length}
          subtext="Active solar enquiries"
          icon={FileQuestion}
          color="blue"
        />
        <StatCard
          title="Surveys Scheduled"
          value={surveys.length}
          subtext={`${surveys.filter((s) => s.status === 'Completed').length} completed & approved`}
          icon={ClipboardCheck}
          color="amber"
        />
        <StatCard
          title="Quotations Generated"
          value={quotations.length}
          subtext={`${quotations.filter((q) => q.status === 'Accepted').length} accepted orders`}
          icon={FileSpreadsheet}
          color="emerald"
        />
        <StatCard
          title="Quotation Pipeline Value"
          value={`₹${quotations.reduce((sum, q) => sum + (q.netPayable || 0), 0).toLocaleString('en-IN')}`}
          subtext="Total net customer value"
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* SECTION 1: Enquiries Pipeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Enquiries & Rooftop Feasibility Leads</h2>
            <p className="text-xs text-slate-400">Step 1 & 2: Review customer rooftop requirements, schedule surveys, or generate quotes</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Req. Capacity</th>
                <th className="py-3 px-3">Monthly Bill</th>
                <th className="py-3 px-3">Shadow-Free Area</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {enquiries.map((enq) => (
                <tr key={enq._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{enq.customerName}</span>
                    <span className="text-[11px] text-slate-400">{enq.customerPhone} • {enq.address}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-emerald-700">{enq.proposedCapacity} kW</span>
                    <span className="text-[11px] text-slate-400 block">{enq.systemType}</span>
                  </td>
                  <td className="py-3 px-3 font-medium">₹{enq.monthlyBill?.toLocaleString('en-IN')}/mo</td>
                  <td className="py-3 px-3">{enq.shadowFreeArea || 300} sq ft</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={enq.status} />
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5">
                    {enq.status === 'New' && (
                      <button
                        onClick={() => {
                          setSelectedEnquiry(enq);
                          setIsSurveyModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Schedule Survey
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenQuotationModal(enq)}
                      className="px-2.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" /> {enq.status === 'Quoted' ? 'Re-Quote' : 'Generate Quote'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Quotations & Certified Package Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Certified Quotations & Pricing Proposals</h2>
            <p className="text-xs text-slate-400">View sent quotations, component bills of material, and customer decisions</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {quotations.length} Active Quotes
          </span>
        </div>

        {quotations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            No quotations generated yet. Select an enquiry above to quote components and send to customer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Quote #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Package (kW)</th>
                  <th className="py-3 px-3">Components Value</th>
                  <th className="py-3 px-3">DBT Subsidy</th>
                  <th className="py-3 px-3">Net Customer Payable</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {quotations.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{q.quotationNumber}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{q.customerName}</span>
                      <span className="text-[11px] text-slate-400">{q.customerPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-emerald-700">{q.capacityKw} kW</span> {q.systemType}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      ₹{q.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 font-semibold">
                      -₹{q.subsidyAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      ₹{q.netPayable?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedQuotePreview(q);
                          setIsQuotePreviewModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" /> View Components
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Capture Enquiry */}
      <Modal isOpen={isEnquiryModalOpen} onClose={() => setIsEnquiryModalOpen(false)} title="Capture Customer Solar Enquiry">
        <form onSubmit={handleCreateEnquiry} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={newEnquiry.name}
                onChange={(e) => setNewEnquiry({ ...newEnquiry, name: e.target.value })}
                placeholder="e.g. Ramesh Kulkarni"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={newEnquiry.phone}
                onChange={(e) => setNewEnquiry({ ...newEnquiry, phone: e.target.value })}
                placeholder="+91 98230 00000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={newEnquiry.email}
                onChange={(e) => setNewEnquiry({ ...newEnquiry, email: e.target.value })}
                placeholder="customer@email.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Electricity Consumer No.</label>
              <input
                type="text"
                value={newEnquiry.electricityConsumerNo}
                onChange={(e) => setNewEnquiry({ ...newEnquiry, electricityConsumerNo: e.target.value })}
                placeholder="e.g. 02881928374"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Rooftop Address</label>
            <input
              type="text"
              value={newEnquiry.address}
              onChange={(e) => setNewEnquiry({ ...newEnquiry, address: e.target.value })}
              placeholder="House/Plot No, Society, City, Pincode"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">System Type</label>
              <select
                value={newEnquiry.systemType}
                onChange={(e) => setNewEnquiry({ ...newEnquiry, systemType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="On-Grid">On-Grid (Connected to Grid)</option>
                <option value="Off-Grid">Off-Grid (With Battery Backup)</option>
                <option value="Hybrid">Hybrid (Grid + Battery)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Capacity (kW)</label>
              <select
                value={newEnquiry.proposedCapacity}
                onChange={(e) => setNewEnquiry({ ...newEnquiry, proposedCapacity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value={1}>1 kW (Small Home)</option>
                <option value={2}>2 kW (2-3 Bedroom)</option>
                <option value={3}>3 kW (Most Popular Home)</option>
                <option value={5}>5 kW (Commercial / High Load)</option>
                <option value={10}>10 kW (Commercial Rooftop)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Electricity Bill (₹)</label>
              <input
                type="number"
                value={newEnquiry.monthlyBill}
                onChange={(e) => setNewEnquiry({ ...newEnquiry, monthlyBill: e.target.value })}
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
              Save Enquiry
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Schedule Site Survey */}
      <Modal isOpen={isSurveyModalOpen} onClose={() => setIsSurveyModalOpen(false)} title={`Schedule Site Survey: ${selectedEnquiry?.customerName}`}>
        <form onSubmit={handleScheduleSurvey} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
            Assigning a technician to visit {selectedEnquiry?.customerName}'s roof at <strong>{selectedEnquiry?.address}</strong> to record direction, tilt, shadow analysis, and cable length.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Survey Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={surveySchedule.scheduledDate}
                onChange={(e) => setSurveySchedule({ ...surveySchedule, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Survey Technician</label>
              <input
                type="text"
                readOnly
                value="Rohan Joshi (Senior Roof Surveyor)"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Special Inspection Instructions</label>
            <textarea
              rows={3}
              value={surveySchedule.notes}
              onChange={(e) => setSurveySchedule({ ...surveySchedule, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSurveyModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
            >
              Confirm Survey Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Generate Ready-Template Quotation with Independent Component Quoting & Variable Subsidy */}
      <Modal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        title={`Generate Solar Quotation for ${selectedEnquiry?.customerName || 'Customer'}`}
      >
        <form onSubmit={handleGenerateQuote} className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
          {/* Header Note */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
            <Calculator className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-xs">Independent Component Quoting & Variable DBT Subsidy</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Sales engineers can independently customize each component price and quantity. Government DBT subsidy auto-adapts by kW capacity package and can be customized freely.
              </p>
            </div>
          </div>

          {/* Package Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">System Type</label>
              <select
                value={quoteData.systemType}
                onChange={(e) => {
                  const newType = e.target.value;
                  loadTemplateItems(quoteData.capacityKw, newType);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="On-Grid">On-Grid (Connected to Grid - DBT Eligible)</option>
                <option value="Off-Grid">Off-Grid (With Battery Backup Bank)</option>
                <option value="Hybrid">Hybrid (Dual Mode Grid + Battery)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Capacity Package (kW)</label>
              <select
                value={quoteData.capacityKw}
                onChange={(e) => {
                  const newCap = Number(e.target.value);
                  loadTemplateItems(newCap, quoteData.systemType);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value={1}>1 kW Package (2x Panels + 1kW Inverter - ₹30k Subsidy)</option>
                <option value={2}>2 kW Package (4x Panels + 2kW Inverter - ₹60k Subsidy)</option>
                <option value={3}>3 kW Package (6x Panels + 3kW Inverter - ₹78k Subsidy)</option>
                <option value={4}>4 kW Package (8x Panels + 4kW Dual-MPPT - ₹78k Subsidy)</option>
                <option value={5}>5 kW Package (10x Panels + 5kW Dual-MPPT - ₹78k Subsidy)</option>
                <option value={10}>10 kW Commercial Package (20x Panels + 10kW Three-Phase)</option>
              </select>
            </div>
          </div>

          {/* SECTION: Independent Component Pricing Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" /> Bill of Materials & Component Price Quoting
              </span>
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-semibold text-[11px] flex items-center gap-1 self-start sm:self-auto transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Component Row
              </button>
            </div>

            <div className="overflow-x-auto p-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="pb-2 font-semibold">Component / Equipment</th>
                    <th className="pb-2 font-semibold">Category</th>
                    <th className="pb-2 font-semibold w-16">Qty</th>
                    <th className="pb-2 font-semibold w-28">Unit Price (₹)</th>
                    <th className="pb-2 font-semibold w-24 text-right">Total (₹)</th>
                    <th className="pb-2 font-semibold w-8 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(quoteData.items || []).map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          placeholder="e.g. 540W Mono PERC Panel"
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <select
                          value={item.category}
                          onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                          className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                        >
                          <option value="Solar Panel">Solar Panel</option>
                          <option value="Inverter">Inverter</option>
                          <option value="Battery">Battery</option>
                          <option value="Structure/Stand">Structure/Stand</option>
                          <option value="Wire/Cable">Wire/Cable</option>
                          <option value="Switchgear/Earthing">Switchgear/Earthing</option>
                          <option value="Installation/Service">Installation/Service</option>
                          <option value="Miscellaneous">Miscellaneous</option>
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-16 px-2 py-1.5 border border-slate-200 rounded text-xs text-center focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          min="0"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-28 px-2 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 text-right font-bold text-slate-900 pr-1">
                        ₹{(item.total || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
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
              <span className="font-semibold text-slate-600">Total Components Sum (BOM):</span>
              <span className="font-extrabold text-sm text-slate-900">₹{componentsSubtotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* SECTION: Variable Subsidy & Discounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Special Discount (₹)</label>
              <input
                type="number"
                min="0"
                value={quoteData.discount}
                onChange={(e) => setQuoteData({ ...quoteData, discount: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Government Subsidy (DBT) (₹) <span className="text-[10px] text-emerald-600 font-normal">(Variable per kW)</span>
              </label>
              <input
                type="number"
                min="0"
                value={quoteData.subsidyAmount}
                onChange={(e) => setQuoteData({ ...quoteData, subsidyAmount: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/30 font-bold text-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              {/* Quick Subsidy Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => setQuoteData({ ...quoteData, subsidyAmount: 78000 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 font-semibold transition-colors"
                >
                  ₹78k (3kW+ DBT)
                </button>
                <button
                  type="button"
                  onClick={() => setQuoteData({ ...quoteData, subsidyAmount: 60000 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 font-semibold transition-colors"
                >
                  ₹60k (2kW DBT)
                </button>
                <button
                  type="button"
                  onClick={() => setQuoteData({ ...quoteData, subsidyAmount: 30000 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 font-semibold transition-colors"
                >
                  ₹30k (1kW DBT)
                </button>
                <button
                  type="button"
                  onClick={() => setQuoteData({ ...quoteData, subsidyAmount: 0 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-rose-100 text-slate-700 font-semibold transition-colors"
                >
                  ₹0 (None)
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Financial Breakdown Summary */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Gross Component Base Value:</span>
              <span className="font-semibold text-white">₹{componentsSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Special Promotional Rebate:</span>
              <span className="font-semibold text-rose-300">-₹{Number(quoteData.discount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Direct Benefit Transfer (DBT) Subsidy:</span>
              <span className="font-semibold text-emerald-300">-₹{Number(quoteData.subsidyAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm">
              <span className="font-bold text-amber-300">Net Customer Payable:</span>
              <span className="font-extrabold text-lg text-emerald-400">₹{netPayable.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
              <span>20% Booking Commitment Advance:</span>
              <span className="font-bold text-amber-200">₹{advanceRequired.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Terms & Guarantee Notes</label>
            <textarea
              rows={2}
              value={quoteData.notes}
              onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsQuotationModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Send Quotation to Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Quotation Component Bill & Details (Sales Inspection) */}
      <Modal
        isOpen={isQuotePreviewModalOpen}
        onClose={() => setIsQuotePreviewModalOpen(false)}
        title={`Quotation Preview: ${selectedQuotePreview?.quotationNumber || ''}`}
      >
        <div className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-slate-500 font-bold block">{selectedQuotePreview?.quotationNumber}</span>
              <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                {selectedQuotePreview?.customerName} • {selectedQuotePreview?.capacityKw} kW {selectedQuotePreview?.systemType}
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">{selectedQuotePreview?.customerAddress}</p>
            </div>
            <StatusBadge status={selectedQuotePreview?.status} />
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
                    <th className="py-2 px-3">Component Name</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price (₹)</th>
                    <th className="py-2 px-3 text-right">Subtotal (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedQuotePreview?.items || []).map((it, idx) => (
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

          {/* Financial Breakdown */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Gross Component Value:</span>
              <span className="font-semibold text-slate-800">₹{selectedQuotePreview?.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Promotional Discount:</span>
              <span className="font-semibold text-rose-600">-₹{(selectedQuotePreview?.discount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>DBT Subsidy Deduction:</span>
              <span className="font-semibold text-emerald-600">-₹{selectedQuotePreview?.subsidyAmount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Net Customer Payable:</span>
              <span className="text-emerald-700">₹{selectedQuotePreview?.netPayable?.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsQuotePreviewModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesDashboard;
