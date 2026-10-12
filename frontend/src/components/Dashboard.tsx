import HeartModel from './HeartModel';
import { Activity, AlertCircle, CheckCircle2, PlayCircle, ArrowRight } from 'lucide-react';

interface DashboardProps {
  predictions: any;
  metrics?: any;
  onLoadDemoPatient?: () => void;
  onNavigateAnalysis?: () => void;
  isPredicting?: boolean;
}

export default function Dashboard({ 
  predictions, 
  metrics: _metrics,
  onLoadDemoPatient,
  onNavigateAnalysis,
  isPredicting
}: DashboardProps) {
  const overallCad = predictions ? predictions['Cath'] : null;

  return (
    <div className="space-y-6">
      {/* If no prediction is active, show a helpful interactive prompt banner */}
      {!predictions && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-brand-blue/30 via-secondary/40 to-brand-cyan/10 border border-brand-cyan/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              <Activity size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Interactive Anatomical Heart Loaded</h4>
              <p className="text-xs text-slate-300">
                Rotate, zoom, and select coronary arteries below. Load a patient dataset or enter clinical parameters to compute CAD risk.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {onLoadDemoPatient && (
              <button
                onClick={onLoadDemoPatient}
                disabled={isPredicting}
                className="px-3.5 py-1.5 bg-brand-cyan text-slate-950 font-bold rounded-lg text-xs hover:bg-brand-cyan/90 transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <PlayCircle size={14} />
                {isPredicting ? 'Evaluating ML...' : 'Load Sample Patient'}
              </button>
            )}
            {onNavigateAnalysis && (
              <button
                onClick={onNavigateAnalysis}
                className="px-3.5 py-1.5 bg-secondary hover:bg-secondary/80 text-white font-medium rounded-lg text-xs border border-border transition-all flex items-center gap-1"
              >
                <span>Enter Patient Data</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary & Vessel Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          {/* Overall Assessment Card */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Activity className="text-brand-cyan" size={20} />
              Overall CAD Assessment
            </h3>
            
            {overallCad ? (
              <div className="flex flex-col items-center py-4">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
                    <circle 
                      cx="64" cy="64" r="56" 
                      stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={351.8} 
                      strokeDashoffset={351.8 - (351.8 * overallCad.probability)} 
                      className={overallCad.probability > 0.5 ? "text-risk-high" : "text-risk-low"} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-primary">
                    {(overallCad.probability * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    overallCad.predicted_label === 1 ? 'bg-risk-high/20 text-risk-high' : 'bg-risk-low/20 text-risk-low'
                  }`}>
                    {overallCad.predicted_label === 1 ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>}
                    {overallCad.predicted_class}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Predicted overall coronary artery disease likelihood.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 mb-3">
                  <Activity size={28} />
                </div>
                <div className="text-sm font-semibold text-slate-300">Awaiting Patient Profile</div>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  Submit clinical parameters or click 'Load Sample Patient' to generate risk score.
                </p>
              </div>
            )}
          </div>
          
          {/* Vessel Specific Risks Card */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
             <h3 className="text-lg font-semibold text-primary mb-4">Vessel Specific Risks</h3>
             <div className="space-y-4">
                {(['LAD', 'LCX', 'RCA'] as const).map(vessel => {
                  const pred = predictions ? predictions[vessel] : null;
                  const prob = pred ? pred.probability : null;
                  const isHigh = prob !== null && prob > 0.5;
                  
                  return (
                    <div key={vessel} className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-300">{vessel}</span>
                        {pred ? (
                          <span className={isHigh ? 'text-risk-high font-semibold' : 'text-risk-low'}>
                            {(pred.probability * 100).toFixed(1)}% - {pred.predicted_class}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Baseline</span>
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
        </div>

        {/* Right Column: 3D Visualization */}
        <div className="lg:col-span-2 flex flex-col">
          <HeartModel predictions={predictions} />
          
          <div className="mt-6 bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-2">Interpretation & Explainability</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              The 3D anatomical viewer maps stenosis risk across the major coronary territories (Left Anterior Descending, Left Circumflex, and Right Coronary Artery). Model features assess statistical likelihood based on the patient's multimodal profile.
            </p>
            <div className="bg-secondary/50 p-4 rounded-lg border border-border/50 text-sm">
              <span className="text-brand-cyan font-semibold">Global Key Drivers (Approximate):</span> Typical Chest Pain, Age, Systolic Blood Pressure, Region RWMA, and Dyspnea.
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
