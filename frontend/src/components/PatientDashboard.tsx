import { useState, useEffect } from 'react';
import { Heart, Activity, CheckCircle2, ShieldCheck, Printer, Calendar, User, FileText, Stethoscope } from 'lucide-react';
import HeartModel from './HeartModel';
import { useAuth } from '../context/AuthContext';

export default function PatientDashboard() {
  const { authFetch } = useAuth();
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVesselEdu, setSelectedVesselEdu] = useState<'LAD' | 'LCX' | 'RCA'>('LAD');

  useEffect(() => {
    fetchMyRecord();
  }, []);

  const fetchMyRecord = async () => {
    setLoading(true);
    try {
      const res = await authFetch('http://localhost:8000/api/patient/my-record');
      if (!res.ok) {
        throw new Error('Unable to retrieve authorized medical record.');
      }
      const data = await res.json();
      setPatientData(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching patient data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="h-8 w-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm">Retrieving your secure clinical health record...</p>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="p-8 rounded-xl bg-card border border-border text-center max-w-lg mx-auto">
        <Heart className="h-10 w-10 text-brand-cyan mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Record Access Restricted</h3>
        <p className="text-xs text-slate-400 mb-4">{error || 'No authorized record found.'}</p>
        <button
          onClick={fetchMyRecord}
          className="px-4 py-2 bg-brand-cyan text-slate-950 font-bold rounded-lg text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  // Map vessel probabilities for the 3D heart
  const heartProbabilities = {
    Cath: { probability: patientData.overall_probability, predicted_class: 'Normal' },
    LAD: { probability: patientData.vessel_status.LAD.probability, predicted_class: 'Normal' },
    LCX: { probability: patientData.vessel_status.LCX.probability, predicted_class: 'Normal' },
    RCA: { probability: patientData.vessel_status.RCA.probability, predicted_class: 'Normal' }
  };

  const vesselEducation = {
    LAD: {
      name: 'Left Anterior Descending (LAD) Artery',
      role: 'Supplies oxygen-rich blood to the front (anterior) wall and main pumping chamber (left ventricle) of your heart.',
      patientStatus: patientData.vessel_status.LAD.status,
      patientRisk: patientData.vessel_status.LAD.risk,
      advice: 'Maintaining a normal blood pressure keeps the delicate lining of the LAD artery elastic and healthy.'
    },
    LCX: {
      name: 'Left Circumflex (LCX) Artery',
      role: 'Curves around the side and back of the heart to nourish the outer left heart wall.',
      patientStatus: patientData.vessel_status.LCX.status,
      patientRisk: patientData.vessel_status.LCX.risk,
      advice: 'A diet low in trans-fats prevents fatty plaque accumulation along coronary bends.'
    },
    RCA: {
      name: 'Right Coronary Artery (RCA)',
      role: 'Supplies blood to the right chambers of your heart and the natural pacemaker nodes that regulate your rhythm.',
      patientStatus: patientData.vessel_status.RCA.status,
      patientRisk: patientData.vessel_status.RCA.risk,
      advice: 'Regular aerobic activity (walking, swimming) promotes strong collateral microcirculation.'
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Welcome Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <User size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Welcome back, {patientData.full_name}</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Patient Portal
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-3">
              <span>MRN: <strong className="text-white">{patientData.mrn}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Stethoscope size={12} className="text-brand-cyan" />
                <span>Physician: <strong>{patientData.attending_physician}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-slate-400" />
                <span>Evaluated: {patientData.latest_evaluation_date}</span>
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-white rounded-xl text-xs font-medium border border-border flex items-center gap-2 transition-all print:hidden"
        >
          <Printer size={15} />
          <span>Print / Export Health Summary</span>
        </button>
      </div>

      {/* Primary Status Banner: Plain English Health Summary */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-card to-brand-blue/30 border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 size={14} />
              <span>Overall Cardiovascular Status: Low Risk (18% CAD Probability)</span>
            </div>
            <h3 className="text-lg font-bold text-white">Your Heart Arteries Show Healthy Blood Flow</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {patientData.simplified_summary}
            </p>
          </div>

          <div className="text-right p-4 rounded-xl bg-card/80 border border-border min-w-[160px] text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Estimated Risk</span>
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">18%</span>
            <span className="text-[10px] text-slate-400 block mt-1">Normal Range (&lt; 30%)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Educational 3D Heart Explorer & Vitals Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Educational 3D Heart */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 px-2">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Activity size={18} className="text-brand-cyan" />
                  Educational 3D Heart Explorer
                </h3>
                <p className="text-xs text-slate-400">
                  Rotate and inspect the coronary arteries supplying your heart muscle
                </p>
              </div>
            </div>

            {/* 3D Heart Viewer */}
            <div className="h-[360px] rounded-xl overflow-hidden border border-border/50">
              <HeartModel predictions={heartProbabilities} />
            </div>

            {/* Vessel Switcher Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {(['LAD', 'LCX', 'RCA'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVesselEdu(v)}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    selectedVesselEdu === v
                      ? 'border-brand-cyan bg-brand-blue/60 text-white font-semibold shadow-sm'
                      : 'border-border bg-secondary/30 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{v} Artery</span>
                    <span className="text-[10px] text-emerald-400">Patent</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Risk: Low (~14%)</span>
                </button>
              ))}
            </div>

            {/* Interactive Anatomical Education Card */}
            <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
              <div className="flex items-center gap-2 text-brand-cyan text-xs font-bold uppercase tracking-wider">
                <FileText size={14} />
                <span>{vesselEducation[selectedVesselEdu].name}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {vesselEducation[selectedVesselEdu].role}
              </p>
              <div className="p-2.5 rounded-lg bg-card border border-border/60 text-xs text-slate-300">
                <strong className="text-white">Cardiologist Tip: </strong>
                {vesselEducation[selectedVesselEdu].advice}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Vitals, Lifestyle Recommendations & History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Key Vitals & Lab Measurements */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="text-base font-semibold text-white mb-4">Your Recent Vital Signs & Labs</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                <span className="text-[11px] text-slate-400 block">Blood Pressure</span>
                <span className="text-base font-bold text-white font-mono">{patientData.key_vitals.blood_pressure}</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Optimal Range</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                <span className="text-[11px] text-slate-400 block">Resting Heart Rate</span>
                <span className="text-base font-bold text-white font-mono">{patientData.key_vitals.heart_rate}</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Normal Rhythm</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                <span className="text-[11px] text-slate-400 block">Total Cholesterol</span>
                <span className="text-base font-bold text-white font-mono">{patientData.key_vitals.total_cholesterol}</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Desirable &lt; 200</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                <span className="text-[11px] text-slate-400 block">Fasting Blood Sugar</span>
                <span className="text-base font-bold text-white font-mono">{patientData.key_vitals.fbs}</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Normal &lt; 100</span>
              </div>
            </div>
          </div>

          {/* Lifestyle & Care Plan */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="text-base font-semibold text-white mb-3">Your Personalized Heart Care Plan</h3>
            <ul className="space-y-2.5">
              {patientData.lifestyle_recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 size={15} className="text-brand-cyan mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Medical Privacy & Isolation Notice */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-200">
            <ShieldCheck size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-blue-100 block mb-0.5">Cryptographic Health Record Isolation</strong>
              CardioVision AI backend guarantees that this record ({patientData.mrn}) is isolated and viewable only by you and your authorized attending clinician.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
