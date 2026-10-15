import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { EmployeeCategory } from '../../types';
import {
  TrendingUp,
  FileText,
  Calculator,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Info
} from 'lucide-react';
import { ExportButton } from '../common/ExportButton';

export const WageRevisionView: React.FC = () => {
  const { wageRevisions, applyWageRevision, calculateDualWages, employees } = useApp();
  const { hasPermission } = useAuth();

  // Dual wage calculator state
  const [calcCategory, setCalcCategory] = useState<EmployeeCategory>('Skilled');
  const [calcFirstDays, setCalcFirstDays] = useState(15);
  const [calcSecondDays, setCalcSecondDays] = useState(11);
  const [calcPrevRate, setCalcPrevRate] = useState(785);
  const [calcNewRate, setCalcNewRate] = useState(824);

  const dualResult = calculateDualWages({
    category: calcCategory,
    daysFirstHalf: calcFirstDays,
    daysSecondHalf: calcSecondDays,
    prevRate: calcPrevRate,
    newRate: calcNewRate
  });

  const handleCategorySelectForCalc = (cat: EmployeeCategory) => {
    setCalcCategory(cat);
    const latestRevision = wageRevisions[0];
    const item = latestRevision?.categoryRates.find(c => c.category === cat);
    if (item) {
      setCalcPrevRate(item.previousDailyWage);
      setCalcNewRate(item.revisedDailyWage);
    }
  };

  const exportData = wageRevisions.flatMap(rev =>
    rev.categoryRates.map(cr => ({
      'Effective Date': rev.effectiveDate,
      'Sphere': rev.sphere,
      'Order No': rev.orderNumber,
      'Category': cr.category,
      'Previous Daily Wage': `₹${cr.previousDailyWage}`,
      'Revised Daily Wage': `₹${cr.revisedDailyWage}`,
      'Hike / VDA Difference': `+₹${cr.revisedDailyWage - cr.previousDailyWage}`,
      'Status': rev.appliedStatus
    }))
  );

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Government Wage Revision Management (1st April & 1st October)</h2>
          <p className="text-xs text-slate-500">
            Ministry of Labour & Employment biannual VDA revisions, automatic dual-wage mid-month calculations, and arrears management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            data={exportData}
            fileName="adro_korba_gov_wage_revisions"
            label="Export Wage Orders"
          />
        </div>
      </div>

      {/* Info Notice Box */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <strong className="font-bold">Statutory Industrial Requirement for Korba Mining & Construction:</strong>
          <p className="mt-0.5 leading-relaxed">
            Minimum wage rates in Central Sphere (Mines, Power plants, Coal washeries) and Chhattisgarh State Sphere are revised biannually with effect from <strong>1st April</strong> and <strong>1st October</strong> based on Consumer Price Index for Industrial Workers (CPI-IW). When revisions are notified mid-month, dual-wage calculation is legally mandated.
          </p>
        </div>
      </div>

      {/* Active Wage Revision Orders */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Biannual Wage Revision Orders</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {wageRevisions.map(rev => (
            <div key={rev.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-400">
                      Effective {rev.effectiveDate}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">({rev.sphere})</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-800 mt-1.5">{rev.orderNumber}</div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  rev.appliedStatus === 'Applied' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700'
                }`}>
                  {rev.appliedStatus}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{rev.notes}</p>

              {/* Category Rates Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Skill Category</th>
                      <th className="py-2 px-3 font-semibold text-right">Previous Rate</th>
                      <th className="py-2 px-3 font-semibold text-right">Revised Rate</th>
                      <th className="py-2 px-3 font-semibold text-right">VDA Hike</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {rev.categoryRates.map((cr, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-sans font-semibold text-slate-900">{cr.category}</td>
                        <td className="py-2 px-3 text-right text-slate-500 tabular-nums">₹{cr.previousDailyWage}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">₹{cr.revisedDailyWage}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600 tabular-nums">
                          +₹{cr.revisedDailyWage - cr.previousDailyWage}/day
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {hasPermission('wage_revision', 'edit') && rev.appliedStatus !== 'Applied' && (
                <button
                  onClick={() => applyWageRevision(rev.id)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                >
                  Apply Revised Rates to Active Rolls
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Mid-Cycle Dual-Wage & Arrears Simulator */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Interactive Dual-Wage Mid-Month Calculator</h3>
            <p className="text-xs text-slate-500">Calculate dual-wage split when wage revision is notified mid-cycle (e.g. October 15th)</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Form XVII Statutory Rule
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Select Skill Category</label>
            <select
              value={calcCategory}
              onChange={(e) => handleCategorySelectForCalc(e.target.value as EmployeeCategory)}
              className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-medium"
            >
              <option value="Highly Skilled">Highly Skilled</option>
              <option value="Skilled">Skilled</option>
              <option value="Semi-Skilled">Semi-Skilled</option>
              <option value="Unskilled">Unskilled</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Days at Old Wage Rate</label>
            <input
              type="number"
              min="0"
              max="31"
              value={calcFirstDays}
              onChange={(e) => setCalcFirstDays(Number(e.target.value))}
              className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Days at Revised Wage Rate</label>
            <input
              type="number"
              min="0"
              max="31"
              value={calcSecondDays}
              onChange={(e) => setCalcSecondDays(Number(e.target.value))}
              className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Old vs Revised Daily Rate (₹)</label>
            <div className="grid grid-cols-2 gap-1.5 font-mono">
              <input
                type="number"
                value={calcPrevRate}
                onChange={(e) => setCalcPrevRate(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 text-slate-600"
              />
              <input
                type="number"
                value={calcNewRate}
                onChange={(e) => setCalcNewRate(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Calculation Result Card */}
        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
          <div className="text-xs text-slate-400">Statutory Computation Formula Breakdown:</div>
          <div className="font-mono text-xs text-amber-400 font-semibold leading-relaxed">
            {dualResult.dailyBreakdown}
          </div>

          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-400">Total Month Composite Wage:</span>
              <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
                ₹{dualResult.totalWage.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400">Retroactive Arrears (if applied for full month):</span>
              <div className="text-2xl font-black font-mono text-amber-400 tabular-nums">
                +₹{dualResult.arrears.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
