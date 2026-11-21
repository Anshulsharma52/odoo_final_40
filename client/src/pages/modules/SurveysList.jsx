import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import { Compass, Calendar, MapPin, Phone, Ruler } from 'lucide-react';

const SurveysList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await api.get('/surveys');
        if (res.data.success) setSurveys(res.data.surveys);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Site Survey Registry</h1>
        <p className="text-sm text-slate-500 mt-1">
          Detailed rooftop measurements, azimuth/direction, tilt, shadow analysis, and feasibility reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {surveys.map((survey) => (
          <div key={survey._id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-base text-slate-900">{survey.customerName}</h3>
                <StatusBadge status={survey.status} />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {survey.customerAddress}
              </p>
              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <p>Surveyor: <strong>{survey.technicianName}</strong></p>
                <p>System Requested: {survey.requestedCapacity} kW {survey.systemType}</p>
                <p>Scheduled: {new Date(survey.scheduledDate).toLocaleDateString()}</p>
              </div>

              {survey.report && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-xl text-xs text-emerald-950 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>{survey.report.roofAreaSqFt} sq ft ({survey.report.direction})</span>
                    <span>Tilt: {survey.report.tiltAngle}°</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">Cable run: {survey.report.cableDistanceMeters}m • Feasible: {survey.report.approvedCapacity} kW</p>
                  <p className="text-[11px] text-slate-600 italic mt-1">"{survey.report.inspectionNotes}"</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurveysList;
