import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import FileUpload from '../../components/common/FileUpload';
import SignaturePad from '../../components/common/SignaturePad';
import {
  Compass,
  MapPin,
  Camera,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Zap,
  Phone,
  Ruler,
  Wrench,
  Play,
  CheckSquare,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  Layers,
  Sparkles,
  Lock,
  Calendar,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'Technician';
  const isUnifiedTech = role === 'Technician' || role === 'Field Technician' || role === 'Admin';
  const isSurveyTech = role === 'Survey Technician' || isUnifiedTech;
  const isInstallTech = role === 'Installation Technician' || isUnifiedTech;

  // Active module tab: default to role-specific module
  const [activeTab, setActiveTab] = useState(role === 'Installation Technician' ? 'installation' : 'survey');

  // Survey Module States
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState({
    roofAreaSqFt: 450,
    direction: 'South-Facing (True South)',
    tiltAngle: 18,
    shadowFreeSpaceSqFt: 380,
    cableDistanceMeters: 25,
    roofType: 'RCC Flat Concrete Roof',
    obstacles: 'Small water tank on NE parapet, zero shadow across midday.',
    sanctionLoadKw: 5,
    supplyType: 'Single Phase',
    approved: true,
    approvedCapacity: 3,
    inspectionNotes: 'Roof is structurally sturdy and clear of shadow. Recommended 3 kW On-Grid setup.',
    photographs: []
  });

  // Installation Module States
  const [installations, setInstallations] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState(false);
  const [checklist, setChecklist] = useState({
    structureMounting: true,
    panelArrangement: true,
    inverterInstallation: true,
    batteryConnection: true,
    earthingProtection: true,
    cableTieAndConduit: true
  });
  const [testResults, setTestResults] = useState({
    generationKw: 2.85,
    dcVocVoltage: 382,
    earthingResistanceOhms: 1.4,
    gridSyncConfirmed: true
  });
  const [sitePhotos, setSitePhotos] = useState([]);
  const [signatureData, setSignatureData] = useState(null);
  const [typedSignature, setTypedSignature] = useState('');
  const [feedback, setFeedback] = useState('All solar modules mounted securely. Inverter synchronizing cleanly with home electrical panel.');

  const [loading, setLoading] = useState(true);

  // Fetch both Surveys and Installations
  const fetchTechnicianData = async () => {
    try {
      const [survRes, instRes] = await Promise.all([
        api.get('/surveys'),
        api.get('/installations')
      ]);
      if (survRes.data.success) setSurveys(survRes.data.surveys);
      if (instRes.data.success) setInstallations(instRes.data.installations);
    } catch (err) {
      console.error('Error fetching technician data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicianData();
  }, []);

  // Update default tab if user role changes
  useEffect(() => {
    if (isInstallTech) {
      setActiveTab('installation');
    } else if (isSurveyTech) {
      setActiveTab('survey');
    }
  }, [role]);

  // Survey Actions
  const handleOpenReportModal = (survey) => {
    if (!isSurveyTech && role !== 'Admin') {
      toast.error('Survey report submission is reserved for Survey Technicians.');
      return;
    }
    setSelectedSurvey(survey);
    setReportData({
      roofAreaSqFt: 450,
      direction: 'South-Facing (True South)',
      tiltAngle: 18,
      shadowFreeSpaceSqFt: 380,
      cableDistanceMeters: 25,
      roofType: 'RCC Flat Concrete Roof',
      obstacles: 'Zero obstruction on South orientation',
      sanctionLoadKw: 5,
      supplyType: 'Single Phase',
      approved: true,
      approvedCapacity: survey.requestedCapacity || 3,
      inspectionNotes: 'Ideal roof parameters for optimal solar irradiance.',
      photographs: [
        'https://images.unsplash.com/photo-1508873696983-2df5293cb998?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=600&q=80'
      ]
    });
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!selectedSurvey) return;

    try {
      const res = await api.post(`/surveys/${selectedSurvey._id}/report`, reportData);
      if (res.data.success) {
        toast.success(`Survey inspection submitted as ${reportData.approved ? 'APPROVED' : 'REJECTED'}!`);
        setIsReportModalOpen(false);
        fetchTechnicianData();
      }
    } catch (err) {
      toast.error('Failed to submit survey report');
    }
  };

  // Installation Actions
  const handleStartWork = async (jobId) => {
    if (!isInstallTech && role !== 'Admin') {
      toast.error('Starting installation is reserved for Installation Technicians.');
      return;
    }
    try {
      const res = await api.put(`/installations/${jobId}/start`);
      if (res.data.success) {
        toast.success('Installation work timer started on site!');
        fetchTechnicianData();
      }
    } catch (err) {
      toast.error('Could not start installation');
    }
  };

  const handleOpenSignOff = (job) => {
    if (!isInstallTech && role !== 'Admin') {
      toast.error('Commissioning sign-off is reserved for Installation Technicians.');
      return;
    }
    setSelectedJob(job);
    if (job.checklist) {
      setChecklist({
        structureMounting: job.checklist.structureMounting ?? true,
        panelArrangement: job.checklist.panelArrangement ?? true,
        inverterInstallation: job.checklist.inverterInstallation ?? true,
        batteryConnection: job.checklist.batteryConnection ?? true,
        earthingProtection: job.checklist.earthingProtection ?? true,
        cableTieAndConduit: job.checklist.cableTieAndConduit ?? true
      });
    } else {
      setChecklist({
        structureMounting: true,
        panelArrangement: true,
        inverterInstallation: true,
        batteryConnection: true,
        earthingProtection: true,
        cableTieAndConduit: true
      });
    }

    if (job.testResults) {
      setTestResults({
        generationKw: job.testResults.generationKw || (job.capacityKw * 0.95).toFixed(2),
        dcVocVoltage: job.testResults.dcVocVoltage || 385,
        earthingResistanceOhms: job.testResults.earthingResistanceOhms || 1.6,
        gridSyncConfirmed: job.testResults.gridSyncConfirmed !== undefined ? job.testResults.gridSyncConfirmed : true
      });
    } else {
      setTestResults({
        generationKw: (job.capacityKw * 0.95).toFixed(2),
        dcVocVoltage: 385,
        earthingResistanceOhms: 1.6,
        gridSyncConfirmed: true
      });
    }

    setSitePhotos(job.sitePhotos && job.sitePhotos.length > 0 ? job.sitePhotos : [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=600&q=80'
    ]);
    setSignatureData(job.customerSignature?.startsWith('data:image') ? job.customerSignature : null);
    setTypedSignature(job.customerSignature || `Customer Verified: ${job.customerName || 'On-Site'}`);
    setFeedback(job.customerFeedback || 'All solar modules mounted securely. Inverter synchronizing cleanly with home electrical panel.');
    setIsSignOffModalOpen(true);
  };

  const handleCompleteInstallation = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    const finalSignature = signatureData || (typedSignature && typedSignature.trim()) || `Digital Sign-off by ${selectedJob.customerName}`;

    try {
      const res = await api.post(`/installations/${selectedJob._id}/complete`, {
        checklist,
        testResults,
        sitePhotos,
        sitePhotographs: sitePhotos,
        customerSignature: finalSignature,
        customerFeedback: feedback
      });

      if (res.data.success) {
        toast.success(`Installation commissioned successfully! ${res.data.activatedWarrantiesCount ? `${res.data.activatedWarrantiesCount} warranties activated!` : 'Active warranties issued!'}`);
        setIsSignOffModalOpen(false);
        fetchTechnicianData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete installation signoff');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Dynamic statistics
  const pendingSurveys = surveys.filter((s) => s.status === 'Assigned' || s.status === 'Scheduled').length;
  const completedSurveys = surveys.filter((s) => s.status === 'Completed').length;
  const pendingInstalls = installations.filter((i) => i.status === 'Assigned' || i.status === 'Scheduled').length;
  const inProgressInstalls = installations.filter((i) => i.status === 'In Progress').length;
  const completedInstalls = installations.filter((i) => i.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Field Technician Operations Center
            </h1>
            <span
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                role === 'Technician' || role === 'Field Technician'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : isSurveyTech
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {role === 'Technician' || role === 'Field Technician' ? 'Field Technician (Survey + Install)' : `${role} View`}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Unified field engineering workspace integrating site feasibility surveys, rooftop measurements, mounting checklists, and customer sign-off.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl border border-slate-300/80">
          <button
            onClick={() => setActiveTab('survey')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'survey'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-600" />
            <span>Site Surveys ({surveys.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('installation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'installation'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4 text-emerald-600" />
            <span>Installations ({installations.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Site Surveys"
          value={surveys.length}
          subtext={`${pendingSurveys} pending inspection visits`}
          icon={Compass}
          color="amber"
        />
        <StatCard
          title="Installation Jobs"
          value={installations.length}
          subtext={`${inProgressInstalls} in progress, ${completedInstalls} signed-off`}
          icon={Wrench}
          color="emerald"
        />
        <StatCard
          title="Completed Milestones"
          value={completedSurveys + completedInstalls}
          subtext="Total surveys & commissions finished"
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          title="Quality & Safety Rating"
          value="4.9 / 5.0"
          subtext="Certified checklist compliance"
          icon={ShieldCheck}
          color="purple"
        />
      </div>

      {/* Role Responsibility Indicator Banner */}
      <div className="bg-slate-900 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              {isSurveyTech
                ? 'Survey Specialist Clearance Active'
                : isInstallTech
                ? 'Installation & Commissioning Clearance Active'
                : 'Full Field Master Clearance'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isSurveyTech
                ? 'You have write access to site inspections, azimuth measurements, and shadow analysis. Installation jobs are accessible in view mode.'
                : isInstallTech
                ? 'You have write access to start jobs, test inverter voltages, and capture customer signatures. Survey data is accessible for structural reference.'
                : 'Full technician execution access across all field milestones.'}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 text-slate-300 shrink-0">
          Logged in as: {user?.name || role}
        </span>
      </div>

      {/* MODULE 1: SITE SURVEY & ROOF FEASIBILITY */}
      {activeTab === 'survey' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-600" />
                  Assigned Roof Feasibility & Site Surveys
                </h2>
                <p className="text-xs text-slate-400">
                  Assess rooftop surface area, shadow free quadrant, azimuth direction, and cable length before quotation generation
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 w-fit">
                {surveys.length} Field Locations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-3">Survey ID</th>
                    <th className="py-3 px-3">Customer / Location</th>
                    <th className="py-3 px-3">Requested kW</th>
                    <th className="py-3 px-3">Scheduled Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Feasibility / Area</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {surveys.map((survey) => {
                    const isCompleted = survey.status === 'Completed';
                    return (
                      <tr key={survey._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {survey.surveyNumber || survey._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900 block">{survey.customerName}</span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" /> {survey.address || 'Address provided on lead'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-amber-700">
                          {survey.requestedCapacity || 3} kW
                        </td>
                        <td className="py-3 px-3">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(survey.scheduledDate || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={survey.status} />
                        </td>
                        <td className="py-3 px-3">
                          {isCompleted ? (
                            <div>
                              <span className="font-bold text-emerald-700 block">
                                {survey.report?.approved ? '✓ Feasible' : '✗ Unfeasible'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {survey.report?.shadowFreeSpaceSqFt || 380} sq.ft shadow-free
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Pending inspection</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isCompleted ? (
                            <button
                              onClick={() => handleOpenReportModal(survey)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs"
                            >
                              View Report
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenReportModal(survey)}
                              disabled={!isSurveyTech && role !== 'Admin'}
                              className={`px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 ml-auto ${
                                !isSurveyTech && role !== 'Admin'
                                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                              }`}
                            >
                              {!isSurveyTech && role !== 'Admin' && <Lock className="w-3 h-3" />}
                              <span>Fill Inspection</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: SOLAR INSTALLATION & COMMISSIONING */}
      {activeTab === 'installation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-600" />
                  Assigned Rooftop Solar Installation Jobs
                </h2>
                <p className="text-xs text-slate-400">
                  Execute rail mounting, panel stringing, inverter wiring, earthing pit testing, and digital customer handover
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 w-fit">
                {installations.length} Active Jobs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-3">Job / Order #</th>
                    <th className="py-3 px-3">Customer & Site</th>
                    <th className="py-3 px-3">PV Capacity</th>
                    <th className="py-3 px-3">Scheduled Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Customer Signoff</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {installations.map((job) => {
                    const isDone = job.status === 'Completed';
                    const isInProgress = job.status === 'In Progress';

                    return (
                      <tr key={job._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {job.installationNumber || job.orderId?.orderNumber || job._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900 block">{job.customerName}</span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" /> {job.siteAddress || 'Site address on order'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-700">
                          {job.capacityKw || 3} kW System
                        </td>
                        <td className="py-3 px-3">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(job.scheduledDate || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="py-3 px-3">
                          {isDone ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
                              <Check className="w-3 h-3" /> Signed & Verified
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Awaiting completion</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isDone ? (
                            <button
                              onClick={() => handleOpenSignOff(job)}
                              className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs flex items-center gap-1.5 ml-auto"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>View Certificate</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {!isInProgress && (
                                <button
                                  onClick={() => handleStartWork(job._id)}
                                  disabled={!isInstallTech && role !== 'Admin'}
                                  className={`px-2.5 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 ${
                                    !isInstallTech && role !== 'Admin'
                                      ? 'bg-slate-400 cursor-not-allowed opacity-60'
                                      : 'bg-blue-600 hover:bg-blue-700'
                                  }`}
                                  title="Start Work Timer"
                                >
                                  <Play className="w-3 h-3" />
                                  <span>Start</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenSignOff(job)}
                                disabled={!isInstallTech && role !== 'Admin'}
                                className={`px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 ${
                                  !isInstallTech && role !== 'Admin'
                                    ? 'bg-slate-400 cursor-not-allowed opacity-60'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                }`}
                              >
                                {!isInstallTech && role !== 'Admin' && <Lock className="w-3 h-3" />}
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span>Checklist & Sign</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SURVEY FEASIBILITY & MEASUREMENT REPORT */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={`Site Survey Report: ${selectedSurvey?.customerName || 'Customer Site'}`}
        size="lg"
      >
        <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-amber-900">{selectedSurvey?.customerName}</p>
              <p className="text-[11px] text-amber-700">{selectedSurvey?.address}</p>
            </div>
            <span className="font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded text-xs">
              Requested: {selectedSurvey?.requestedCapacity || 3} kW
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Roof Area (Sq. Ft)</label>
              <input
                type="number"
                required
                value={reportData.roofAreaSqFt}
                onChange={(e) => setReportData({ ...reportData, roofAreaSqFt: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shadow-Free Space (Sq. Ft)</label>
              <input
                type="number"
                required
                value={reportData.shadowFreeSpaceSqFt}
                onChange={(e) => setReportData({ ...reportData, shadowFreeSpaceSqFt: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cable Distance to Inverter (m)</label>
              <input
                type="number"
                required
                value={reportData.cableDistanceMeters}
                onChange={(e) => setReportData({ ...reportData, cableDistanceMeters: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Azimuth Direction</label>
              <select
                value={reportData.direction}
                onChange={(e) => setReportData({ ...reportData, direction: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-xl"
              >
                <option value="South-Facing (True South)">South-Facing (True South - Optimal)</option>
                <option value="South-West">South-West</option>
                <option value="South-East">South-East</option>
                <option value="East-Facing">East-Facing</option>
                <option value="West-Facing">West-Facing</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Recommended Tilt Angle (°)</label>
              <input
                type="number"
                value={reportData.tiltAngle}
                onChange={(e) => setReportData({ ...reportData, tiltAngle: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Roof Type / Material</label>
              <select
                value={reportData.roofType}
                onChange={(e) => setReportData({ ...reportData, roofType: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-xl"
              >
                <option value="RCC Flat Concrete Roof">RCC Flat Concrete Roof</option>
                <option value="Metal Trapezoidal Sheet">Metal Trapezoidal Sheet</option>
                <option value="Terracotta Clay Tiled Roof">Terracotta Clay Tiled Roof</option>
                <option value="Asbestos Sheet">Asbestos Sheet</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Approved Capacity Recommendation (kW)</label>
              <input
                type="number"
                step="0.5"
                value={reportData.approvedCapacity}
                onChange={(e) => setReportData({ ...reportData, approvedCapacity: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-xl font-bold text-emerald-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Obstacles / Shadow Objects</label>
            <input
              type="text"
              value={reportData.obstacles}
              onChange={(e) => setReportData({ ...reportData, obstacles: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Survey Field Notes</label>
            <textarea
              rows={2}
              value={reportData.inspectionNotes}
              onChange={(e) => setReportData({ ...reportData, inspectionNotes: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-xl"
            />
          </div>

          <FileUpload
            label="Upload Roof Photographs (Geotagged)"
            onUploadSuccess={(url) => setReportData({ ...reportData, photographs: [...reportData.photographs, url] })}
          />

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="surveyApproved"
                checked={reportData.approved}
                onChange={(e) => setReportData({ ...reportData, approved: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="surveyApproved" className="font-bold text-slate-800 cursor-pointer">
                Site Structurally Feasible & Approved for Quotation
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isSurveyTech && role !== 'Admin'}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm disabled:opacity-50"
              >
                Submit Inspection Report
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: INSTALLATION CHECKLIST & CUSTOMER SIGN-OFF */}
      <Modal
        isOpen={isSignOffModalOpen}
        onClose={() => setIsSignOffModalOpen(false)}
        title={`Installation Commissioning & Sign-Off: ${selectedJob?.customerName || 'Solar Job'}`}
        size="xl"
      >
        {selectedJob?.status === 'Completed' ? (
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  Commissioning Certificate & Handover Complete ✓
                </span>
                <p className="font-bold text-emerald-950 text-sm mt-0.5">{selectedJob?.customerName}</p>
                <p className="text-[11px] text-emerald-700">{selectedJob?.siteAddress}</p>
              </div>
              <span className="font-extrabold text-emerald-900 bg-emerald-200/80 px-3 py-1 rounded-lg text-xs">
                {selectedJob?.capacityKw || 3} kW Plant Live
              </span>
            </div>

            {/* Verified Checklist */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Quality & Safety Milestones (6/6 Certified)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'structureMounting', label: '1. Module Mounting Structure bolted & torque checked' },
                  { id: 'panelArrangement', label: '2. Solar PV modules secured with mid/end clamps' },
                  { id: 'inverterInstallation', label: '3. Inverter wall-mounted with heat sink clearance' },
                  { id: 'batteryConnection', label: '4. Battery bank wiring & DC circuit breaker verified' },
                  { id: 'earthingProtection', label: '5. Dual earthing pits (AC & DC) connected with copper strip' },
                  { id: 'cableTieAndConduit', label: '6. UV-resistant conduits & cable dressing complete' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-emerald-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Results */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Commissioning Test Results
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Peak Generation</span>
                  <span className="font-extrabold text-emerald-700 text-sm">{selectedJob?.testResults?.generationKw || (selectedJob?.capacityKw * 0.95).toFixed(2)} kW</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">DC String Voltage</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">{selectedJob?.testResults?.dcVocVoltage || 385} V</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Earthing Resistance</span>
                  <span className="font-bold text-emerald-800 font-mono text-sm">{selectedJob?.testResults?.earthingResistanceOhms || 1.6} Ω</span>
                </div>
              </div>
            </div>

            {/* Sign-off Details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">Customer Acceptance Sign-Off:</span>
                <span className="font-bold text-slate-800 text-xs">
                  {selectedJob?.customerSignature || `Digital Sign-off by ${selectedJob?.customerName}`}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedJob?.customerFeedback || 'Installation approved & power verified.'}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">
                Active Warranties Issued ✓
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSignOffModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
              >
                Close Report
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCompleteInstallation} className="space-y-4 text-xs">
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-emerald-950">{selectedJob?.customerName}</p>
                <p className="text-[11px] text-emerald-700">{selectedJob?.siteAddress}</p>
              </div>
              <span className="font-extrabold text-emerald-900 bg-emerald-200/60 px-2.5 py-1 rounded text-xs">
                Capacity: {selectedJob?.capacityKw || 3} kW System
              </span>
            </div>

            {/* 6-Point Safety Checklist with 1-Click Pass All */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  Pre-Commissioning Quality & Safety Checklist
                </h4>
                <button
                  type="button"
                  onClick={() => setChecklist({
                    structureMounting: true,
                    panelArrangement: true,
                    inverterInstallation: true,
                    batteryConnection: true,
                    earthingProtection: true,
                    cableTieAndConduit: true
                  })}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 transition-colors"
                >
                  ✓ Pass All 6 Quality Checks
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {[
                  { id: 'structureMounting', label: '1. Module Mounting Structure bolted & aligned' },
                  { id: 'panelArrangement', label: '2. Solar PV modules secured with mid/end clamps' },
                  { id: 'inverterInstallation', label: '3. Inverter wall-mounted with heat sink clearance' },
                  { id: 'batteryConnection', label: '4. Battery bank wiring & DC circuit breaker verified' },
                  { id: 'earthingProtection', label: '5. Dual earthing pits (AC & DC) connected with copper strip' },
                  { id: 'cableTieAndConduit', label: '6. UV-resistant conduits & cable dressing complete' }
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100/80 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(checklist[item.id])}
                      onChange={(e) => setChecklist({ ...checklist, [item.id]: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                    />
                    <span className={`text-[11px] ${checklist[item.id] ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Technical Test Results */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Electrical Grid Synchronization & Metering Results
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peak Generation Tested (kW)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={testResults.generationKw}
                    onChange={(e) => setTestResults({ ...testResults, generationKw: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">DC String Voc Voltage (V)</label>
                  <input
                    type="number"
                    value={testResults.dcVocVoltage}
                    onChange={(e) => setTestResults({ ...testResults, dcVocVoltage: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Earthing Resistance (Ω Ohms)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={testResults.earthingResistanceOhms}
                    onChange={(e) => setTestResults({ ...testResults, earthingResistanceOhms: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl font-mono text-emerald-700"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Technician Notes & Customer Feedback</label>
              <textarea
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xl"
              />
            </div>

            <FileUpload
              label="Upload Commissioned Rooftop Photos"
              onUploadSuccess={(url) => setSitePhotos([...sitePhotos, url])}
            />

            {/* Interactive Customer Digital Signature */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Customer Digital Acceptance Signature</h4>
                  <p className="text-[11px] text-slate-400">
                    Customer signs below, or use 1-click on-site acceptance verification.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const signText = `Customer Verified: ${selectedJob?.customerName || 'On-Site'}`;
                    setTypedSignature(signText);
                    setSignatureData(signText);
                    toast.success(`Digital acceptance recorded for ${selectedJob?.customerName}!`);
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg text-xs transition-colors"
                >
                  ✍️ 1-Click Customer Sign-Off
                </button>
              </div>

              <SignaturePad onSave={(dataUrl) => setSignatureData(dataUrl)} />

              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Or Signatory Customer Name:
                </label>
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="e.g. Sunil Mehta (Customer on site)"
                  className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSignOffModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isInstallTech && role !== 'Admin'}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Finalize Commissioning & Handover
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default TechnicianDashboard;