import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import { ShoppingBag, Truck, Wrench, CheckCircle } from 'lucide-react';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.data.success) setOrders(res.data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Confirmed Installation Orders</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor BOM readiness, equipment serial allocations, warehouse truck dispatch, and on-roof completion.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-3">Order #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">System / Capacity</th>
                <th className="py-3 px-3">Order Net Value</th>
                <th className="py-3 px-3">Advance Paid</th>
                <th className="py-3 px-3">Balance Due</th>
                <th className="py-3 px-3">Dispatch</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold block">{ord.customerName}</span>
                    <span className="text-[11px] text-slate-400">{ord.customerPhone}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-emerald-800">{ord.capacityKw} kW</span>
                    <span className="text-[11px] text-slate-400 block">{ord.systemType}</span>
                  </td>
                  <td className="py-3 px-3 font-bold">₹{(ord.netPayable || ord.totalAmount).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-emerald-600 font-medium">₹{(ord.advancePaid || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-rose-600 font-bold">₹{(ord.balanceDue || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-semibold text-slate-600">{ord.dispatchStatus || 'Pending'}</span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={ord.status} />
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

export default OrdersList;
