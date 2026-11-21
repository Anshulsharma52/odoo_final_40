import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const s = String(status).toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (s.includes('completed') || s.includes('delivered') || s.includes('active') || s.includes('paid') || s.includes('accepted') || s.includes('approved')) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (s.includes('scheduled') || s.includes('progress') || s.includes('in transit') || s.includes('contacted') || s.includes('quoted')) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (s.includes('new') || s.includes('pending') || s.includes('partial') || s.includes('draft') || s.includes('open')) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (s.includes('rejected') || s.includes('cancelled') || s.includes('expired') || s.includes('unpaid') || s.includes('critical')) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
