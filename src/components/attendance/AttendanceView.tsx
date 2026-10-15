import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord, AttendanceStatus, ShiftType } from '../../types';
import {
  CalendarCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Check,
  X,
  Plus,
  UserCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ExportButton } from '../common/ExportButton';

export const AttendanceView: React.FC = () => {
  const { employees, sites, shifts, attendanceRecords, markAttendance, updateAttendance, bulkApproveAttendance, selectedSiteId } = useApp();
  const { currentUser, hasPermission } = useAuth();

  const [selectedDate, setSelectedDate] = useState('2026-10-15');
  const [siteFilter, setSiteFilter] = useState(selectedSiteId);
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Correction modal
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [editedStatus, setEditedStatus] = useState<AttendanceStatus>('P');
  const [editedOtHours, setEditedOtHours] = useState<number>(0);
  const [editedRemarks, setEditedRemarks] = useState('');

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(r => {
    if (r.date !== selectedDate) return false;
    const emp = employees.find(e => e.id === r.employeeId);
    if (!emp) return false;

    const activeSite = siteFilter !== 'all' ? siteFilter : (selectedSiteId !== 'all' ? selectedSiteId : 'all');
    if (activeSite !== 'all' && emp.siteId !== activeSite) return false;

    if (shiftFilter !== 'all' && r.shift !== shiftFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;

    return true;
  });

  const pendingApprovals = filteredRecords.filter(r => r.approvalStatus === 'Pending');

  const handleBulkApprove = () => {
    const ids = pendingApprovals.map(r => r.id);
    if (ids.length > 0) {
      bulkApproveAttendance(ids);
    }
  };

  const handleOpenCorrection = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setEditedStatus(record.status);
    setEditedOtHours(record.otHours);
    setEditedRemarks(record.remarks || '');
    setIsCorrectionModalOpen(true);
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    updateAttendance({
      ...selectedRecord,
      status: editedStatus,
      otHours: editedOtHours,
      remarks: editedRemarks,
      approvalStatus: 'Approved',
      approvedBy: currentUser?.name
    });
    setIsCorrectionModalOpen(false);
  };

  const handleSingleApprove = (record: AttendanceRecord) => {
    updateAttendance({
      ...record,
      approvalStatus: 'Approved',
      approvedBy: currentUser?.name
    });
  };

  const handleQuickStatusChange = (record: AttendanceRecord, newStatus: AttendanceStatus) => {
    updateAttendance({
      ...record,
      status: newStatus
    });
  };

  const exportData = filteredRecords.map(r => {
    const emp = employees.find(e => e.id === r.employeeId);
    const site = sites.find(s => s.id === r.siteId);
    return {
      'Date': r.date,
      'Emp Code': emp?.empCode || '',
      'Worker Name': emp?.fullName || '',
      'Category': emp?.category || '',
      'Site': site?.siteName || '',
      'Shift': r.shift,
      'Status': r.status,
      'In Time': r.inTime,
      'Out Time': r.outTime,
      'Working Hours': r.workingHours,
      'OT Hours': r.otHours,
      'Approval Status': r.approvalStatus,
      'Approved By': r.approvedBy || '',
      'Remarks': r.remarks || ''
    };
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Daily Attendance Muster & Overtime (OT) Verification</h2>
          <p className="text-xs text-slate-500">
            Form A & Form D compliant daily attendance capture, biometric punch sync, and shift OT authorizations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            data={exportData}
            fileName={`adro_korba_attendance_${selectedDate}`}
            label="Export Daily Muster"
          />

          {hasPermission('attendance', 'approve') && pendingApprovals.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Approve All Pending ({pendingApprovals.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Date & Filter Controls */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Muster Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-amber-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter by Site</label>
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-amber-500"
          >
            <option value="all">All Sites</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>{s.siteCode} - {s.siteName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Shift</label>
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-amber-500"
          >
            <option value="all">All Shifts (A, B, C, G)</option>
            {shifts.map(s => (
              <option key={s.name} value={s.name}>{s.name} ({s.startTime} - {s.endTime})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Attendance Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="P">Present (P)</option>
            <option value="Late">Late Coming</option>
            <option value="HD">Half Day (HD)</option>
            <option value="L">On Leave (L)</option>
            <option value="A">Absent (A)</option>
            <option value="WO">Weekly Off (WO)</option>
            <option value="H">Holiday (H)</option>
          </select>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-4 font-semibold">Worker Name & Code</th>
                <th className="py-3 px-3 font-semibold">Site / Shift</th>
                <th className="py-3 px-3 font-semibold">In / Out Timings</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Work Hours</th>
                <th className="py-3 px-3 font-semibold text-right">OT Hours</th>
                <th className="py-3 px-3 font-semibold text-center">Approval</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No attendance records found for {selectedDate}.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => {
                  const emp = employees.find(e => e.id === r.employeeId);
                  const site = sites.find(s => s.id === r.siteId);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{emp?.fullName || r.employeeId}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {emp?.empCode} · {emp?.category}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{site?.siteCode || r.siteId}</div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {r.shift}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        <div>In: <strong className="text-slate-900">{r.inTime}</strong></div>
                        <div>Out: <strong className="text-slate-900">{r.outTime}</strong></div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                          r.status === 'P' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          r.status === 'Late' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          r.status === 'HD' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          r.status === 'L' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {r.status === 'P' ? 'Present' : r.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-700 tabular-nums">
                        {r.workingHours} hrs
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-600 tabular-nums">
                        {r.otHours > 0 ? `+${r.otHours} hrs` : '-'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {r.approvalStatus === 'Approved' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{r.approvedBy || 'Approved'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {hasPermission('attendance', 'approve') && r.approvalStatus === 'Pending' && (
                            <button
                              onClick={() => handleSingleApprove(r)}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded text-[11px] font-semibold cursor-pointer"
                              title="Approve OT and attendance"
                            >
                              Approve
                            </button>
                          )}
                          {hasPermission('attendance', 'edit') && (
                            <button
                              onClick={() => handleOpenCorrection(r)}
                              className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-[11px] font-medium cursor-pointer"
                            >
                              Correct / Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Correction Modal */}
      {selectedRecord && (
        <Modal
          isOpen={isCorrectionModalOpen}
          onClose={() => setIsCorrectionModalOpen(false)}
          title="Attendance & Overtime Correction"
          subtitle={`Adjust status and approved overtime hours for record ID ${selectedRecord.id}`}
        >
          <form onSubmit={handleSaveCorrection} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Attendance Status</label>
              <select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value as any)}
                className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-bold"
              >
                <option value="P">Present (Full Day)</option>
                <option value="Late">Late Coming</option>
                <option value="HD">Half Day (HD)</option>
                <option value="L">Leave (Approved)</option>
                <option value="A">Absent (Unapproved)</option>
                <option value="WO">Weekly Off (WO)</option>
                <option value="H">National / State Holiday (H)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Approved Overtime Hours (Rate 2.0x)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="8"
                value={editedOtHours}
                onChange={(e) => setEditedOtHours(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Calculated at double regular hourly rate under Factories Act
              </span>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Correction Remarks / Reason</label>
              <textarea
                rows={2}
                value={editedRemarks}
                onChange={(e) => setEditedRemarks(e.target.value)}
                placeholder="e.g. Approved extra overtime due to emergency boiler overhaul at NTPC."
                className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCorrectionModalOpen(false)}
                className="px-3 py-1.5 text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded shadow-xs"
              >
                Save & Approve
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
