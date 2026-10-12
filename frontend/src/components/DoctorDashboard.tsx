import { useState, useEffect } from 'react';
import { Activity, Heart, Clock, FileCheck, CheckCircle2, AlertCircle, PlayCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import PatientForm, { DEMO_PATIENT } from './PatientForm';
import HeartModel from './HeartModel';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../lib/api';

interface DoctorDashboardProps {
  metrics?: any;
  schema: any;
}

export default function DoctorDashboard({ metrics: _metrics, schema }: DoctorDashboardProps) {
  const { authFetch, user } = useAuth();
  const [subTab, setSubTab] = useState<'workspace' | 'history' | 'lab_queue'>('workspace');
  const [predictions, setPredictions] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [explanations, setExplanations] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [labSubmissions, setLabSubmissions] = useState<any[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Fetch initial history and lab queue
  useEffect(() => {
    fetchHistory();
    fetchLabQueue();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/doctor/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  const fetchLabQueue = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/lab/submissions`);
      if (res.ok) {
        const data = await res.json();
        setLabSubmissions(data);
      }
    } catch (e) {
      console.error('Failed to load lab submissions:', e);
    }
  };

  const handlePredict = async (formData: any, patientName: string = 'Clinical Assessment') => {
    setIsPredicting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: formData, patient_name: patientName })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Prediction failed');
      }

      const data = await res.json();
      setPredictions(data);
      fetchHistory(); // Refresh history log

      // Fetch SHAP explanations for Cath
      fetchExplain(formData);
    } catch (err: any) {
      alert(`Prediction error: ${err.message}`);
    } finally {
      setIsPredicting(false);
    }
  };

  const fetchExplain = async (features: any) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'Cath', features })
      });
      if (res.ok) {
        const data = await res.json();
        setExplanations(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveLab = async (subId: string) => {
    setApprovingId(subId);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/lab/submissions/${subId}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchLabQueue();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApprovingId(null);
    }
  };

  const overallCad = predictions ? predictions['Cath'] : null;

  return (
    <div className="space-y-6">
      {/* Clinician Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Cardiologist Workspace</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40">
                Authorized Clinician
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Logged in as <strong className="text-white">{user?.name}</strong> • {user?.title}
            </p>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center bg-secondary/50 p-1 rounded-lg border border-border text-xs font-medium">
          <button
            onClick={() => setSubTab('workspace')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              subTab === 'workspace' ? 'bg-brand-blue text-brand-cyan shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity size={14} />
            <span>Clinical Workspace</span>
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              subTab === 'history' ? 'bg-brand-blue text-brand-cyan shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={14} />
            <span>Analysis History ({history.length})</span>
          </button>
          <button
            onClick={() => setSubTab('lab_queue')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              subTab === 'lab_queue' ? 'bg-brand-blue text-brand-cyan shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck size={14} />
            <span>Review Lab Queue ({labSubmissions.filter(s => s.status === 'PENDING_REVIEW').length})</span>
          </button>
        </div>
      </div>

      {/* Main View Switching */}
      {subTab === 'workspace' && (
        <div className="space-y-6">
          {/* Quick Demo Runner Banner */}
          {!predictions && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-brand-blue/40 via-secondary/40 to-brand-cyan/10 border border-brand-cyan/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-cyan/20 text-brand-cyan">
                  <Heart size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">Interactive 3D Anatomical Heart Active</h4>
                  <p className="text-xs text-slate-300">
                    Load a sample clinical case or enter individual multimodal parameters below to map stenosis risks.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handlePredict(DEMO_PATIENT, 'Elena Rostova (#CV-8821)')}
                disabled={isPredicting}
                className="px-3.5 py-1.5 bg-brand-cyan text-slate-950 font-bold rounded-lg text-xs hover:bg-brand-cyan/90 transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <PlayCircle size={14} />
                {isPredicting ? 'Evaluating ML Models...' : 'Run Analysis on Sample Patient'}
              </button>
            </div>
          )}

          {/* Grid: Left Column Prediction Summary | Right Column 3D Viewer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Probability Meters */}
            <div className="lg:col-span-1 space-y-6">
              {/* Overall CAD Assessment */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="text-brand-cyan" size={18} />
                  Overall CAD Probability (Cath)
                </h3>

                {overallCad ? (
                  <div className="flex flex-col items-center py-2">
                    <div className="relative">
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
                        <circle
                          cx="56" cy="56" r="48"
                          stroke="currentColor" strokeWidth="8" fill="transparent"
                          strokeDasharray={301.6}
                          strokeDashoffset={301.6 - (301.6 * overallCad.probability)}
                          className={overallCad.probability > 0.5 ? "text-risk-high" : "text-risk-low"}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-white">
                        {(overallCad.probability * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        overallCad.predicted_label === 1 ? 'bg-risk-high/20 text-risk-high' : 'bg-risk-low/20 text-risk-low'
                      }`}>
                        {overallCad.predicted_label === 1 ? <AlertCircle size={14}/> : <CheckCircle2 size={14}/>}
                        {overallCad.predicted_class}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">
                        Threshold-calibrated Random Forest classification
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 mb-2">
                      <Activity size={24} />
                    </div>
                    <div className="text-xs font-medium text-slate-300">Awaiting Patient Assessment</div>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                      Enter clinical data below or click 'Run Analysis' to calculate risk.
                    </p>
                  </div>
                )}
              </div>

              {/* Vessel Specific Risks Card */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-base font-semibold text-white mb-4">Coronary Artery Breakdown</h3>
                <div className="space-y-4">
                  {(['LAD', 'LCX', 'RCA'] as const).map(vessel => {
                    const pred = predictions ? predictions[vessel] : null;
                    const prob = pred ? pred.probability : null;
                    const isHigh = prob !== null && prob > 0.5;

                    return (
                      <div key={vessel} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-200">{vessel} Artery</span>
                          {pred ? (
                            <span className={isHigh ? 'text-risk-high font-bold' : 'text-risk-low font-bold'}>
                              {(pred.probability * 100).toFixed(1)}% ({pred.predicted_class})
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">Baseline</span>
                          )}
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              prob === null
                                ? 'bg-slate-700 w-1/4'
                                : isHigh
                                  ? 'bg-risk-high'
                                  : prob > 0.33
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                            }`}
                            style={{ width: prob !== null ? `${prob * 100}%` : '20%' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SHAP Explainability & Key Clinical Drivers */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <HelpCircle className="text-brand-cyan" size={18} />
                  Clinical Drivers & SHAP Weights
                </h3>
                <div className="space-y-2">
                  {explanations?.top_features ? (
                    explanations.top_features.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-secondary/40 border border-border/50">
                        <div>
                          <span className="text-slate-200 font-medium">{item.feature}</span>
                          <span className="text-[10px] text-slate-400 block">{item.category}</span>
                        </div>
                        <span className={`font-mono font-bold ${item.direction === 'reduces_risk' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.impact}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">
                      Submit patient parameters to generate multimodal feature weight attributions.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: 3D Visualization */}
            <div className="lg:col-span-2 space-y-6">
              <HeartModel predictions={predictions} />

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-base font-semibold text-white mb-2">Multimodal Feature Intake</h3>
                <p className="text-xs text-slate-300 mb-4">
                  Adjust patient demographic, laboratory, ECG, and echocardiographic variables to recompute predictions.
                </p>
                <PatientForm schema={schema} onSubmit={handlePredict} loading={isPredicting} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis History Sub-Tab */}
      {subTab === 'history' && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Recent Clinical Evaluations</h3>
            <span className="text-xs text-slate-400">Total Records: {history.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/40 text-slate-300 uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">Patient / Profile</th>
                  <th className="py-3 px-4">Evaluated By</th>
                  <th className="py-3 px-4">Cath CAD Risk</th>
                  <th className="py-3 px-4">LAD</th>
                  <th className="py-3 px-4">LCX</th>
                  <th className="py-3 px-4">RCA</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-brand-cyan">{row.id}</td>
                    <td className="py-3 px-4 text-white font-medium">
                      {row.patient_name} ({row.patient_age}y, {row.patient_sex})
                    </td>
                    <td className="py-3 px-4 text-slate-300">{row.doctor_name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        row.cath_probability > 0.5 ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {(row.cath_probability * 100).toFixed(0)}% ({row.cath_predicted})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">{(row.lad_probability * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-slate-300 font-mono">{(row.lcx_probability * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-slate-300 font-mono">{(row.rca_probability * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-slate-400">{new Date(row.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lab Submissions Queue Sub-Tab */}
      {subTab === 'lab_queue' && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Laboratory Findings Submission Queue</h3>
              <p className="text-xs text-slate-400">Review and verify biological measurements submitted by clinical laboratory staff</p>
            </div>
            <button
              onClick={fetchLabQueue}
              className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-white rounded-lg text-xs font-medium border border-border transition-all"
            >
              Refresh Queue
            </button>
          </div>

          <div className="space-y-4">
            {labSubmissions.map((sub) => (
              <div key={sub.id} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-brand-cyan">{sub.id}</span>
                    <span className="text-sm font-bold text-white">{sub.patient_name}</span>
                    <span className="text-xs text-slate-400">Submitted by: {sub.submitted_by}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      sub.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {sub.status}
                    </span>
                    {sub.status === 'PENDING_REVIEW' && (
                      <button
                        onClick={() => handleApproveLab(sub.id)}
                        disabled={approvingId === sub.id}
                        className="px-3 py-1 bg-brand-cyan hover:bg-brand-cyan/90 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-sm disabled:opacity-50"
                      >
                        {approvingId === sub.id ? 'Approving...' : 'Approve Findings'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Measurements Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
                  {Object.entries(sub.measurements).map(([k, v]) => (
                    <div key={k} className="p-2 rounded-lg bg-card/60 border border-border">
                      <span className="text-slate-400 block text-[10px]">{k}</span>
                      <span className="font-mono font-semibold text-white">{String(v)}</span>
                    </div>
                  ))}
                </div>

                {/* Flags / Alerts */}
                {sub.flags && sub.flags.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/20 text-xs text-rose-300">
                    <strong className="text-rose-200 block text-[11px] mb-1">Clinical Biomarker Flags:</strong>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {sub.flags.map((f: string, i: number) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
