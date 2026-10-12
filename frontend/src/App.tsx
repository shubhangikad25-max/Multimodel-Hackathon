import { useState, useEffect } from 'react';
import { Heart, Activity, BarChart3, Info, AlertTriangle, LogOut, ShieldCheck, User, FlaskConical, Stethoscope } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import LabTechDashboard from './components/LabTechDashboard';
import AdminDashboard from './components/AdminDashboard';
import Performance from './components/Performance';

function MainApp() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('main');
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    // Check backend health and load public metadata
    fetch('http://localhost:8000/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data))
      .catch(err => setBackendStatus({ status: 'error', error: String(err) }));
      
    fetch('http://localhost:8000/api/model/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error);
      
    fetch('http://localhost:8000/api/features/schema')
      .then(res => res.json())
      .then(data => setSchema(data))
      .catch(console.error);
  }, []);

  // Show loading spinner while restoring session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-brand-cyan font-medium tracking-wide">Validating Clinical Session...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, render the login page
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const getRoleTheme = (role: string) => {
    switch (role) {
      case 'doctor':
        return {
          icon: <Stethoscope size={14} />,
          label: 'Cardiologist',
          badgeClass: 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40',
          indicator: 'bg-brand-cyan'
        };
      case 'patient':
        return {
          icon: <User size={14} />,
          label: 'Patient',
          badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          indicator: 'bg-emerald-400'
        };
      case 'lab_tech':
        return {
          icon: <FlaskConical size={14} />,
          label: 'Lab Technologist',
          badgeClass: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
          indicator: 'bg-sky-400'
        };
      case 'admin':
        return {
          icon: <ShieldCheck size={14} />,
          label: 'Administrator',
          badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          indicator: 'bg-amber-400'
        };
      default:
        return {
          icon: <Activity size={14} />,
          label: role,
          badgeClass: 'bg-slate-700 text-slate-300 border-slate-600',
          indicator: 'bg-slate-400'
        };
    }
  };

  const roleTheme = getRoleTheme(user.role);

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-slate-100">
      {/* Top Clinical Navigation Bar */}
      <nav className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-blue to-cyan-950 border border-brand-cyan/30">
                <Heart className="h-6 w-6 text-brand-cyan" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white block">
                  CARDIOVISION <span className="text-brand-cyan">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium block -mt-1 hidden sm:block">
                  Multimodal Cardiovascular Intelligence
                </span>
              </div>
            </div>

            {/* Navigation links tailored to current role */}
            <div className="hidden md:flex items-center space-x-2">
              <NavButton active={activeTab === 'main'} onClick={() => setActiveTab('main')} icon={<Activity size={16}/>}>
                {user.role === 'doctor' && 'Cardiology Workspace'}
                {user.role === 'patient' && 'My Heart Portal'}
                {user.role === 'lab_tech' && 'Lab Intake & Queue'}
                {user.role === 'admin' && 'Admin Governance'}
              </NavButton>

              {(user.role === 'doctor' || user.role === 'admin') && (
                <NavButton active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} icon={<BarChart3 size={16}/>}>
                  Model Performance
                </NavButton>
              )}

              <NavButton active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} icon={<Info size={16}/>}>
                Clinical Protocols
              </NavButton>
            </div>

            {/* Right: User Profile Badge, Status & Logout */}
            <div className="flex items-center gap-3">
              {/* API Status Dot */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/40 border border-border text-xs text-slate-400">
                <span className={`h-2 w-2 rounded-full ${backendStatus?.status === 'ok' ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`}></span>
                <span className="text-[11px] font-mono">API {backendStatus?.status === 'ok' ? 'Online' : 'Offline'}</span>
              </div>

              {/* User Identity Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{user.title}</div>
                </div>

                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${roleTheme.badgeClass}`}>
                  {roleTheme.icon}
                  <span className="capitalize">{roleTheme.label}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-all border border-transparent hover:border-rose-500/30"
                  title="Sign Out / Revoke Session"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Safety Disclaimer Banner */}
        <div className="mb-6 p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-3 backdrop-blur-sm">
          <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-200 leading-relaxed">
            <strong className="text-blue-100 font-semibold">EDUCATIONAL AND DECISION-SUPPORT PROTOTYPE.</strong> Model-generated estimates and 3D arterial risk mappings are assistive tools and do not constitute a definitive medical diagnosis. This platform does not replace professional clinical judgment or indicated invasive coronary angiography.
          </p>
        </div>

        {/* Dynamic View Rendering Based on Active Tab and User Role */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'main' && (
            <>
              {user.role === 'doctor' && <DoctorDashboard metrics={metrics} schema={schema} />}
              {user.role === 'patient' && <PatientDashboard />}
              {user.role === 'lab_tech' && <LabTechDashboard />}
              {user.role === 'admin' && <AdminDashboard />}
            </>
          )}

          {activeTab === 'performance' && (user.role === 'doctor' || user.role === 'admin') && (
            <Performance metrics={metrics} />
          )}

          {activeTab === 'docs' && (
            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm prose prose-invert max-w-none space-y-6">
              <h2 className="text-2xl font-bold text-white mb-2">CardioVision AI Clinical System Architecture</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                <div className="p-5 rounded-xl bg-secondary/30 border border-border space-y-2">
                  <h4 className="font-bold text-brand-cyan text-sm flex items-center gap-2">
                    <ShieldCheck size={16} />
                    Backend Role-Based Access Control (RBAC)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Authorization is strictly enforced in FastAPI dependencies using signed JSON Web Tokens (HS256) and Bcrypt (12 rounds) salted password hashing. Sensitive endpoints (predictions, lab approvals, user accounts) return HTTP 403 Forbidden to unauthorized roles.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-secondary/30 border border-border space-y-2">
                  <h4 className="font-bold text-brand-cyan text-sm flex items-center gap-2">
                    <User size={16} />
                    Patient Record Cryptographic Isolation
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Patients are cryptographically restricted to their own medical record. Any attempt to query another patient's data results in immediate backend rejection with audit logging.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-brand-cyan mt-6">Clinical Dataset & Zero Target Leakage</h3>
              <p className="text-slate-300 text-sm">
                Models are trained on the extension of the Z-Alizadeh Sani clinical dataset (303 records, 59 multimodal features across demographics, symptoms, ECG, echocardiography, and laboratory biomarkers). All target variables (<code className="text-brand-cyan">Cath</code>, <code className="text-brand-cyan">LAD</code>, <code className="text-brand-cyan">LCX</code>, <code className="text-brand-cyan">RCA</code>) were strictly removed from the predictor feature set to eliminate target leakage.
              </p>

              <h3 className="text-lg font-semibold text-brand-cyan mt-6">3D Anatomical Coronary Tree Mapping</h3>
              <p className="text-slate-300 text-sm">
                The Three.js anatomical viewer visualizes the 3 primary coronary arteries conforming to the ventricular sulci:
              </p>
              <ul className="text-slate-300 text-sm list-disc pl-5 space-y-1">
                <li><strong className="text-white">LAD (Left Anterior Descending):</strong> Courses down the anterior interventricular sulcus toward the apex.</li>
                <li><strong className="text-white">LCX (Left Circumflex):</strong> Courses along the left atrioventricular groove supplying the posterolateral wall.</li>
                <li><strong className="text-white">RCA (Right Coronary Artery):</strong> Courses along the right coronary sulcus supplying the right ventricle and inferior myocardium.</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, children, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2
        ${active 
          ? 'bg-brand-blue text-brand-cyan border border-brand-cyan/30 shadow-[0_0_15px_rgba(100,255,218,0.15)]' 
          : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      {icon}
      {children}
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
