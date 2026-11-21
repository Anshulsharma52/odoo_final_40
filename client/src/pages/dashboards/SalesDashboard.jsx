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
  Filter
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

  const [quoteData, setQuoteData] = useState({
    systemType: 'On-Grid',
    capacityKw: 3,
    discount: 5000,
    subsidyAmount: 45000,
    notes: 'Includes 5-year comprehensive maintenance & DBT subsidy.'
  });

  const fetchSalesData = async () => {
    try {
      const [enqRes, surRes, quoRes] = await Promise.all([
        api.get('/enquiries'),
        api.get('/surveys'),
        api.get('/quotations')
      ]);
      if (enqRes.data.success) setEnquiries(enqRes.data.enquiries);
      if (surRes.data.success) setSurveys(surRes.data.surveys);
      if (quoRes.data.success) setQuotations(quoRes.data.quotations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

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
    try {
      const res = await api.post('/quotations', {
        enquiryId: selectedEnquiry._id,
        customerName: selectedEnquiry.customerName || selectedEnquiry.name,
        customerPhone: selectedEnquiry.customerPhone || selectedEnquiry.phone || '',
        customerEmail: selectedEnquiry.customerEmail || selectedEnquiry.email || '',
        customerAddress: selectedEnquiry.address || selectedEnquiry.customerAddress || '',
        systemType: quoteData.systemType,
        capacityKw: Number(quoteData.capacityKw),
        discount: Number(quoteData.discount) || 0,
        subsidyAmount: Number(quoteData.subsidyAmount) || 0,
        notes: quoteData.notes
      });
      if (res.data.success) {
        toast.success(`Quotation ${res.data.quotation.quotationNumber} generated and sent!`);
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
            Capture rooftop enquiries, dispatch survey technicians, and generate certified solar package quotes.
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
          subtext={`${surveys.filter(s => s.status === 'Completed').length} completed & approved`}
          icon={ClipboardCheck}
          color="amber"
        />
        <StatCard
          title="Quotations Generated"
          value={quotations.length}
          subtext={`${quotations.filter(q => q.status === 'Accepted').length} accepted orders`}
          icon={FileSpreadsheet}
          color="emerald"
        />
        <StatCard
          title="Quotation Value"
          value={`₹${quotations.reduce((sum, q) => sum + (q.netPayable || 0), 0).toLocaleString('en-IN')}`}
          subtext="Total pipeline quote value"
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* Enquiries Pipeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Enquiries & Leads Workflow</h2>
            <p className="text-xs text-slate-400">Step 1 & 2: Review incoming homeowner details and schedule roof survey</p>
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
                    {enq.status === 'Survey Done' && (
                      <button
                        onClick={() => {
                          setSelectedEnquiry(enq);
                          setQuoteData({
                            ...quoteData,
                            capacityKw: enq.proposedCapacity || 3,
                            systemType: enq.systemType || 'On-Grid'
                          });
                          setIsQuotationModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" /> Generate Quote
                      </button>
                    )}
                    {(enq.status === 'Quoted' || enq.status === 'Order Confirmed') && (
                      <span className="text-emerald-600 font-semibold text-[11px] inline-flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Quoted
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                <option value={3}>3 kW (Most Popular)</option>
                <option value={5}>5 kW (High Load / Commercial)</option>
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

      {/* Modal: Generate Ready-Template Quotation */}
      <Modal isOpen={isQuotationModalOpen} onClose={() => setIsQuotationModalOpen(false)} title={`Generate Solar Quotation for ${selectedEnquiry?.customerName}`}>
        <form onSubmit={handleGenerateQuote} className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed">
            The quote will automatically pull the complete <strong>certified Bill of Materials (BOM)</strong>: Mono PERC panels, certified inverter, galvanized mounting structure, DC cables, and AC/DC protection gear.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">System Type</label>
              <select
                value={quoteData.systemType}
                onChange={(e) => setQuoteData({ ...quoteData, systemType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="On-Grid">On-Grid (Connected to Grid)</option>
                <option value="Off-Grid">Off-Grid (With Battery Backup)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Capacity Package (kW)</label>
              <select
                value={quoteData.capacityKw}
                onChange={(e) => setQuoteData({ ...quoteData, capacityKw: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value={1}>1 kW Package (2x Panels + 1kW Inverter)</option>
                <option value={3}>3 kW Package (6x Panels + 3kW Smart Inverter)</option>
                <option value={5}>5 kW Package (10x Panels + 5kW Dual MPPT Inverter)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Special Discount (₹)</label>
              <input
                type="number"
                value={quoteData.discount}
                onChange={(e) => setQuoteData({ ...quoteData, discount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Government Subsidy (DBT) (₹)</label>
              <input
                type="number"
                value={quoteData.subsidyAmount}
                onChange={(e) => setQuoteData({ ...quoteData, subsidyAmount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
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

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsQuotationModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
            >
              Send Quotation to Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalesDashboard;
