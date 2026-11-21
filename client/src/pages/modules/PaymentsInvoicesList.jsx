import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import { Receipt, DollarSign, Download, CreditCard } from 'lucide-react';

const PaymentsInvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('invoices');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const [invRes, payRes] = await Promise.all([
          api.get('/payments/invoices'),
          api.get('/payments')
        ]);
        if (invRes.data.success) setInvoices(invRes.data.invoices);
        if (payRes.data.success) setPayments(payRes.data.payments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBilling();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payments & Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track customer billing, milestone advances, receipts, and subsidy deductions.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'invoices' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
          >
            Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'payments' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
          >
            Payment Receipts ({payments.length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        {activeTab === 'invoices' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Invoice #</th>
                  <th className="py-3 px-3">Order #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Gross Total</th>
                  <th className="py-3 px-3">Subsidy</th>
                  <th className="py-3 px-3">Grand Total</th>
                  <th className="py-3 px-3">Paid Amount</th>
                  <th className="py-3 px-3">Balance Due</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{inv.orderNumber}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{inv.customerName}</td>
                    <td className="py-3 px-3">₹{inv.subtotal?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-emerald-600 font-medium">-₹{inv.subsidyDeduction?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">₹{inv.grandTotal?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-emerald-600 font-semibold">₹{(inv.paidAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-rose-600 font-bold">₹{(inv.balanceDue || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Receipt #</th>
                  <th className="py-3 px-3">Order #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Amount Received</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Payment Mode</th>
                  <th className="py-3 px-3">Transaction Ref</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.receiptNo}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{p.orderNumber}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{p.customerName}</td>
                    <td className="py-3 px-3 font-extrabold text-emerald-700">₹{p.amount?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">{p.paymentType}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{p.paymentMethod}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{p.transactionRef}</td>
                    <td className="py-3 px-3 text-slate-400">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsInvoicesList;
