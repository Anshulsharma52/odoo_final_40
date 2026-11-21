import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import { ShieldCheck, Search, Barcode } from 'lucide-react';

const WarrantiesList = () => {
  const [warranties, setWarranties] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarranties = async () => {
      try {
        const res = await api.get('/warranties');
        if (res.data.success) setWarranties(res.data.warranties);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWarranties();
  }, []);

  const filtered = warranties.filter(w =>
    w.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
    w.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    w.productName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Warranty Registry</h1>
        <p className="text-sm text-slate-500 mt-1">
          Digital warranty records automatically activated upon installation: 20 years for panels, 5 years for inverters, 3 years for batteries.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="mb-4 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by serial number, customer, or product..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-3">Warranty #</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Serial Barcode</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Coverage Period</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((w) => (
                <tr key={w._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{w.warrantyNumber}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{w.productName}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-800">{w.serialNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold block">{w.customerName}</span>
                    <span className="text-[11px] text-slate-400">{w.customerPhone}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">{w.warrantyYears} Years</td>
                  <td className="py-3 px-3 text-slate-600">
                    {new Date(w.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={w.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WarrantiesList;
