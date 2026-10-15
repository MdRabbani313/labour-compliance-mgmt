import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShiftConfig, ShiftType } from '../../types';
import { Clock, Moon, Sun, Sunrise, Sunset, Users, CheckCircle2, RotateCw } from 'lucide-react';
import { ExportButton } from '../common/ExportButton';

export const ShiftManagementView: React.FC = () => {
  const { shifts, employees, attendanceRecords, sites } = useApp();

  const [selectedShift, setSelectedShift] = useState<ShiftType>('Shift A');

  // Breakdown of employees deployed per shift
  const shiftStats = shifts.map(sft => {
    const recordsInShift = attendanceRecords.filter(r => r.shift === sft.name);
    const otHours = recordsInShift.reduce((sum, r) => sum + r.otHours, 0);

    return {
      shift: sft,
      activeToday: recordsInShift.length,
      otHours
    };
  });

  const exportData = shifts.map(s => ({
    'Shift Name': s.name,
    'Shift Code': s.code,
    'Start Time': s.startTime,
    'End Time': s.endTime,
    'Break Duration (mins)': s.breakDurationMinutes,
    'Grace Period (mins)': s.gracePeriodMinutes,
    'Is Night Shift': s.isNightShift ? 'Yes' : 'No',
    'Description': s.description
  }));

  const getShiftIcon = (name: ShiftType) => {
    switch (name) {
      case 'Shift A': return Sunrise;
      case 'Shift B': return Sunset;
      case 'Shift C': return Moon;
      case 'Shift G': return Sun;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Shift Configuration & Rotational Roster</h2>
          <p className="text-xs text-slate-500">
            Shift A, B, C (Night) and General G shifts across industrial plants and mining operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            data={exportData}
            fileName="adro_korba_shifts_config"
            label="Export Shift Master"
          />
        </div>
      </div>

      {/* Shifts Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {shifts.map(sft => {
          const Icon = getShiftIcon(sft.name);
          const isSelected = selectedShift === sft.name;
          const stat = shiftStats.find(st => st.shift.name === sft.name);

          return (
            <div
              key={sft.id}
              onClick={() => setSelectedShift(sft.name)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-amber-500 shadow-md ring-1 ring-amber-500/20'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}>
                  Shift {sft.code}
                </span>
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <h3 className="font-bold text-base mt-3">{sft.name}</h3>
              <div className={`text-xs font-mono font-semibold mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                {sft.startTime} — {sft.endTime}
              </div>

              <p className={`text-[11px] mt-2 line-clamp-2 leading-relaxed ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                {sft.description}
              </p>

              <div className={`mt-4 pt-3 border-t text-xs flex items-center justify-between ${
                isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}>
                <span>Deployed Today:</span>
                <strong className={`font-mono font-bold tabular-nums ${isSelected ? 'text-amber-400' : 'text-slate-900'}`}>
                  {stat?.activeToday || 0} Workers
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Shift Policy Details */}
      {(() => {
        const activeShiftObj = shifts.find(s => s.name === selectedShift) || shifts[0];
        const assignedRecords = attendanceRecords.filter(r => r.shift === selectedShift);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>{activeShiftObj.name} Rules & Policies</span>
                {activeShiftObj.isNightShift && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    Night Allowance Eligible
                  </span>
                )}
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Working Span</span>
                  <span className="font-mono font-bold text-slate-900">8.0 Hours (Net)</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Lunch / Meal Break</span>
                  <span className="font-mono font-bold text-slate-900">{activeShiftObj.breakDurationMinutes} Minutes</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Grace Arrival Period</span>
                  <span className="font-mono font-bold text-slate-900">{activeShiftObj.gracePeriodMinutes} Minutes</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Overtime Calculation</span>
                  <span className="font-semibold text-emerald-600">Double Hourly Rate (2.0x)</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500">Rotational Cycle</span>
                  <span className="text-slate-700 font-medium">Weekly Shift Swap (Every Monday)</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>Workers Roster for {activeShiftObj.name} (Today)</span>
                <span className="text-xs text-slate-500 font-mono">({assignedRecords.length} assigned)</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Worker</th>
                      <th className="py-2.5 px-3 font-semibold">Site</th>
                      <th className="py-2.5 px-3 font-semibold">Check In</th>
                      <th className="py-2.5 px-3 font-semibold">Check Out</th>
                      <th className="py-2.5 px-3 font-semibold text-right">OT Hours</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                          No workers currently clocked into {activeShiftObj.name}.
                        </td>
                      </tr>
                    ) : (
                      assignedRecords.map(r => {
                        const emp = employees.find(e => e.id === r.employeeId);
                        const site = sites.find(s => s.id === r.siteId);
                        return (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {emp?.fullName}
                              <div className="text-[10px] text-slate-400 font-mono">{emp?.empCode}</div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">{site?.siteCode}</td>
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{r.inTime}</td>
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{r.outTime}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600">
                              {r.otHours > 0 ? `+${r.otHours}h` : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
