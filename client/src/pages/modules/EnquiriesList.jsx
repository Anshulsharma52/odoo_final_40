import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  FileQuestion,
  PlusCircle,
  Calendar,
  Send,
  Search,
  CheckCircle2,
  Clock,
  Compass,
  User,
  Phone,
  MapPin,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  'New',
  'Survey Scheduled',
  'Survey Completed',
  'Quoted',
  'Order Confirmed',
  'Dropped'
];

const EnquiriesList = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';
  const canManage = role === 'Admin' || role === 'Sales' || role === 'Director';

  const [enquiries, setEnquiries] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Lead Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    systemType: 'On-Grid',
    proposedCapacity: 3,
    monthlyBill: 3000,
    shadowFreeArea: 350
  });

  // Schedule Survey Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    technicianId: '',
    technicianName: 'Rohan Joshi',
    notes: 'Please measure roof tilt, shadow obstruction, and service cable distance.'
  });

  const fetchData = async () => {
    try {
      const [enqRes, usersRes] = await Promise.all([
        api.get('/enquiries'),
        api.get('/users').catch(() => ({ data: { success: false, users: [] } }))
      ]);

      if (enqRes.data.success) {
        setEnquiries(enqRes.data.enquiries || []);
      }

      if (usersRes.data && usersRes.data.users) {
        const techs = usersRes.data.users.filter((u) =>
          ['Technician', 'Field Technician', 'Survey Technician'].includes(u.role)
        );
        setTechnicians(techs);
        if (techs.length > 0) {
          setScheduleData((prev) => ({
            ...prev,
            technicianId: techs[0]._id,
            technicianName: techs[0].name
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/enquiries', formData);
      if (res.data.success) {
        toast.success('Solar lead created successfully!');
        setIsModalOpen(false);
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: '',
          systemType: 'On-Grid',
          proposedCapacity: 3,
          monthlyBill: 3000,
          shadowFreeArea: 350
        });
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to create enquiry');
    }
  };

  // Change Enquiry Status Directly
  const handleUpdateStatus = async (enquiryId, newStatus) => {
    try {
      const res = await api.put(`/enquiries/${enquiryId}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Enquiry status updated to '${newStatus}'`);
        setEnquiries((prev) =>
          prev.map((e) => (e._id === enquiryId ? { ...e, status: newStatus } : e))
        );
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Open Schedule Survey Modal
  const handleOpenSchedule = (enquiry) => {
    setSelectedEnquiry(enquiry);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setScheduleData({
      scheduledDate: tomorrow,
      technicianId: technicians[0]?._id || '',
      technicianName: technicians[0]?.name || 'Rohan Joshi',
      notes: `Site survey for ${enquiry.customerName} (${enquiry.proposedCapacity}kW ${enquiry.systemType}). Inspect shadow-free space.`
    });
    setIsScheduleModalOpen(true);
  };

  // Submit Survey Schedule
  const handleScheduleSurvey = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    try {
      const res = await api.post('/surveys/schedule', {
        enquiryId: selectedEnquiry._id,
        technicianId: scheduleData.technicianId || null,
        scheduledDate: scheduleData.scheduledDate,
        notes: scheduleData.notes
      });

      if (res.data.success) {
        toast.success(`Site survey scheduled for ${selectedEnquiry.customerName}! Status changed to 'Survey Scheduled'.`);
        setIsScheduleModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule survey');
    }
  };

  const filtered = enquiries.filter((e) => {
    const matchesSearch =
      (e.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.customerPhone || '').includes(search) ||
      (e.address || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Solar Enquiries</h1>
            {canManage && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                Admin & Sales Control
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Capture lead requirements, adjust workflow status, schedule field technician rooftop surveys, and track quotes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Add Solar Lead
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="max-w-md w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads by customer name, phone, or area..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {['All', 'New', 'Survey Scheduled', 'Quoted', 'Order Confirmed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Enquiries Table with Actions & Status Controls */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">System Type</th>
                <th className="py-3 px-3">Capacity</th>
                <th className="py-3 px-3">Monthly Bill</th>
                <th className="py-3 px-3">Roof Area</th>
                <th className="py-3 px-3">Current Status</th>
                <th className="py-3 px-3">Change Status</th>
                <th className="py-3 px-3 text-right">Schedule Survey</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((enq) => (
                <tr key={enq._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{enq.customerName}</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" /> {enq.customerPhone}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {enq.address}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium">{enq.systemType}</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">{enq.proposedCapacity} kW</td>
                  <td className="py-3 px-3">₹{(enq.monthlyBill || 0).toLocaleString('en-IN')}/mo</td>
                  <td className="py-3 px-3">{enq.shadowFreeArea || 350} sq ft</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={enq.status} />
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-3">
                    {canManage ? (
                      <select
                        value={enq.status}
                        onChange={(e) => handleUpdateStatus(enq._id, e.target.value)}
                        className="px-2 py-1 text-[11px] font-semibold border border-slate-200 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none shadow-xs"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-500 font-medium">{enq.status}</span>
                    )}
                  </td>

                  {/* Schedule Survey Action */}
                  <td className="py-3 px-3 text-right">
                    {enq.status === 'Survey Scheduled' ? (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-bold rounded-lg text-[11px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-amber-600" /> Survey Booked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenSchedule(enq)}
                        disabled={!canManage}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        title="Schedule on-site technical inspection"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Schedule Survey</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW SOLAR LEAD */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Capture Customer Solar Lead">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Customer Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Phone Number *</label>
              <input
                required
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Rooftop Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">System Type</label>
              <select
                value={formData.systemType}
                onChange={(e) => setFormData({ ...formData, systemType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="On-Grid">On-Grid</option>
                <option value="Off-Grid">Off-Grid</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Capacity (kW)</label>
              <select
                value={formData.proposedCapacity}
                onChange={(e) => setFormData({ ...formData, proposedCapacity: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value={1}>1 kW</option>
                <option value={3}>3 kW</option>
                <option value={5}>5 kW</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg"
            >
              Save Lead
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: SCHEDULE ROOFTOP SITE SURVEY */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={`Schedule Technical Site Survey: ${selectedEnquiry?.customerName || ''}`}
        size="md"
      >
        <form onSubmit={handleScheduleSurvey} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">Customer & Rooftop Site</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedEnquiry?.customerName}</p>
            <p className="text-slate-600 text-[11px]">{selectedEnquiry?.address} • Phone: {selectedEnquiry?.customerPhone}</p>
            <p className="text-amber-800 font-semibold mt-1">
              Requested: {selectedEnquiry?.proposedCapacity} kW {selectedEnquiry?.systemType} System
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Scheduled Inspection Date *</label>
            <input
              type="date"
              required
              value={scheduleData.scheduledDate}
              onChange={(e) => setScheduleData({ ...scheduleData, scheduledDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assign Survey Technician *</label>
            <select
              value={scheduleData.technicianId}
              onChange={(e) => {
                const tech = technicians.find((t) => t._id === e.target.value);
                setScheduleData({
                  ...scheduleData,
                  technicianId: e.target.value,
                  technicianName: tech ? tech.name : 'Rohan Joshi'
                });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {technicians.length > 0 ? (
                technicians.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.role})
                  </option>
                ))
              ) : (
                <>
                  <option value="">Rohan Joshi (Senior Field Engineer)</option>
                  <option value="tech_02">Vikram Sharma (Installation & Survey Lead)</option>
                  <option value="tech_03">Anjali Deshmukh (Solar Technical Evaluator)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Inspection Instructions & Notes</label>
            <textarea
              rows={3}
              value={scheduleData.notes}
              onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. Check RCC roof structure, shadow obstruction from water tank, and cable distance to main distribution board."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" /> Book Survey Inspection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EnquiriesList;