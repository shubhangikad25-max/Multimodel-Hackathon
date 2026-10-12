import React, { useState, useEffect } from 'react';
import { Activity, Beaker, FileHeart, User, HeartPulse } from 'lucide-react';

const FEATURE_GROUPS = [
  { id: 'demographics', title: 'Demographics', icon: <User size={18} />, fields: ['Age', 'Weight', 'Length', 'Sex', 'BMI', 'Obesity'] },
  { id: 'comorbidities', title: 'Risk Factors', icon: <Activity size={18} />, fields: ['DM', 'HTN', 'Current Smoker', 'EX-Smoker', 'FH', 'CRF', 'CVA', 'Airway disease', 'Thyroid Disease', 'CHF', 'DLP'] },
  { id: 'clinical', title: 'Clinical Exam', icon: <HeartPulse size={18} />, fields: ['BP', 'PR', 'Edema', 'Weak Peripheral Pulse', 'Lung rales', 'Systolic Murmur', 'Diastolic Murmur', 'Typical Chest Pain', 'Dyspnea', 'Function Class', 'Atypical', 'Nonanginal', 'Exertional CP', 'LowTH Ang'] },
  { id: 'ecg', title: 'ECG', icon: <Activity size={18} />, fields: ['Q Wave', 'St Elevation', 'St Depression', 'Tinversion', 'LVH', 'Poor R Progression', 'BBB'] },
  { id: 'labs', title: 'Laboratory', icon: <Beaker size={18} />, fields: ['FBS', 'CR', 'TG', 'LDL', 'HDL', 'BUN', 'ESR', 'HB', 'K', 'Na', 'WBC', 'Lymph', 'Neut', 'PLT'] },
  { id: 'echo', title: 'Echocardiography', icon: <FileHeart size={18} />, fields: ['EF-TTE', 'Region RWMA', 'VHD'] }
];

// Sample demo patient (Normal)
export const DEMO_PATIENT = {
  "Age": 55, "Weight": 70, "Length": 170, "Sex": "F", "BMI": 24.2, "Obesity": "N",
  "DM": 0, "HTN": 0, "Current Smoker": 0, "EX-Smoker": 0, "FH": 0, "CRF": "N", "CVA": "N", "Airway disease": "N", "Thyroid Disease": "N", "CHF": "N", "DLP": "N",
  "BP": 120, "PR": 75, "Edema": 0, "Weak Peripheral Pulse": "N", "Lung rales": "N", "Systolic Murmur": "N", "Diastolic Murmur": "N", "Typical Chest Pain": 0, "Dyspnea": "N", "Function Class": 0, "Atypical": "N", "Nonanginal": "N", "Exertional CP": "N", "LowTH Ang": "N",
  "Q Wave": 0, "St Elevation": 0, "St Depression": 0, "Tinversion": 0, "LVH": "N", "Poor R Progression": "N", "BBB": "N",
  "FBS": 90, "CR": 0.9, "TG": 150, "LDL": 100, "HDL": 55, "BUN": 15, "ESR": 10, "HB": 13.5, "K": 4.5, "Na": 140, "WBC": 6000, "Lymph": 30, "Neut": 60, "PLT": 250000,
  "EF-TTE": 55, "Region RWMA": 0, "VHD": "N"
};

export default function PatientForm({ schema, onSubmit, loading }: any) {
  const [formData, setFormData] = useState<any>({});
  const [activeGroup, setActiveGroup] = useState('demographics');

  // Initialize form
  useEffect(() => {
    if (schema && schema.all_features) {
      const initial: any = {};
      schema.all_features.forEach((f: string) => {
        initial[f] = schema.numeric.includes(f) ? 0 : 'N';
      });
      setFormData(initial);
    }
  }, [schema]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleLoadDemo = () => {
    setFormData({ ...formData, ...DEMO_PATIENT });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!schema || !schema.all_features) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading schema...</div>;
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 bg-secondary/30 p-4 border-r border-border flex flex-col gap-2">
        <h3 className="font-semibold text-primary mb-4 px-2">Patient Categories</h3>
        {FEATURE_GROUPS.map(group => (
          <button
            key={group.id}
            onClick={() => setActiveGroup(group.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
              activeGroup === group.id 
                ? 'bg-brand-blue text-brand-cyan border border-brand-cyan/20' 
                : 'text-muted-foreground hover:bg-white/5 hover:text-primary'
            }`}
          >
            {group.icon}
            {group.title}
          </button>
        ))}
        
        <div className="mt-auto pt-6 space-y-3">
          <button 
            type="button" 
            onClick={handleLoadDemo}
            className="w-full py-2 px-4 rounded-lg text-sm font-medium border border-border bg-card hover:bg-secondary transition-colors"
          >
            Load Demo Patient
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-gradient-to-r from-brand-blue to-[#113350] border border-brand-cyan/30 text-brand-cyan shadow-[0_0_15px_rgba(100,255,218,0.1)] hover:shadow-[0_0_25px_rgba(100,255,218,0.2)] transition-all disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Run Prediction'}
          </button>
        </div>
      </div>
      
      {/* Form Fields */}
      <div className="flex-1 p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-bold text-primary mb-6">
          {FEATURE_GROUPS.find(g => g.id === activeGroup)?.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_GROUPS.find(g => g.id === activeGroup)?.fields.map(field => {
            if (!schema.all_features.includes(field)) return null;
            
            const isNumeric = schema.numeric.includes(field);
            
            return (
              <div key={field} className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block truncate" title={field}>
                  {field}
                </label>
                {isNumeric ? (
                  <input 
                    type="number"
                    step="any"
                    value={formData[field] || ''}
                    onChange={(e) => handleChange(field, parseFloat(e.target.value))}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-shadow"
                  />
                ) : (
                  <select
                    value={formData[field] || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-shadow appearance-none"
                  >
                    {/* Simplified categorical options for UI. In a real app, extract unique values from dataset */}
                    <option value="N">No / Normal (N)</option>
                    <option value="Y">Yes / Abnormal (Y)</option>
                    {field === 'Sex' && (
                      <>
                        <option value="F">Female</option>
                        <option value="M">Male</option>
                      </>
                    )}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
