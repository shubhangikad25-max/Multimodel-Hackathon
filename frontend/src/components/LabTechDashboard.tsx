import React, { useState, useEffect } from 'react';
import { FlaskConical, Beaker, AlertTriangle, CheckCircle2, Send, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../lib/api';

interface LabFieldConfig {
  key: string;
  label: string;
  unit: string;
  minNormal: number;
  maxNormal: number;
  defaultValue: number;
}

const LAB_FIELDS: LabFieldConfig[] = [
  { key: 'FBS', label: 'Fasting Blood Sugar', unit: 'mg/dL', minNormal: 70, maxNormal: 99, defaultValue: 95 },
  { key: 'CR', label: 'Serum Creatinine', unit: 'mg/dL', minNormal: 0.6, maxNormal: 1.2, defaultValue: 0.9 },
  { key: 'TG', label: 'Triglycerides', unit: 'mg/dL', minNormal: 40, maxNormal: 149, defaultValue: 140 },
  { key: 'LDL', label: 'LDL Cholesterol', unit: 'mg/dL', minNormal: 50, maxNormal: 99, defaultValue: 98 },
  { key: 'HDL', label: 'HDL Cholesterol', unit: 'mg/dL', minNormal: 50, maxNormal: 90, defaultValue: 58 },
  { key: 'BUN', label: 'Blood Urea Nitrogen', unit: 'mg/dL', minNormal: 7, maxNormal: 20, defaultValue: 14 },
  { key: 'ESR', label: 'Sedimentation Rate (ESR)', unit: 'mm/hr', minNormal: 0, maxNormal: 20, defaultValue: 12 },
  { key: 'HB', label: 'Hemoglobin', unit: 'g/dL', minNormal: 12.0, maxNormal: 17.0, defaultValue: 14.2 },
  { key: 'K', label: 'Potassium (K+)', unit: 'mEq/L', minNormal: 3.5, maxNormal: 5.1, defaultValue: 4.4 },
  { key: 'Na', label: 'Sodium (Na+)', unit: 'mEq/L', minNormal: 135, maxNormal: 145, defaultValue: 140 },
  { key: 'WBC', label: 'White Blood Cell Count', unit: '/mcL', minNormal: 4500, maxNormal: 11000, defaultValue: 6200 },
  { key: 'PLT', label: 'Platelet Count', unit: '/mcL', minNormal: 150000, maxNormal: 450000, defaultValue: 255000 },
  { key: 'BP', label: 'Systolic Blood Pressure', unit: 'mmHg', minNormal: 90, maxNormal: 120, defaultValue: 118 },
  { key: 'PR', label: 'Pulse Rate', unit: 'bpm', minNormal: 60, maxNormal: 100, defaultValue: 72 }
];

export default function LabTechDashboard() {
  const { authFetch, user } = useAuth();
  const [patientId, setPatientId] = useState('usr_pat_01');
  const [patientName, setPatientName] = useState('Elena Rostova (#CV-8821)');
  const [notes, setNotes] = useState('Specimen collected via standard venipuncture following 12-hour fast.');
  const [measurements, setMeasurements] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    LAB_FIELDS.forEach(f => { init[f.key] = f.defaultValue; });
    return init;
  });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/lab/submissions`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFieldChange = (key: string, val: string) => {
    const num = parseFloat(val) || 0;
    setMeasurements(prev => ({ ...prev, [key]: num }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const res = await authFetch(`${API_BASE_URL}/api/lab/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          patient_name: patientName,
          measurements,
          notes
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Submission failed');
      }

      const result = await res.json();
      setSuccessMessage(`Measurement panel #${result.id} submitted successfully to clinical queue.`);
      fetchSubmissions();
    } catch (err: any) {
      alert(`Error submitting lab measurements: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <FlaskConical size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Laboratory Measurement Intake Portal</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/40">
                Medical Staff / Lab Technologist
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Logged in as <strong className="text-white">{user?.name}</strong> • {user?.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Biological Reference Range Validation Active</span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Measurement Intake Form & Review Queue Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Beaker size={18} className="text-sky-400" />
                Specimen & Biomarker Entry
              </h3>
              <p className="text-xs text-slate-400">Values are validated against biological adult reference intervals</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">14 Analytes</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Patient Meta Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Patient ID / MRN</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-dark border border-border rounded-lg text-white text-xs font-mono focus:outline-none focus:border-brand-cyan"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-dark border border-border rounded-lg text-white text-xs focus:outline-none focus:border-brand-cyan"
                  required
                />
              </div>
            </div>

            {/* Analytes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {LAB_FIELDS.map((f) => {
                const currentVal = measurements[f.key] ?? f.defaultValue;
                const isOutOfRange = currentVal < f.minNormal || currentVal > f.maxNormal;

                return (
                  <div
                    key={f.key}
                    className={`p-3 rounded-xl border transition-all ${
                      isOutOfRange
                        ? 'border-amber-500/40 bg-amber-950/20'
                        : 'border-border bg-secondary/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-200">{f.label}</span>
                      {isOutOfRange ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          <AlertTriangle size={10} />
                          {currentVal > f.maxNormal ? 'HIGH' : 'LOW'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">
                          Normal
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        value={currentVal}
                        onChange={(e) => handleFieldChange(f.key, e.target.value)}
                        className="w-full px-3 py-1.5 bg-brand-dark border border-border rounded-lg text-white text-xs font-mono focus:outline-none focus:border-brand-cyan"
                      />
                      <span className="text-xs text-slate-400 font-mono min-w-[50px]">{f.unit}</span>
                    </div>

                    <span className="text-[10px] text-slate-500 block mt-1">
                      Ref: {f.minNormal} - {f.maxNormal} {f.unit}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Technologist Specimen Notes & Pre-analytical Remarks
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full p-3 bg-brand-dark border border-border rounded-xl text-white text-xs focus:outline-none focus:border-brand-cyan placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={16} />
              <span>{submitting ? 'Submitting to Clinical Queue...' : 'Submit Measurements for Clinician Review'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Submission History Queue (5 cols) */}
        <div className="lg:col-span-5 bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-semibold text-white">Recent Laboratory Submissions</h3>
              <p className="text-xs text-slate-400">Clinical queue status & clinician reviews</p>
            </div>
            <button
              onClick={fetchSubmissions}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-secondary transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-3.5 rounded-xl bg-secondary/30 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-400">{sub.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    sub.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {sub.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-white">{sub.patient_name}</div>
                <div className="text-[11px] text-slate-400">Submitted by: {sub.submitted_by}</div>

                {sub.flags && sub.flags.length > 0 && (
                  <div className="p-2 rounded bg-amber-950/30 border border-amber-500/20 text-[10px] text-amber-300">
                    {sub.flags[0]} {sub.flags.length > 1 && `(+${sub.flags.length - 1} more)`}
                  </div>
                )}

                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-border/50">
                  <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                  <span>{sub.reviewed_by ? `Reviewed by ${sub.reviewed_by}` : 'Pending Doctor Review'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
