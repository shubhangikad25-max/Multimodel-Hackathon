import React, { useState } from 'react';
import { Heart, Lock, Mail, Eye, EyeOff, ShieldCheck, Stethoscope, User, FlaskConical, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';

interface DemoAccount {
  role: UserRole;
  label: string;
  name: string;
  email: string;
  password: string;
  description: string;
  icon: React.ReactNode;
  badgeColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'doctor',
    label: 'Doctor / Cardiologist',
    name: 'Dr. Sarah Chen, MD, FACC',
    email: 'doctor@cardiovision.ai',
    password: 'DoctorPass2026!',
    description: 'Patient analysis, 3D arterial risk map, SHAP explanations & history',
    icon: <Stethoscope size={18} />,
    badgeColor: 'border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan'
  },
  {
    role: 'patient',
    label: 'Patient Portal',
    name: 'Elena Rostova (Record #CV-8821)',
    email: 'patient@cardiovision.ai',
    password: 'PatientPass2026!',
    description: 'Personalized heart health summary, simplified risk, 3D explorer & report',
    icon: <User size={18} />,
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
  },
  {
    role: 'lab_tech',
    label: 'Lab Technician',
    name: 'Marcus Vance, MLS',
    email: 'labtech@cardiovision.ai',
    password: 'LabTechPass2026!',
    description: 'Biomarker measurement entry, reference range validation & queue',
    icon: <FlaskConical size={18} />,
    badgeColor: 'border-sky-500/40 bg-sky-500/10 text-sky-400'
  },
  {
    role: 'admin',
    label: 'Administrator',
    name: 'Alex Mercer, CISSP',
    email: 'admin@cardiovision.ai',
    password: 'AdminPass2026!',
    description: 'User & role management, model health status & security audit logs',
    icon: <ShieldCheck size={18} />,
    badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-400'
  }
];

export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<UserRole | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email.trim()) {
      setValidationError('Please enter your clinical email address.');
      return;
    }
    if (!password) {
      setValidationError('Please enter your account password.');
      return;
    }

    setSubmitting(true);
    await login(email, password);
    setSubmitting(false);
  };

  const handleSelectDemo = async (account: DemoAccount, autoSubmit: boolean = true) => {
    setEmail(account.email);
    setPassword(account.password);
    setSelectedDemo(account.role);
    setValidationError(null);

    if (autoSubmit) {
      setSubmitting(true);
      await login(account.email, account.password);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-brand-dark relative overflow-hidden">
      {/* Background ambient medical glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-cyan/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-cyan-950/20 blur-[160px] pointer-events-none" />

      <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand Hero & Value Proposition */}
        <div className="lg:col-span-5 text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/60 border border-brand-cyan/30 text-brand-cyan text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-brand-cyan animate-pulse"></span>
            Role-Enforced Clinical Security
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-blue to-cyan-950 border border-brand-cyan/40 shadow-[0_0_20px_rgba(100,255,218,0.2)]">
                <Heart className="h-8 w-8 text-brand-cyan animate-pulse" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                CARDIOVISION <span className="text-brand-cyan">AI</span>
              </h1>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Multimodal cardiovascular risk assessment, 3D coronary artery probability mapping, and backend-enforced role-based access control.
            </p>
          </div>

          {/* Key Security Guarantees */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border text-xs text-slate-300">
              <ShieldCheck className="h-4 w-4 text-brand-cyan mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-white block font-medium">Backend-Enforced Authorization</strong>
                Zero client-side trust. All prediction, lab, and admin APIs are strictly protected via signed JWT tokens and role policies.
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border text-xs text-slate-300">
              <Lock className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-white block font-medium">Patient Data Isolation</strong>
                Patients are cryptographically restricted to their own authorized clinical records. Cross-patient inspection is blocked.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Login Card & Demo Selector */}
        <div className="lg:col-span-7 bg-card/90 backdrop-blur-xl border border-brand-cyan/20 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Clinical Portal Sign In</h2>
              <p className="text-xs text-slate-400 mt-0.5">Authenticate with your credentials or test a demo role</p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-secondary text-brand-cyan border border-brand-cyan/20">
              Dev Mode
            </span>
          </div>

          {/* Error Banner */}
          {(validationError || authError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 flex items-start gap-3 text-rose-200 text-xs">
              <AlertCircle size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 font-medium">{validationError || authError}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Clinical Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cardiovision.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-dark/80 border border-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/40 transition-all placeholder:text-slate-500"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-brand-dark/80 border border-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/40 transition-all placeholder:text-slate-500"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-brand-cyan hover:bg-brand-cyan/90 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(100,255,218,0.25)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating Role & Token...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Clinical Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Selector */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                1-Click Quick Demo Profiles
              </span>
              <span className="text-[11px] text-slate-400">Select any role to test authorization</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = selectedDemo === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectDemo(acc, true)}
                    disabled={submitting}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-cyan bg-brand-blue/60 shadow-[0_0_15px_rgba(100,255,218,0.15)]'
                        : 'border-border bg-secondary/30 hover:bg-secondary/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded-lg border text-xs ${acc.badgeColor}`}>
                          {acc.icon}
                        </span>
                        <span className="text-xs font-bold text-white">{acc.label}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={14} className="text-brand-cyan" />}
                    </div>

                    <div className="text-[11px] font-medium text-slate-200 truncate">{acc.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{acc.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
