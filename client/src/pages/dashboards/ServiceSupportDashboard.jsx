import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  Headphones,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  PlusCircle,
  Phone,
  Barcode,
  Wrench,
  Check,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const ServiceSupportDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Warranty Lookup tool
  const [serialQuery, setSerialQuery] = useState('INV-3KW-8842'); // Pre-filled with Sunil Mehta's inverter from story
  const [warrantyResult, setWarrantyResult] = useState(null);
  const [searchingSerial, setSearchingSerial] = useState(false);

  // Modals
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Form states
  const [newTicket, setNewTicket] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    serialNumber: '',
    productName: '',
    faultCode: 'ERR-302 (DC Isolation Fault)',
    issueCategory: 'Inverter Fault',
    description: '',
    priority: 'High'
  });

  const [resolveForm, setResolveForm] = useState({
    status: 'Resolved',
    resolutionNotes: 'Replaced DC surge protection device under warranty and resealed junction conduit.',
    partsReplaced: 'DC SPD 40kA',
    costBilledToCustomer: 0,
    customerConfirmed: true
  });

  const fetchTickets = async () => {
    try {
      const res = await api.get('/service-tickets');
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleVerifySerial = async (e) => {
    e?.preventDefault();
    if (!serialQuery.trim()) return;

    setSearchingSerial(true);
    try {
      const res = await api.get(`/warranties/verify/${encodeURIComponent(serialQuery.trim())}`);
      if (res.data.success) {
        setWarrantyResult(res.data);
        toast.success(`Serial record found! Warranty status: ${res.data.isUnderWarranty ? 'ACTIVE (Free Coverage)' : 'EXPIRED'}`);
      }
    } catch (err) {
      setWarrantyResult(null);
      toast.error('No warranty record found for this serial number');
    } finally {
      setSearchingSerial(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/service-tickets', newTicket);
      if (res.data.success) {
        toast.success(`Service ticket ${res.data.ticket.ticketNumber} created! Warranty: ${res.data.warrantyStatus}`);
        setIsTicketModalOpen(false);
        setNewTicket({
          customerName: '',
          customerPhone: '',
          customerAddress: '',
          serialNumber: '',
          productName: '',
          faultCode: '',
          issueCategory: 'Inverter Fault',
          description: '',
          priority: 'High'
        });
        fetchTickets();
      }
    } catch (err) {
      toast.error('Failed to create ticket');
    }
  };

  const handleOpenResolve = (ticket) => {
    setSelectedTicket(ticket);
    setResolveForm({
      status: 'Resolved',
      resolutionNotes: ticket.resolutionNotes || 'Technician completed diagnostics and replaced faulty surge component on site.',
      partsReplaced: 'DC Surge Protection Device (SPD)',
      costBilledToCustomer: ticket.isUnderWarranty ? 0 : 2500,
      customerConfirmed: true
    });
    setIsResolveModalOpen(true);
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const res = await api.put(`/service-tickets/${selectedTicket._id}`, {
        ...resolveForm,
        partsReplaced: resolveForm.partsReplaced.split(',').map(s => s.trim()).filter(Boolean)
      });
      if (res.data.success) {
        toast.success(`Ticket ${selectedTicket.ticketNumber} status updated!`);
        setIsResolveModalOpen(false);
        fetchTickets();
      }
    } catch (err) {
      toast.error('Failed to update ticket');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const openTickets = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved');
  const warrantyTickets = tickets.filter(t => t.isUnderWarranty);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Service & Customer Support</h1>
          <p className="text-sm text-slate-500 mt-1">
            Resolve breakdown calls in seconds: instantly verify serial number warranty coverage, assign technicians, and track repairs.
          </p>
        </div>
        <button
          onClick={() => setIsTicketModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Create Service Ticket
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Service Tickets"
          value={tickets.length}
          subtext="Logged complaints & requests"
          icon={Headphones}
          color="blue"
        />
        <StatCard
          title="Open / In Progress"
          value={openTickets.length}
          subtext="Requires technician action"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Under Active Warranty"
          value={warrantyTickets.length}
          subtext="Zero cost to customer"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Paid Repairs (Out of Warranty)"
          value={tickets.length - warrantyTickets.length}
          subtext="Parts & labor billed"
          icon={AlertCircle}
          color="purple"
        />
      </div>

      {/* Instant Serial Number Warranty Scanner Box */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-2xl p-6 text-white shadow-sm border border-emerald-800/30">
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase block">
            Rapid Warranty Verification Engine
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            Search Customer by Serial Number or Phone
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Scene: Rainy breakdown call? Enter the inverter or battery serial number below to see customer info and active warranty status immediately.
          </p>

          <form onSubmit={handleVerifySerial} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={serialQuery}
                onChange={(e) => setSerialQuery(e.target.value)}
                placeholder="Enter Serial (e.g. INV-3KW-8842 or BAT-150-5501)..."
                className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:bg-white/15 outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={searchingSerial}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              <Search className="w-4 h-4" /> Verify Warranty
            </button>
          </form>

          {/* Warranty Result Card */}
          {warrantyResult && (
            <div className="mt-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                <div>
                  <span className="font-mono font-bold text-emerald-300 text-sm">{warrantyResult.warranty?.serialNumber}</span>
                  <p className="font-semibold text-white">{warrantyResult.warranty?.productName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                    warrantyResult.isUnderWarranty ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                  }`}>
                    {warrantyResult.isUnderWarranty ? '✓ UNDER ACTIVE WARRANTY' : '⚠️ OUT OF WARRANTY'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 block">Customer</span>
                  <span className="font-medium text-white">{warrantyResult.warranty?.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Phone</span>
                  <span className="font-medium text-white">{warrantyResult.warranty?.customerPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Valid Until</span>
                  <span className="font-medium text-white">
                    {new Date(warrantyResult.warranty?.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Repair Cost</span>
                  <span className="font-bold text-emerald-300">
                    {warrantyResult.isUnderWarranty ? '₹0 (FREE REPLACEMENT)' : 'Standard Billing'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Service Tickets & Complaints</h2>
            <p className="text-xs text-slate-400">Step 12: Track technician assignment, repair parts, and customer verification</p>
          </div>
          <span className="text-xs text-slate-500">{tickets.length} Total Tickets</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-3">Ticket #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Fault / Category</th>
                <th className="py-3 px-3">Serial Number</th>
                <th className="py-3 px-3">Warranty Billing</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tickets.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{t.ticketNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold block">{t.customerName}</span>
                    <span className="text-[11px] text-slate-400">{t.customerPhone}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-rose-700 block">{t.issueCategory}</span>
                    <span className="text-[11px] text-slate-500">{t.faultCode || 'System alert'}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-slate-800">{t.serialNumber}</td>
                  <td className="py-3 px-3">
                    {t.isUnderWarranty ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5" /> FREE (₹0)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                        ₹{t.costBilledToCustomer || 2500} Paid
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleOpenResolve(t)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1"
                    >
                      <Wrench className="w-3.5 h-3.5" /> Manage Ticket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Service Ticket */}
      <Modal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} title="Log Customer Solar Complaint">
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Phone Number *</label>
              <input
                type="text"
                required
                value={newTicket.customerPhone}
                onChange={(e) => setNewTicket({ ...newTicket, customerPhone: e.target.value })}
                placeholder="+91 98208 80008"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={newTicket.customerName}
                onChange={(e) => setNewTicket({ ...newTicket, customerName: e.target.value })}
                placeholder="e.g. Sunil Mehta"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Equipment Serial Number</label>
              <input
                type="text"
                value={newTicket.serialNumber}
                onChange={(e) => setNewTicket({ ...newTicket, serialNumber: e.target.value })}
                placeholder="e.g. INV-3KW-8842"
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fault Code (if visible)</label>
              <input
                type="text"
                value={newTicket.faultCode}
                onChange={(e) => setNewTicket({ ...newTicket, faultCode: e.target.value })}
                placeholder="e.g. ERR-302, E-04, Red LED"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Category *</label>
              <select
                value={newTicket.issueCategory}
                onChange={(e) => setNewTicket({ ...newTicket, issueCategory: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Inverter Fault">Inverter Fault / Zero Generation</option>
                <option value="Battery Issue">Battery Not Holding Charge</option>
                <option value="Physical Panel Damage">Physical Panel Damage / Hail</option>
                <option value="DC Wiring / Earthing">DC Wiring / Earthing Resistance</option>
                <option value="Monitoring App Offline">Monitoring App / WiFi Offline</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Critical">Critical (Complete Power Outage)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low / Query</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Problem Description *</label>
            <textarea
              rows={3}
              required
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              placeholder="Describe symptoms, weather conditions, error indicators..."
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
              Submit & Check Warranty
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Resolve / Update Ticket */}
      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title={`Manage Ticket: ${selectedTicket?.ticketNumber}`}>
        <form onSubmit={handleUpdateTicket} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-900">{selectedTicket?.customerName} • {selectedTicket?.productName}</p>
            <p className="text-slate-600 mt-1">{selectedTicket?.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-slate-500">Serial: {selectedTicket?.serialNumber}</span>
              <span className="font-bold text-emerald-700">
                {selectedTicket?.isUnderWarranty ? 'Covered under 5-year warranty' : 'Out of warranty'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ticket Status</label>
              <select
                value={resolveForm.status}
                onChange={(e) => setResolveForm({ ...resolveForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Open">Open</option>
                <option value="Assigned">Assigned to Technician</option>
                <option value="In Progress">In Progress (Diagnostics)</option>
                <option value="Parts Required">Waiting on Replacement Parts</option>
                <option value="Resolved">Resolved (Work Done)</option>
                <option value="Closed">Closed (Confirmed with Customer)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cost Billed to Customer (₹)</label>
              <input
                type="number"
                value={resolveForm.costBilledToCustomer}
                onChange={(e) => setResolveForm({ ...resolveForm, costBilledToCustomer: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {selectedTicket?.isUnderWarranty ? '₹0 automatically under warranty' : 'Charge diagnostic/part cost'}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Parts Replaced / Serviced</label>
            <input
              type="text"
              value={resolveForm.partsReplaced}
              onChange={(e) => setResolveForm({ ...resolveForm, partsReplaced: e.target.value })}
              placeholder="e.g. DC Surge Protector SPD-40kA, Inverter Main PCB"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Technician Resolution Notes</label>
            <textarea
              rows={2}
              value={resolveForm.resolutionNotes}
              onChange={(e) => setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={resolveForm.customerConfirmed}
              onChange={(e) => setResolveForm({ ...resolveForm, customerConfirmed: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span className="font-semibold text-slate-800">
              Customer verified that power generation has returned to normal
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsResolveModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
            >
              Save Ticket Update
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServiceSupportDashboard;
