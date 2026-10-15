import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_USERS } from '../../data/mockData';
import { UserRole } from '../../types';
import { ShieldCheck, HardHat, Users, Landmark, FileText, ArrowRight, CheckCircle2, Lock, Mail } from 'lucide-react';

const ROLE_PRESETS: {
  role: UserRole;
  label: string;
  email: string;
  pass: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
}[] = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    email: 'admin@adrokorba.com',
    pass: 'admin@adro2026',
    desc: 'Unrestricted master access: All sites, user roles, company settings, audit logs & master configuration.',
    icon: ShieldCheck,
    tags: ['All Modules', 'Role Matrix', 'Audit Trail', 'System Settings']
  },
  {
    role: 'hr',
    label: 'HR Operations Manager',
    email: 'hr@adrokorba.com',
    pass: 'hr@adro2026',
    desc: 'Full workforce governance: Employee onboarding, shift rosters, attendance verification & leave approvals.',
    icon: Users,
    tags: ['Employee Master', 'Daily Roster', 'Leave Approvals', 'Manpower MIS']
  },
  {
    role: 'accounts',
    label: 'Accounts & Payroll Lead',
    email: 'accounts@adrokorba.com',
    pass: 'accounts@adro2026',
    desc: 'Compensation & ledger: Monthly payroll run, dynamic daily wages, deductions, bank transfer advice & payslips.',
    icon: Landmark,
    tags: ['Payroll Runs', 'Fixed & Dynamic', 'Bank Transfer Advice', 'Wage Registers']
  },
  {
    role: 'site_supervisor',
    label: 'Site Incharge (Korba Sites)',
    email: 'site.korba@adrokorba.com',
    pass: 'site@adro2026',
    desc: 'Field site execution: NTPC & BALCO worker muster roll, morning/night shift punch, OT approvals & daily reporting.',
    icon: HardHat,
    tags: ['Site Deployment', 'Shift A/B/C Punch', 'Overtime Approval', 'Field Logs']
  },
  {
    role: 'compliance_officer',
    label: 'Labour Compliance Officer',
    email: 'compliance@adrokorba.com',
    pass: 'compliance@adro2026',
    desc: 'Statutory compliance: PF ECR, ESIC returns, Minimum Wage revisions (1st Apr / 1st Oct), Form B, Form D.',
    icon: FileText,
    tags: ['Form B Wage Register', 'Form D OT Register', 'PF / ESIC Returns', 'Govt Wage Orders']
  }
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  
  // By default, username and password are auto-filled as requested!
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [email, setEmail] = useState('admin@adrokorba.com');
  const [password, setPassword] = useState('admin@adro2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = (preset: typeof ROLE_PRESETS[0]) => {
    setSelectedRole(preset.role);
    setEmail(preset.email);
    setPassword(preset.pass);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email address.');
      return;
    }
    const success = login(email, password);
    if (!success) {
      setError('Invalid credentials.');
    }
  };

  const currentPreset = ROLE_PRESETS.find(p => p.role === selectedRole) || ROLE_PRESETS[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-900">
      {/* Top Subtle Bar */}
      <div className="border-b border-slate-800 bg-slate-950/60 px-6 py-3.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 tracking-wide">ADRO KORBA</span>
          <span className="text-slate-600">|</span>
          <span>Industrial Infrastructure & Labour Compliance Division · Korba, CG</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>Central & State Sphere Labour Laws</span>
          <span>·</span>
          <span>EPF / ESIC / CLRA Act 1970</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Hero & Role Selector Panel */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium rounded-md mb-4">
                <span>Enterprise Portal</span>
                <span>·</span>
                <span>Role-Based Access Control</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                HRMS & Labour Compliance Management System
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
                Integrated workforce deployment, shift rosters, automated daily wages, biannual wage revisions (1st April & 1st October), and statutory Form B/D registers for heavy industrial operations.
              </p>
            </div>

            {/* Quick Demo Role Switcher Tabs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Select Role to Auto-Fill Credentials:
                </span>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Credentials Auto-Populated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ROLE_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedRole === preset.role;
                  return (
                    <button
                      key={preset.role}
                      type="button"
                      onClick={() => handleRoleSelect(preset)}
                      className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md ${isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {preset.label}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {preset.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Role Capabilities Preview */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
              <span className="font-semibold text-slate-300">Authorized Modules for {currentPreset.label}:</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {currentPreset.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />
              
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white tracking-tight">Portal Sign In</h2>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    Korba Cluster
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Credentials are auto-filled for <strong className="text-amber-400">{currentPreset.label}</strong>. You can sign in directly or modify them.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    User Email / Login ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. admin@adrokorba.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Autofilled
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Password"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/50"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-slate-500">SSL 256-Bit Secure</span>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>Sign In as {currentPreset.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
                Operating Sites: NTPC STPS · BALCO Smelter · SECL Gevra · Kusmunda · Champa Hub
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 px-6 py-4 text-xs text-slate-500 text-center">
        <span>© {new Date().getFullYear()} Adro Korba · Statutory Labour Compliance & Industrial HRMS System</span>
      </footer>
    </div>
  );
};
