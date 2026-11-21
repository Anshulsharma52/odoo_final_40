import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import { FileSpreadsheet, Download, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const QuotationsList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = async () => {
    try {
      const res = await api.get('/quotations');
      if (res.data.success) setQuotations(res.data.quotations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await api.post(`/quotations/${id}/respond`, { action });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchQuotations();
      }
    } catch (err) {
      toast.error('Failed to update quotation');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Solar Quotations</h1>
        <p className="text-sm text-slate-500 mt-1">
          Certified quotes generated from predefined BOM package templates with subsidy deductions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-3">Quotation #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">System / Capacity</th>
                <th className="py-3 px-3">Gross Total</th>
                <th className="py-3 px-3">DBT Subsidy</th>
                <th className="py-3 px-3">Net Customer Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {quotations.map((q) => (
                <tr key={q._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{q.quotationNumber}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{q.customerName}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-emerald-800">{q.capacityKw} kW</span>
                    <span className="text-[11px] text-slate-400 block">{q.systemType}</span>
                  </td>
                  <td className="py-3 px-3">₹{q.totalAmount?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-emerald-600 font-medium">-₹{q.subsidyAmount?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-extrabold text-slate-900">₹{q.netPayable?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={q.status} />
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5">
                    {q.status === 'Sent' && (
                      <>
                        <button
                          onClick={() => handleAction(q._id, 'accept')}
                          className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(q._id, 'reject')}
                          className="px-2.5 py-1 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {q.status === 'Accepted' && (
                      <span className="text-emerald-700 font-bold">✓ Converted to Order</span>
                    )}
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

export default QuotationsList;
