import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { FileQuestion, PlusCircle, Calendar, Send, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const EnquiriesList = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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

  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/enquiries');
      if (res.data.success) {
        setEnquiries(res.data.enquiries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/enquiries', formData);
      if (res.data.success) {
        toast.success('Enquiry added!');
        setIsModalOpen(false);
        fetchEnquiries();
      }
    } catch (err) {
      toast.error('Failed to create enquiry');
    }
  };

  const filtered = enquiries.filter(e =>
    e.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    e.customerPhone?.includes(search) ||
    e.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Solar Enquiries</h1>
          <p className="text-sm text-slate-500 mt-1">
            Capture lead requirements, calculate initial capacity, and coordinate site surveys.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Add Solar Lead
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="mb-4 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by customer name, phone, or area..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">System Type</th>
                <th className="py-3 px-3">Capacity</th>
                <th className="py-3 px-3">Electricity Bill</th>
                <th className="py-3 px-3">Shadow-Free Area</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Received On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((enq) => (
                <tr key={enq._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{enq.customerName}</span>
                    <span className="text-[11px] text-slate-400">{enq.customerPhone} • {enq.address}</span>
                  </td>
                  <td className="py-3 px-3 font-medium">{enq.systemType}</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">{enq.proposedCapacity} kW</td>
                  <td className="py-3 px-3">₹{enq.monthlyBill?.toLocaleString('en-IN')}/mo</td>
                  <td className="py-3 px-3">{enq.shadowFreeArea || 350} sq ft</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={enq.status} />
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(enq.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
};

export default EnquiriesList;
