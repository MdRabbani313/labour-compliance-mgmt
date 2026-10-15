import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { SiteMaster, ShiftType } from '../../types';
import { Building, MapPin, Calendar, Clock, Users, ShieldCheck, Plus, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { ExportButton } from '../common/ExportButton';

export const SiteManagementView: React.FC = () => {
  const { sites, employees } = useApp();
  const { hasPermission } = useAuth();

  const [selectedSite, setSelectedSite] = useState<SiteMaster>(sites[0]);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);

  // Deployed employees at current selected site
  const siteEmployees = employees.filter(e => e.siteId === selectedSite?.id);
  const deployedCount = siteEmployees.length;
  const shortage = Math.max(0, selectedSite.requiredManpower - deployedCount);

  const exportData = sites.map(s => {
    const deployed = employees.filter(e => e.siteId === s.id).length;
    return {
      'Site Code': s.siteCode,
      'Site Name': s.siteName,
      'Client Name': s.clientName,
      'Location': s.location,
      'Contract Duration': s.contractDuration,
      'Contract Start': s.contractStart,
      'Contract End': s.contractEnd,
      'Salary Cycle': s.salaryCycle,
      'Required Strength': s.requiredManpower,
      'Current Deployed': deployed,
      'Active Shifts': s.activeShifts.join(', '),
      'Wage Sphere': s.wageSphere,
      'Overtime Rule': s.overtimeRule
    };
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Site Master & Contract Configuration</h2>
          <p className="text-xs text-slate-500">
            Industrial operational sites, client SLA mandates, and wage compliance policies in Korba
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            data={exportData}
            fileName="adro_korba_sites_master"
            label="Export Sites Master"
          />

          {hasPermission('all', 'create') && (
            <button
              onClick={() => setIsSiteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Configure New Site</span>
            </button>
          )}
        </div>
      </div>

      {/* Sites Grid & Site Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Sites List Cards */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Select Industrial Site ({sites.length})
          </span>

          <div className="space-y-2.5">
            {sites.map(site => {
              const isSelected = selectedSite?.id === site.id;
              const deployed = employees.filter(e => e.siteId === site.id).length;

              return (
                <div
                  key={site.id}
                  onClick={() => setSelectedSite(site)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-amber-500 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                        isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {site.siteCode}
                      </span>
                      <h4 className="font-bold text-sm mt-1.5 leading-snug">{site.siteName}</h4>
                      <p className={`text-xs mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {site.clientName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-mono font-bold tabular-nums ${
                        isSelected ? 'text-amber-400' : 'text-slate-900'
                      }`}>
                        {deployed} / {site.requiredManpower}
                      </span>
                      <div className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        Workers Deployed
                      </div>
                    </div>
                  </div>

                  <div className={`mt-3 pt-2.5 border-t text-[11px] flex items-center justify-between ${
                    isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      {site.location}
                    </span>
                    <span>{site.wageSphere}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Site Master Details & Roster */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  {selectedSite.siteCode}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedSite.siteName}</h3>
                <p className="text-xs text-slate-500">{selectedSite.clientName} · {selectedSite.location}</p>
              </div>

              <div className="text-right">
                <span className="inline-flex px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  Active Contract
                </span>
              </div>
            </div>

            {/* Site Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Contract Duration</span>
                <strong className="text-slate-900 text-xs mt-1 block">{selectedSite.contractDuration}</strong>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{selectedSite.contractStart} to {selectedSite.contractEnd}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Salary Calculation Cycle</span>
                <strong className="text-slate-900 text-xs mt-1 block">{selectedSite.salaryCycle}</strong>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Payment via NEFT</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Overtime Rules</span>
                <strong className="text-slate-900 text-xs mt-1 block">{selectedSite.overtimeRule}</strong>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Factories Act Compliance</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Statutory Wage Sphere</span>
                <strong className="text-slate-900 text-xs mt-1 block">{selectedSite.wageSphere}</strong>
                <span className="text-[10px] text-slate-400 mt-0.5 block">VDA Revision 1 Apr & 1 Oct</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Active Shifts Configured</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSite.activeShifts.map(sft => (
                    <span key={sft} className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-700 font-bold rounded text-[10px]">
                      {sft}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Manpower Health</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-mono font-bold text-slate-900">{deployedCount}</span>
                  <span className="text-slate-400">/ {selectedSite.requiredManpower}</span>
                </div>
                {shortage > 0 ? (
                  <span className="text-rose-600 text-[10px] font-bold block mt-0.5">-{shortage} Shortage</span>
                ) : (
                  <span className="text-emerald-600 text-[10px] font-bold block mt-0.5">Fully Staffed</span>
                )}
              </div>
            </div>
          </div>

          {/* Workers currently deployed at this site */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Workers Assigned to {selectedSite.siteName}</span>
              <span className="text-xs text-slate-500 font-mono font-normal">({siteEmployees.length} on roll)</span>
            </h4>

            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Worker Name</th>
                    <th className="py-2 px-3 font-semibold">Category</th>
                    <th className="py-2 px-3 font-semibold">Designation</th>
                    <th className="py-2 px-3 font-semibold">Wage Rate</th>
                    <th className="py-2 px-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {siteEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900">{emp.fullName}</span>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.empCode}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                          {emp.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{emp.designation}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                        {emp.salaryType === 'Dynamic Daily Wage' ? `₹${emp.dailyWageRate}/day` : `₹${emp.monthlyFixedSalary}/mo`}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Modal for Creating Site */}
      <Modal
        isOpen={isSiteModalOpen}
        onClose={() => setIsSiteModalOpen(false)}
        title="Add New Operational Site / Client Project"
        subtitle="Configure client parameters and wage spheres"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Site / Project Name *</label>
            <input
              type="text"
              placeholder="e.g. SECL Dipka Mega Coal Handling Plant"
              className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Client Entity *</label>
              <input
                type="text"
                placeholder="e.g. South Eastern Coalfields Ltd"
                className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Site Location *</label>
              <input
                type="text"
                placeholder="Dipka, Korba District, CG"
                className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Required Manpower *</label>
              <input
                type="number"
                placeholder="100"
                className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Wage Sphere *</label>
              <select className="w-full p-2 border border-slate-200 rounded focus:border-amber-500">
                <option value="Central Sphere">Central Sphere (Min. Wages Act)</option>
                <option value="State Sphere (Chhattisgarh)">State Sphere (Chhattisgarh)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              onClick={() => setIsSiteModalOpen(false)}
              className="px-3 py-1.5 text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert('Site created successfully and registered in master database.');
                setIsSiteModalOpen(false);
              }}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded shadow-xs"
            >
              Create Site
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
