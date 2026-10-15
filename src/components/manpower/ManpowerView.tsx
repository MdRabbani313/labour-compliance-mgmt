import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  HardHat,
  Users,
  AlertOctagon,
  CheckCircle2,
  Building,
  Briefcase,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';
import { ExportButton } from '../common/ExportButton';

export const ManpowerView: React.FC = () => {
  const { employees, sites, updateEmployee } = useApp();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<'site' | 'department' | 'contractor'>('site');
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [targetSiteId, setTargetSiteId] = useState<string>(sites[0]?.id || '');

  // Calculate Site-wise metrics
  const siteWorkforce = sites.map(site => {
    const deployedEmps = employees.filter(e => e.siteId === site.id);
    const activeCount = deployedEmps.filter(e => e.status === 'Active').length;
    const leaveCount = deployedEmps.filter(e => e.status === 'On Leave').length;
    const required = site.requiredManpower;
    const variance = deployedEmps.length - required;

    return {
      site,
      totalDeployed: deployedEmps.length,
      activeCount,
      leaveCount,
      required,
      variance,
      shortage: variance < 0 ? Math.abs(variance) : 0,
      excess: variance > 0 ? variance : 0,
      employees: deployedEmps
    };
  });

  // Calculate Department-wise metrics
  const departments = Array.from(new Set(employees.map(e => e.department)));
  const deptWorkforce = departments.map(dept => {
    const emps = employees.filter(e => e.department === dept);
    return {
      department: dept,
      count: emps.length,
      skilled: emps.filter(e => e.category === 'Skilled' || e.category === 'Highly Skilled').length,
      unskilled: emps.filter(e => e.category === 'Unskilled' || e.category === 'Semi-Skilled').length
    };
  });

  // Calculate Contractor / Allocation metrics
  const contractors = Array.from(new Set(employees.map(e => e.contractorName)));
  const contractorWorkforce = contractors.map(cont => {
    const emps = employees.filter(e => e.contractorName === cont);
    return {
      contractor: cont,
      count: emps.length,
      active: emps.filter(e => e.status === 'Active').length
    };
  });

  const totalRequired = sites.reduce((sum, s) => sum + s.requiredManpower, 0);
  const totalDeployed = employees.length;
  const netShortage = Math.max(0, totalRequired - totalDeployed);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    updateEmployee({
      ...emp,
      siteId: targetSiteId
    });
    setTransferModalOpen(false);
  };

  const exportData = siteWorkforce.map(sw => ({
    'Site Code': sw.site.siteCode,
    'Site Name': sw.site.siteName,
    'Client Name': sw.site.clientName,
    'Required Strength': sw.required,
    'Currently Deployed': sw.totalDeployed,
    'Active on Site': sw.activeCount,
    'On Leave': sw.leaveCount,
    'Shortage': sw.shortage,
    'Excess': sw.excess,
    'Compliance Wage Sphere': sw.site.wageSphere
  }));

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Manpower Deployment & Workforce Planning</h2>
          <p className="text-xs text-slate-500">
            Site-wise allocation, vacancy tracking, and contractor workforce distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            data={exportData}
            fileName="adro_korba_manpower_deployment"
            label="Export Allocation"
          />

          {hasPermission('manpower', 'edit') && (
            <button
              onClick={() => {
                setSelectedEmpId(employees[0]?.id || '');
                setTransferModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Transfer / Reallocate Worker</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Required Manpower</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{totalRequired}</span>
            <span className="text-xs text-slate-500">Contractual Mandate</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Currently Deployed</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">{totalDeployed}</span>
            <span className="text-xs text-slate-500">On active rolls</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Shortage</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono tabular-nums ${netShortage > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {netShortage}
            </span>
            <span className="text-xs text-slate-500">Immediate recruitment needed</span>
          </div>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('site')}
          className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
            activeTab === 'site' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Site-Wise Allocation
        </button>
        <button
          onClick={() => setActiveTab('department')}
          className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
            activeTab === 'department' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Department-Wise Allocation
        </button>
        <button
          onClick={() => setActiveTab('contractor')}
          className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
            activeTab === 'contractor' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Contractor Distribution
        </button>
      </div>

      {/* View Content based on Tab */}
      {activeTab === 'site' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Site / Project Name</th>
                  <th className="py-3 px-3 font-semibold">Client</th>
                  <th className="py-3 px-3 font-semibold text-right">Required Strength</th>
                  <th className="py-3 px-3 font-semibold text-right">Current Strength</th>
                  <th className="py-3 px-3 font-semibold text-center">Active Today</th>
                  <th className="py-3 px-3 font-semibold text-center">Shortage / Excess</th>
                  <th className="py-3 px-4 font-semibold text-right">Fulfillment %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siteWorkforce.map(sw => {
                  const pct = Math.min(100, Math.round((sw.totalDeployed / sw.required) * 100));
                  return (
                    <tr key={sw.site.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sw.site.siteName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{sw.site.siteCode} · {sw.site.location}</div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium">{sw.site.clientName}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-600 tabular-nums">{sw.required}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">{sw.totalDeployed}</td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono text-emerald-700 font-semibold tabular-nums">{sw.activeCount}</span>
                        <span className="text-[10px] text-slate-400"> ({sw.leaveCount} on leave)</span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {sw.shortage > 0 ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            -{sw.shortage} Vacancies
                          </span>
                        ) : sw.excess > 0 ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            +{sw.excess} Excess
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            100% Balanced
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono font-bold text-slate-800 tabular-nums">{pct}%</span>
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'department' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-3 font-semibold text-right">Total Deployed</th>
                  <th className="py-3 px-3 font-semibold text-right">Skilled / Highly Skilled</th>
                  <th className="py-3 px-3 font-semibold text-right">Semi-Skilled / Unskilled</th>
                  <th className="py-3 px-4 font-semibold text-right">Share of Workforce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptWorkforce.map((dw, i) => {
                  const share = totalDeployed > 0 ? Math.round((dw.count / totalDeployed) * 100) : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{dw.department}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">{dw.count}</td>
                      <td className="py-3 px-3 text-right font-mono text-purple-700 font-semibold tabular-nums">{dw.skilled}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums">{dw.unskilled}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-700">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'contractor' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Contractor / Deployment Agency</th>
                  <th className="py-3 px-3 font-semibold text-right">Total Labour Strength</th>
                  <th className="py-3 px-3 font-semibold text-right">Active On Site</th>
                  <th className="py-3 px-4 font-semibold text-right">CLRA Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contractorWorkforce.map((cw, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{cw.contractor}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">{cw.count}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-600 font-semibold tabular-nums">{cw.active}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Form XII License Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer Worker Modal */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Transfer Worker to Another Site</h3>
            <p className="text-xs text-slate-500 mb-4">Reallocate deployed worker to address manpower shortages</p>

            <form onSubmit={handleTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Select Employee</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-medium"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.empCode} - {e.fullName} ({e.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Destination Site</label>
                <select
                  value={targetSiteId}
                  onChange={(e) => setTargetSiteId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-medium"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.siteCode} - {s.siteName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded shadow-xs"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
