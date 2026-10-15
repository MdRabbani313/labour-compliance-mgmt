import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { LeaveRequest } from '../../types';
import {
  CalendarRange,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Coins,
  FileText,
  UserCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ExportButton } from '../common/ExportButton';

export const LeaveManagementView: React.FC = () => {
  const { employees, leaveRequests, applyLeave, approveLeave, rejectLeave } = useApp();
  const { currentUser, hasPermission } = useAuth();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isEncashModalOpen, setIsEncashModalOpen] = useState(false);

  // Apply form state
  const [empId, setEmpId] = useState(employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Paid Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [days, setDays] = useState(1);
  const [reason, setReason] = useState('');

  // Encashment calculator state
  const [encashEmpId, setEncashEmpId] = useState(employees[0]?.id || '');
  const [encashDays, setEncashDays] = useState(12);

  const selectedEncashEmp = employees.find(e => e.id === encashEmpId) || employees[0];
  const dailyRate = selectedEncashEmp.salaryType === 'Dynamic Daily Wage'
    ? (selectedEncashEmp.dailyWageRate || 750)
    : Math.round((selectedEncashEmp.monthlyFixedSalary || 30000) / 26);
  const estimatedEncashment = dailyRate * encashDays;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyLeave({
      employeeId: empId,
      leaveType,
      startDate,
      endDate,
      days: Number(days),
      reason
    });
    setIsApplyModalOpen(false);
    setReason('');
  };

  const handleReject = (id: string) => {
    const reasonPrompt = window.prompt('Enter rejection remark for worker file:', 'Operational exigency at site');
    if (reasonPrompt !== null) {
      rejectLeave(id, reasonPrompt);
    }
  };

  const exportData = leaveRequests.map(l => {
    const emp = employees.find(e => e.id === l.employeeId);
    return {
      'Application ID': l.id,
      'Emp Code': emp?.empCode || '',
      'Worker Name': emp?.fullName || '',
      'Leave Type': l.leaveType,
      'Start Date': l.startDate,
      'End Date': l.endDate,
      'Duration (Days)': l.days,
      'Reason': l.reason,
      'Status': l.status,
      'Applied On': l.appliedOn,
      'Approved By': l.approvedBy || '',
      'Rejection Reason': l.rejectionReason || ''
    };
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Leave Management & Encashment</h2>
          <p className="text-xs text-slate-500">
            Statutory Sick Leave (SL), Paid Leave (PL/EL), approval workflows, and annual encashment ledger
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            data={exportData}
            fileName="adro_korba_leave_register"
            label="Export Leave Register"
          />

          <button
            onClick={() => setIsEncashModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Encashment Calculator</span>
          </button>

          {hasPermission('leave', 'create') && (
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Apply Leave</span>
            </button>
          )}
        </div>
      </div>

      {/* Leave Balance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Paid Leave (PL / Earned)</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              1 Day / 20 Working Days
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            18 Days / Year
          </div>
          <p className="text-xs text-slate-500 mt-1">Accumulation up to 30 days under Factories Act; eligible for annual encashment.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Sick Leave (SL / Medical)</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Medical Cert Required &gt;2 Days
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            12 Days / Year
          </div>
          <p className="text-xs text-slate-500 mt-1">Available for sickness and medical recovery supported by doctor prescription.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Casual Leave (CL)</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Urgent Affairs
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            8 Days / Year
          </div>
          <p className="text-xs text-slate-500 mt-1">Non-cumulative; lapses on 31st December of the calendar year.</p>
        </div>
      </div>

      {/* Leave Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Leave Applications & Approval Workflow</h3>
          <span className="text-xs text-slate-500 font-mono">
            {leaveRequests.filter(l => l.status === 'Pending').length} Pending Review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Worker Details</th>
                <th className="py-3 px-3 font-semibold">Leave Type</th>
                <th className="py-3 px-3 font-semibold">Dates & Duration</th>
                <th className="py-3 px-3 font-semibold">Application Reason</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaveRequests.map(req => {
                const emp = employees.find(e => e.id === req.employeeId);
                return (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp?.fullName || req.employeeId}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{emp?.empCode} · {emp?.department}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        req.leaveType === 'Paid Leave' ? 'bg-emerald-50 text-emerald-700' :
                        req.leaveType === 'Sick Leave' ? 'bg-blue-50 text-blue-700' :
                        'bg-purple-50 text-purple-700'
                      }`}>
                        {req.leaveType}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="font-semibold text-slate-900">{req.startDate} to {req.endDate}</div>
                      <div className="text-[10px] text-slate-500">{req.days} Day(s)</div>
                    </td>

                    <td className="py-3 px-3 text-slate-700 max-w-xs">
                      <p className="line-clamp-2">{req.reason}</p>
                      {req.rejectionReason && (
                        <div className="text-rose-600 text-[10px] font-semibold mt-0.5">
                          Rejected: {req.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                        req.status === 'Rejected' ? 'bg-rose-50 text-rose-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {req.status}
                      </span>
                      {req.approvedBy && (
                        <div className="text-[9px] text-slate-400 mt-0.5">{req.approvedBy}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {req.status === 'Pending' && hasPermission('leave', 'approve') ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => approveLeave(req.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[11px] cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Employee Leave Application"
        subtitle="Formal application under Chhattisgarh Factories Rules & Adro HR policy"
      >
        <form onSubmit={handleApply} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Select Employee *</label>
            <select
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-medium"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.empCode} - {e.fullName} ({e.designation})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Leave Classification *</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as any)}
                className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
              >
                <option value="Paid Leave">Paid Leave (PL / Earned)</option>
                <option value="Sick Leave">Sick Leave (Medical SL)</option>
                <option value="Casual Leave">Casual Leave (CL)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Total Days *</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Reason for Leave *</label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the reason clearly for HR & supervisor approval."
              className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-3 py-1.5 text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded shadow-xs"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Leave Encashment Calculator Modal */}
      <Modal
        isOpen={isEncashModalOpen}
        onClose={() => setIsEncashModalOpen(false)}
        title="Earned Leave Encashment Calculator"
        subtitle="Calculates statutory encashment payout based on applicable wage rate"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Select Employee</label>
            <select
              value={encashEmpId}
              onChange={(e) => setEncashEmpId(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-medium"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.empCode} - {e.fullName} ({e.salaryType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Accumulated Leave Days to Encash</label>
            <input
              type="number"
              min="1"
              max="30"
              value={encashDays}
              onChange={(e) => setEncashDays(Number(e.target.value))}
              className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono font-bold"
            />
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="text-slate-400">Encashment Formula:</div>
            <div className="font-mono text-amber-400 font-semibold">
              Daily Base Wage (₹{dailyRate}) × {encashDays} Days
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
              <span className="text-slate-300">Estimated Encashment Payout:</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                ₹{estimatedEncashment.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsEncashModalOpen(false)}
              className="px-4 py-1.5 bg-amber-500 font-bold text-slate-950 rounded"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
