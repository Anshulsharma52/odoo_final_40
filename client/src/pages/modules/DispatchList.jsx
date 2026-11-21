import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import { Truck, MapPin, Phone, Barcode } from 'lucide-react';

const DispatchList = () => {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDispatches = async () => {
      try {
        const res = await api.get('/dispatches');
        if (res.data.success) setDispatches(res.data.dispatches);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDispatches();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Delivery & Dispatch History</h1>
        <p className="text-sm text-slate-500 mt-1">
          Vehicle manifests, loaded inverter/battery serial numbers, and transit delivery statuses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dispatches.map((d) => (
          <div key={d._id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-slate-900 text-sm">{d.dispatchNumber}</span>
                <p className="text-xs text-slate-500">Order: {d.orderNumber}</p>
              </div>
              <StatusBadge status={d.status} />
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
              <p>Customer: <strong>{d.customerName}</strong> ({d.customerPhone})</p>
              <p className="flex items-start gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" /> {d.customerAddress}
              </p>
              <p>Vehicle: <strong>{d.vehicleNo}</strong> • Driver: {d.driverName} ({d.driverPhone})</p>
              <p>Date: {new Date(d.dispatchDate).toLocaleString()}</p>
            </div>

            {d.allAllocatedSerials?.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Scanned Serial Numbers:</span>
                <div className="flex flex-wrap gap-1.5 font-mono">
                  {d.allAllocatedSerials.map((sn, idx) => (
                    <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-emerald-800 font-semibold text-[11px]">
                      {sn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DispatchList;
