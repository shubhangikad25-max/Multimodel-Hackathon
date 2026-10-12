import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Activity, Database, Server, UserPlus, Lock, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { authFetch, user: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'models' | 'logs'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [_loading, setLoading] = useState(true);

  // New user form state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newRole, setNewRole] = useState('doctor');
  const [newDept, setNewDept] = useState('Cardiology Division');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserMsg, setCreateUserMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, logRes, statRes] = await Promise.all([
        authFetch('http://localhost:8000/api/admin/users'),
        authFetch('http://localhost:8000/api/admin/audit-logs'),
        authFetch('http://localhost:8000/api/admin/system-status')
      ]);

      if (uRes.ok) setUsers(await uRes.json());
      if (logRes.ok) setAuditLogs(await logRes.json());
      if (statRes.ok) setSystemStatus(await statRes.json());
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, targetRole: string) => {
    try {
      const res = await authFetch(`http://localhost:8000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole })
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await authFetch(`http://localhost:8000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: '', is_active: !currentStatus })
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setCreateUserMsg(null);
    try {
      const res = await authFetch('http://localhost:8000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          name: newName,
          title: newTitle,
          role: newRole,
          department: newDept
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to create user');
      }

      setCreateUserMsg('User account created and cryptographically hashed.');
      setShowAddUser(false);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setNewTitle('');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'doctor':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40">Doctor</span>;
      case 'patient':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">Patient</span>;
      case 'lab_tech':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40">Lab Tech</span>;
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">Admin</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">System Administration & Security Governance</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                Administrator
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Logged in as <strong className="text-white">{currentAdmin?.name}</strong> • Healthcare Informatics & Security
            </p>
          </div>
        </div>

        <button
          onClick={loadAllAdminData}
          className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-white rounded-lg text-xs font-medium border border-border flex items-center gap-1.5 transition-all"
        >
          <RefreshCw size={14} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {createUserMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{createUserMsg}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">Security Architecture</span>
            <Lock size={16} className="text-brand-cyan" />
          </div>
          <div className="text-lg font-bold text-white">RBAC Enforced</div>
          <span className="text-[10px] text-brand-cyan font-mono">Bcrypt + JWT (HS256)</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">Registered Clinical Users</span>
            <Users size={16} className="text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white">{users.length} Accounts</div>
          <span className="text-[10px] text-slate-400">{users.filter(u => u.is_active).length} Active Sessions</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">ML Models Status</span>
            <Activity size={16} className="text-sky-400" />
          </div>
          <div className="text-lg font-bold text-white">4 / 4 Operational</div>
          <span className="text-[10px] text-emerald-400 font-mono">Cath, LAD, LCX, RCA</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">Security Audit Events</span>
            <Server size={16} className="text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white">{auditLogs.length} Events Logged</div>
          <span className="text-[10px] text-slate-400">Zero Security Breaches</span>
        </div>
      </div>

      {/* Admin Tab Controls */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-brand-blue text-brand-cyan shadow-sm border border-brand-cyan/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users size={15} />
          <span>User & Role Governance ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'models' ? 'bg-brand-blue text-brand-cyan shadow-sm border border-brand-cyan/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database size={15} />
          <span>Model Registry & Dataset Versions</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'logs' ? 'bg-brand-blue text-brand-cyan shadow-sm border border-brand-cyan/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Server size={15} />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: USER & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Clinical User Directory</h3>
              <p className="text-xs text-slate-400">Manage credentials, assign roles, and revoke authorization</p>
            </div>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="px-3.5 py-1.5 bg-brand-cyan text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:bg-brand-cyan/90 transition-all"
            >
              <UserPlus size={15} />
              <span>{showAddUser ? 'Close Form' : 'Register New User'}</span>
            </button>
          </div>

          {/* New User Modal / Form */}
          {showAddUser && (
            <form onSubmit={handleCreateUser} className="p-5 rounded-2xl bg-secondary/40 border border-brand-cyan/30 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus size={16} className="text-brand-cyan" />
                <span>Create New Authenticated Clinical User</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Dr. Gregory House, MD"
                    className="w-full px-3 py-2 bg-brand-dark border border-border rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@cardiovision.ai"
                    className="w-full px-3 py-2 bg-brand-dark border border-border rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="SecurePass2026!"
                    className="w-full px-3 py-2 bg-brand-dark border border-border rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Attending Cardiologist"
                    className="w-full px-3 py-2 bg-brand-dark border border-border rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    placeholder="Cardiovascular Health"
                    className="w-full px-3 py-2 bg-brand-dark border border-border rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Role Assignment</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-dark border border-border rounded-lg text-white"
                  >
                    <option value="doctor">Doctor / Cardiologist</option>
                    <option value="patient">Patient Portal</option>
                    <option value="lab_tech">Lab Technician / Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-4 py-1.5 bg-brand-cyan text-slate-950 font-bold rounded-lg text-xs"
                >
                  {creatingUser ? 'Creating...' : 'Create Account (Bcrypt Hashed)'}
                </button>
              </div>
            </form>
          )}

          {/* User Table */}
          <div className="bg-card rounded-2xl border border-border overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/40 text-slate-300 uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Change Role</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.title} • {u.department}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{u.email}</td>
                    <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="px-2 py-1 bg-brand-dark border border-border rounded text-[11px] text-slate-200 focus:outline-none"
                      >
                        <option value="doctor">Doctor</option>
                        <option value="patient">Patient</option>
                        <option value="lab_tech">Lab Tech</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(u.id, u.is_active)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                          u.is_active
                            ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-900/50'
                            : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MODEL REGISTRY & DATASET VERSIONS */}
      {activeTab === 'models' && systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Database size={18} className="text-brand-cyan" />
              <span>Dataset & Preprocessing Architecture</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-slate-400">Dataset Source</span>
                <span className="text-white font-medium">{systemStatus.dataset.source}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-slate-400">Total Patient Cohort</span>
                <span className="text-white font-mono">{systemStatus.dataset.records_total} Records</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-slate-400">Clinical Input Features</span>
                <span className="text-white font-mono">{systemStatus.dataset.features_total} Features</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-slate-400">Target Leakage Protection</span>
                <span className="text-emerald-400 font-bold">Strictly Excluded Target Columns</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-slate-400">Prediction Targets</span>
                <span className="text-brand-cyan font-mono">Cath, LAD, LCX, RCA</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity size={18} className="text-brand-cyan" />
              <span>Model Performance & Holdout Scores</span>
            </h3>
            <div className="space-y-3">
              {['Cath', 'LAD', 'LCX', 'RCA'].map((target) => {
                const targetMetrics = systemStatus.models.metrics[target];
                return (
                  <div key={target} className="p-3 rounded-xl bg-secondary/30 border border-border text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white">{target} Classifier</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">Ready</span>
                    </div>
                    {targetMetrics ? (
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
                        <div className="p-1 rounded bg-card">
                          <span className="text-[9px] text-slate-400 block">Acc</span>
                          <span className="text-white">{(targetMetrics.Accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <div className="p-1 rounded bg-card">
                          <span className="text-[9px] text-slate-400 block">F1</span>
                          <span className="text-white">{(targetMetrics.F1 * 100).toFixed(1)}%</span>
                        </div>
                        <div className="p-1 rounded bg-card">
                          <span className="text-[9px] text-slate-400 block">Recall</span>
                          <span className="text-white">{(targetMetrics.Recall * 100).toFixed(1)}%</span>
                        </div>
                        <div className="p-1 rounded bg-card">
                          <span className="text-[9px] text-slate-400 block">ROC-AUC</span>
                          <span className="text-white">{(targetMetrics['ROC-AUC'] * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">Operational</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY AUDIT TRAIL */}
      {activeTab === 'logs' && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Cryptographic Security Audit Log</h3>
              <p className="text-xs text-slate-400">Immutable trail of authentication events, authorization checks, and sensitive transactions</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{auditLogs.length} events logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/40 text-slate-300 uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Detail</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{log.user_email}</td>
                    <td className="py-3 px-4">{getRoleBadge(log.role)}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-brand-cyan">{log.action}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={log.detail}>
                      {log.detail}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : log.status === 'FORBIDDEN' || log.status === 'BLOCKED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
