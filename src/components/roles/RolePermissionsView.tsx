import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_USERS } from '../../data/mockData';
import { UserRole } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Terminal,
  Activity
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ExportButton } from '../common/ExportButton';

export const RolePermissionsView: React.FC = () => {
  const { auditLogs } = useApp();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'matrix' | 'users' | 'audit'>('matrix');
  const [selectedRole, setSelectedRole] = useState<UserRole>('hr');
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);

  const modulesList = [
    { key: 'employees', label: 'Employee Master Directory & Records' },
    { key: 'manpower', label: 'Manpower Deployment & Workforce Planning' },
    { key: 'sites', label: 'Site Master & Client Contracts' },
    { key: 'attendance', label: 'Daily Attendance & Biometric Muster' },
    { key: 'shifts', label: 'Shift Roster & Timings' },
    { key: 'leave', label: 'Leave Applications & Encashment' },
    { key: 'payroll', label: 'Monthly Payroll & Salary Runs' },
    { key: 'daily_wages', label: 'Daily Wages & Cash Disbursement' },
    { key: 'wage_revision', label: 'Government Wage Revisions (1 Apr / 1 Oct)' },
    { key: 'compliance', label: 'Statutory Registers (Form B, D, PF/ESIC)' },
    { key: 'roles_permissions', label: 'Security & Audit Logs' }
  ];

  // Permission matrix definitions for standard roles
  const getPermissionForRole = (role: UserRole, modKey: string, action: string): boolean => {
    if (role === 'super_admin') return true;
    if (role === 'hr') {
      if (['employees', 'attendance', 'leave', 'shifts', 'manpower'].includes(modKey)) {
        if (action === 'delete') return false;
        return true;
      }
      if (modKey === 'payroll' && ['view', 'export'].includes(action)) return true;
      return false;
    }
    if (role === 'accounts') {
      if (['payroll', 'daily_wages'].includes(modKey)) return true;
      if (['employees', 'compliance', 'wage_revision'].includes(modKey) && ['view', 'export'].includes(action)) return true;
      return false;
    }
    if (role === 'site_supervisor') {
      if (modKey === 'attendance' && ['view', 'create', 'edit', 'approve'].includes(action)) return true;
      if (modKey === 'manpower' && ['view', 'export'].includes(action)) return true;
      if (modKey === 'daily_wages' && ['view', 'create'].includes(action)) return true;
      return false;
    }
    if (role === 'compliance_officer') {
      if (['compliance', 'wage_revision'].includes(modKey)) return true;
      if (['employees', 'payroll', 'attendance'].includes(modKey) && ['view', 'export'].includes(action)) return true;
      return false;
    }
    return false;
  };

  const exportAuditData = auditLogs.map(l => ({
    'Timestamp': l.timestamp,
    'User': l.userName,
    'Role': l.userRole,
    'Module': l.module,
    'Action': l.action,
    'Details': l.details,
    'IP Address': l.ipAddress
  }));

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC) & Audit Trail</h2>
          <p className="text-xs text-slate-500">
            Screen-wise permissions matrix, multi-user privilege boundaries, and immutable audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'audit' && (
            <ExportButton
              data={exportAuditData}
              fileName="adro_korba_audit_trail_logs"
              label="Export Audit Logs"
            />
          )}

          <button
            onClick={() => setIsNewRoleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
            activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Screen-Wise Permission Matrix
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          User Accounts & Site Allocations
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
            activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          User Activity & Audit Trail
        </button>
      </div>

      {/* Tab 1: Permission Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Select Role to Inspect / Configure:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="py-1 px-3 bg-white border border-slate-300 rounded font-bold text-slate-900"
              >
                <option value="super_admin">Super Admin (All Permitted)</option>
                <option value="hr">HR Operations Manager</option>
                <option value="accounts">Accounts & Payroll Lead</option>
                <option value="site_supervisor">Site Incharge (Korba)</option>
                <option value="compliance_officer">Labour Compliance Officer</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Authorized
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-400">
                <XCircle className="w-3.5 h-3.5 text-slate-300" /> Restricted
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">System Module & Screen</th>
                  <th className="py-3 px-3 text-center">View</th>
                  <th className="py-3 px-3 text-center">Create</th>
                  <th className="py-3 px-3 text-center">Edit</th>
                  <th className="py-3 px-3 text-center">Delete</th>
                  <th className="py-3 px-3 text-center">Approve</th>
                  <th className="py-3 px-4 text-center">Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modulesList.map(mod => {
                  const canView = getPermissionForRole(selectedRole, mod.key, 'view');
                  const canCreate = getPermissionForRole(selectedRole, mod.key, 'create');
                  const canEdit = getPermissionForRole(selectedRole, mod.key, 'edit');
                  const canDelete = getPermissionForRole(selectedRole, mod.key, 'delete');
                  const canApprove = getPermissionForRole(selectedRole, mod.key, 'approve');
                  const canExport = getPermissionForRole(selectedRole, mod.key, 'export');

                  return (
                    <tr key={mod.key} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{mod.label}</td>

                      <td className="py-3 px-3 text-center">
                        {canView ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {canCreate ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {canEdit ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {canDelete ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {canApprove ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {canExport ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Users List */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Email ID</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Assigned Sites</th>
                  <th className="py-3 px-4 text-right">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEFAULT_USERS.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {u.roleLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{u.email}</td>
                    <td className="py-3 px-3 text-slate-600">{u.department}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                      {u.assignedSites.includes('*') ? 'All Sites (Consolidated)' : u.assignedSites.join(', ')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">{u.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Immutable System Event Logs & User Actions</span>
            <span className="text-[11px] text-slate-500 font-mono">Real-time Timestamp Recorded</span>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 sticky top-0 font-semibold font-sans">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User & Role</th>
                  <th className="py-2.5 px-3">Module</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{log.userName}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-bold text-amber-700">{log.action}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 max-w-sm">{log.details}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Creating Custom Role */}
      <Modal
        isOpen={isNewRoleModalOpen}
        onClose={() => setIsNewRoleModalOpen(false)}
        title="Create Custom Security Role"
        subtitle="Define granular access rights for specialized site personnel"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Role Title *</label>
            <input
              type="text"
              placeholder="e.g. Safety Inspector / Time Officer"
              className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Base Template</label>
            <select className="w-full p-2 border border-slate-200 rounded focus:border-amber-500">
              <option value="hr">Clone from HR Manager</option>
              <option value="site_supervisor">Clone from Site Supervisor</option>
              <option value="accounts">Clone from Accounts Lead</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Assigned Department</label>
            <input
              type="text"
              placeholder="e.g. Health, Safety & Environment (HSE)"
              className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => setIsNewRoleModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert('Custom Role successfully created and registered into security matrix.');
                setIsNewRoleModalOpen(false);
              }}
              className="px-4 py-1.5 bg-amber-500 font-bold text-slate-950 rounded shadow-xs"
            >
              Save Role Definition
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
