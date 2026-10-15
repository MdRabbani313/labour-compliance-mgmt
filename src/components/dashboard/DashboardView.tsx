import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  CheckCircle2,
  HardHat,
  Banknote,
  TrendingUp,
  AlertTriangle,
  Building2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ExportButton } from '../common/ExportButton';

export const DashboardView: React.FC<{
  onNavigate: (viewKey: any) => void;
}> = ({ onNavigate }) => {
  const { employees, sites, attendanceRecords, payrollEntries, alerts, selectedSiteId } = useApp();
  const { currentUser } = useAuth();

  // Filtered employees by site
  const filteredEmployees = employees.filter(e => {
    if (selectedSiteId === 'all') return true;
    return e.siteId === selectedSiteId;
  });

  const totalEmployees = filteredEmployees.length;
  const activeEmployees = filteredEmployees.filter(e => e.status === 'Active').length;
  
  // Attendance metrics for today (2026-10-15)
  const todayAttendance = attendanceRecords.filter(r => {
    const emp = employees.find(e => e.id === r.employeeId);
    if (!emp) return false;
    if (selectedSiteId !== 'all' && emp.siteId !== selectedSiteId) return false;
    return true;
  });

  const presentCount = todayAttendance.filter(r => r.status === 'P').length;
  const lateCount = todayAttendance.filter(r => r.status === 'Late').length;
  const onLeaveCount = todayAttendance.filter(r => r.status === 'L' || r.status === 'HD').length;
  const totalOtHoursToday = todayAttendance.reduce((acc, curr) => acc + (curr.otHours || 0), 0);

  // Category counts
  const categoryCounts = {
    'Highly Skilled': filteredEmployees.filter(e => e.category === 'Highly Skilled').length,
    'Skilled': filteredEmployees.filter(e => e.category === 'Skilled').length,
    'Semi-Skilled': filteredEmployees.filter(e => e.category === 'Semi-Skilled').length,
    'Unskilled': filteredEmployees.filter(e => e.category === 'Unskilled').length,
  };

  // Payroll metrics
  const totalGrossPayroll = payrollEntries.reduce((acc, curr) => acc + curr.grossEarnings, 0);
  const totalNetPayroll = payrollEntries.reduce((acc, curr) => acc + curr.netPayable, 0);
  const totalPfDeduction = payrollEntries.reduce((acc, curr) => acc + curr.pfEmployee + curr.pfEmployer, 0);
  const totalEsicDeduction = payrollEntries.reduce((acc, curr) => acc + curr.esicEmployee + curr.esicEmployer, 0);

  const activeAlerts = alerts.filter(a => a.status === 'Active');

  const exportSummaryData = sites.map(s => {
    const siteEmps = employees.filter(e => e.siteId === s.id);
    return {
      'Site Code': s.siteCode,
      'Site Name': s.siteName,
      'Client': s.clientName,
      'Location': s.location,
      'Required Manpower': s.requiredManpower,
      'Current Deployed': siteEmps.length,
      'Shortage / Excess': siteEmps.length - s.requiredManpower,
      'Wage Sphere': s.wageSphere
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
              <span>Korba Industrial Operations</span>
              <span>·</span>
              <span>Live Statutory Compliance Status</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back, {currentUser?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Logged in as <strong className="text-amber-400">{currentUser?.roleLabel}</strong>. Monitoring 5 key industrial sites across NTPC, BALCO, SECL Gevra, Kusmunda and Champa fabrication facilities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Mark Today's Attendance
            </button>
            <button
              onClick={() => onNavigate('payroll')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Monthly Payroll Run
            </button>
            <ExportButton
              data={exportSummaryData}
              fileName="adro_korba_executive_summary"
              label="Export MIS"
            />
          </div>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Manpower
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {totalEmployees}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              {activeEmployees} Active on rolls
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Sites Covered</span>
            <span className="font-semibold text-slate-700 font-mono">{sites.length} Active Sites</span>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Muster Status
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {presentCount + lateCount}
            </span>
            <span className="text-xs text-slate-500">
              of {todayAttendance.length} Deployed Today
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>On Leave: {onLeaveCount}</span>
            <span className="text-amber-600 font-semibold font-mono tabular-nums">
              {totalOtHoursToday} OT Hours
            </span>
          </div>
        </div>

        {/* Monthly Payroll */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gross Monthly Payroll
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              ₹{(totalGrossPayroll / 100000).toFixed(2)}L
            </span>
            <span className="text-xs text-slate-500">
              Cycle Oct 2026
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Net Payable:</span>
            <span className="font-semibold text-slate-800 font-mono tabular-nums">
              ₹{(totalNetPayroll / 100000).toFixed(2)}L
            </span>
          </div>
        </div>

        {/* Compliance Health */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Statutory Compliance
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">
              99.4%
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              Statutory Compliant
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>PF+ESIC Deposited:</span>
            <span className="font-semibold text-slate-800 font-mono tabular-nums">
              ₹{((totalPfDeduction + totalEsicDeduction) / 1000).toFixed(1)}k
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Site Manpower Status & Statutory Due Dates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Site Manpower Deployment Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Site-Wise Manpower Allocation & Shortage Matrix</h3>
              <p className="text-xs text-slate-500">Real-time required vs deployed strength across Korba regional operations</p>
            </div>
            <button
              onClick={() => onNavigate('manpower')}
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Full Manpower MIS</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Site / Project</th>
                  <th className="py-2.5 px-3 font-semibold">Client</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Required</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Deployed</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Variance</th>
                  <th className="py-2.5 px-3 font-semibold">Wage Sphere</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sites.map(site => {
                  const deployed = employees.filter(e => e.siteId === site.id).length;
                  const variance = deployed - site.requiredManpower;
                  const isShortage = variance < 0;

                  return (
                    <tr key={site.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{site.siteName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{site.siteCode} · {site.location}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {site.clientName}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium tabular-nums text-slate-700">
                        {site.requiredManpower}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                        {deployed}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          isShortage
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isShortage ? `${variance} Shortage` : `+${variance} Normal`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        {site.wageSphere}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Active Statutory Due Dates & Alerts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Statutory Compliance Radar</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase font-mono">
                October 2026
              </span>
            </div>

            <div className="space-y-3">
              {activeAlerts.slice(0, 3).map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs ${
                    alert.severity === 'high'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : alert.severity === 'medium'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${alert.severity === 'high' ? 'text-rose-600' : 'text-amber-600'}`} />
                      {alert.title}
                    </span>
                    {alert.dueDate && (
                      <span className="text-[10px] font-mono font-medium">Due: {alert.dueDate}</span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('statutory_registers')}
              className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
            >
              Open Statutory Form B & D Registers
            </button>
          </div>

          {/* Manpower Skill Category Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Workforce Classification</h3>
            <div className="space-y-2.5">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat}</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Quick Access Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('wage_revision')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-3">Government Wage Revisions</h4>
          <p className="text-xs text-slate-500 mt-1">1st April & 1st October central/state VDA revisions, dual-wage mid-month calculator.</p>
        </div>

        <div
          onClick={() => onNavigate('daily_wages')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Clock className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-3">Daily Wages Register</h4>
          <p className="text-xs text-slate-500 mt-1">Daily attendance calculation, OT multiplier, cash disbursement register & slips.</p>
        </div>

        <div
          onClick={() => onNavigate('statutory_registers')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Layers className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-3">Statutory Form B, D & Muster</h4>
          <p className="text-xs text-slate-500 mt-1">CLRA Act Form XVII & Form IV compliant registers ready for labour inspection audit.</p>
        </div>
      </div>
    </div>
  );
};
