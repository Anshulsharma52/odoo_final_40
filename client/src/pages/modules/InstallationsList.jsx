import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import { Wrench, CheckCircle2, Zap, Clock, ShieldCheck } from 'lucide-react';

const InstallationsList = () => {
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstallations = async () => {
      try {
        const res = await api.get('/installations');
        if (res.data.success) setInstallations(res.data.installations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstallations();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rooftop Installation Jobs</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track crew deployment, mounting checklists, live generation testing, and signed commissioning certificates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {installations.map((job) => (
          <div key={job._id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400">{job.orderNumber}</span>
                  <h3 className="font-bold text-base text-slate-900">{job.customerName}</h3>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <p>System: <strong>{job.capacityKw} kW {job.systemType}</strong></p>
                <p>Lead Tech: <strong>{job.leadTechnicianName}</strong></p>
                <p>Location: {job.customerAddress}</p>
                <p>Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}</p>
              </div>

              {job.testResults && job.status === 'Completed' && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-xl text-xs text-emerald-950 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Power Generation: {job.testResults.generationKw} kW</span>
                    <span>Earthing: {job.testResults.earthingResistanceOhms} Ω</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">DC Voltage: {job.testResults.dcVocVoltage}V • Grid Sync OK</p>
                  <p className="text-[11px] font-semibold text-emerald-800 pt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Warranties activated automatically
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstallationsList;
