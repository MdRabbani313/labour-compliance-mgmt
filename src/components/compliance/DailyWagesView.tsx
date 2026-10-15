import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Receipt, Calendar, Clock, Banknote, CheckCircle2, Printer } from 'lucide-react';
import { ExportButton } from '../common/ExportButton';

export const DailyWagesView: React.FC = () => {
  const { employees, attendanceRecords, sites, selectedSiteId } = useApp();
  const { hasPermission } = useAuth();

  const [date, setDate] = useState('2026-10-15');
  const [siteFilter, setSiteFilter] = useState(selectedSiteId);

  // Dynamic daily wage workers only
  const dailyWageEmployees = employees.filter(e => e.salaryType === 'Dynamic Daily Wage');

  // Daily calculations for selected date
  const dailyRecords = dailyWageEmployees.map(emp => {
    const att = attendanceRecords.find(r => r.employeeId === emp.id && r.date === date);
    const site = sites.find(s => s.id === emp.siteId);
    const status = att?.status || 'P';
    const isPresent = status === 'P' || status === 'Late';
    const otHours = att?.otHours || 0;
    const baseRate = emp.dailyWageRate || 750;

    // OT Hourly Rate: (baseRate / 8) * 2
    const hourlyRate = baseRate / 8;
    const otRate = hourlyRate * 2;
    const otAmount = Math.round(otRate * otHours);

    // Day Wage
    const basePay = isPresent ? baseRate : (status === 'HD' ? Math.round(baseRate / 2) : 0);
    const netDailyPay = basePay + otAmount;

    return {
      emp,
      site,
      attendance: att,
      status,
      baseRate,
      otHours,
      otAmount,
      basePay,
      netDailyPay
    };
  }).filter(item => {
    const activeSite = siteFilter !== 'all' ? siteFilter : (selectedSiteId !== 'all' ? selectedSiteId : 'all');
    if (activeSite !== 'all' && item.emp.siteId !== activeSite) return false;
    return true;
  });

  const totalDailyPayout = dailyRecords.reduce((sum, item) => sum + item.netDailyPay, 0);
  const totalDailyOtHours = dailyRecords.reduce((sum, item) => sum + item.otHours, 0);

  const exportData = dailyRecords.map(item => ({
    'Date': date,
    'Emp Code': item.emp.empCode,
    'Worker Name': item.emp.fullName,
    'Category': item.emp.category,
    'Site': item.site?.siteName || '',
    'Status': item.status,
    'Base Daily Rate': `₹${item.baseRate}`,
    'OT Hours': item.otHours,
    'OT Payout (2.0x)': `₹${item.otAmount}`,
    'Base Day Pay': `₹${item.basePay}`,
    'Net Daily Cash / NEFT Payout': `₹${item.netDailyPay}`,
    'Bank A/C': item.emp.accountNumber
  }));

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Daily Wages & Cash Disbursement Register</h2>
          <p className="text-xs text-slate-500">
            Daily attendance, 2.0x overtime multiplier, and daily payment voucher muster under Payment of Wages Act
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            data={exportData}
            fileName={`adro_korba_daily_wages_${date}`}
            label="Export Daily Register"
            onPrint={() => window.print()}
          />
        </div>
      </div>

      {/* Date & Site Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Muster Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-amber-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter Site</label>
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-amber-500"
          >
            <option value="all">All Sites (Consolidated)</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>{s.siteCode} - {s.siteName}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Daily Outflow</span>
            <span className="text-base font-black font-mono text-emerald-700">₹{totalDailyPayout.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total OT Hours</span>
            <span className="text-base font-black font-mono text-amber-600">+{totalDailyOtHours} hrs</span>
          </div>
        </div>
      </div>

      {/* Daily Wages Muster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print-sheet">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Worker Name</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold">Site</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Daily Rate</th>
                <th className="py-3 px-3 font-semibold text-right">OT Hours (2.0x)</th>
                <th className="py-3 px-3 font-semibold text-right">OT Pay</th>
                <th className="py-3 px-3 font-semibold text-right">Net Daily Wage</th>
                <th className="py-3 px-4 font-semibold text-center">Disbursement Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {dailyRecords.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-sans font-bold text-slate-900">
                    {item.emp.fullName}
                    <div className="text-[10px] text-slate-400 font-mono">{item.emp.empCode}</div>
                  </td>

                  <td className="py-3 px-3 font-sans">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                      {item.emp.category}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-sans text-slate-700">{item.site?.siteCode}</td>

                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'P' ? 'bg-emerald-50 text-emerald-700' :
                      item.status === 'Late' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right text-slate-700 tabular-nums font-medium">
                    ₹{item.baseRate}
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-amber-600 tabular-nums">
                    {item.otHours > 0 ? `+${item.otHours}h` : '-'}
                  </td>

                  <td className="py-3 px-3 text-right font-semibold text-amber-700 tabular-nums">
                    ₹{item.otAmount}
                  </td>

                  <td className="py-3 px-3 text-right font-black text-emerald-700 tabular-nums text-sm">
                    ₹{item.netDailyPay.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-4 text-center font-sans text-[11px] text-slate-400">
                    <span className="italic">[ Bank Credit / Verified ]</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
