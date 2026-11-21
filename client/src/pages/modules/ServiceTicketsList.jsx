import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import { Headphones, ShieldCheck, Wrench, Search } from 'lucide-react';

const ServiceTicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/service-tickets');
        if (res.data.success) setTickets(res.data.tickets);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const filtered = tickets.filter(t =>
    t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    t.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.issueCategory?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">After-Sales Service & Maintenance</h1>
        <p className="text-sm text-slate-500 mt-1">
          Customer breakdown tickets, warranty coverage verification, technician dispatch, and resolution records.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="mb-4 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by number, customer, or serial..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-3">Ticket #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Issue Category</th>
                <th className="py-3 px-3">Serial Number</th>
                <th className="py-3 px-3">Warranty Billing</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Technician</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{t.ticketNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold block">{t.customerName}</span>
                    <span className="text-[11px] text-slate-400">{t.customerPhone}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-rose-800">{t.issueCategory}</td>
                  <td className="py-3 px-3 font-mono font-medium">{t.serialNumber}</td>
                  <td className="py-3 px-3">
                    {t.isUnderWarranty ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                        FREE (Covered)
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                        ₹{t.costBilledToCustomer || 2500} Paid
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800">{t.priority}</span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-3 px-3 text-slate-600">{t.assignedTechnicianName || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceTicketsList;
