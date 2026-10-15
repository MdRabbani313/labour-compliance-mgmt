import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Flag, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { ExportButton } from '../common/ExportButton';

export const HolidayCalendarView: React.FC = () => {
  const { holidays } = useApp();

  const exportData = holidays.map(h => ({
    'Date': h.date,
    'Holiday Name': h.name,
    'Type': h.type,
    'Paid Status': h.isPaid ? 'Statutory Paid Holiday' : 'Unpaid',
    'Overtime Multiplier': `${h.otMultiplier}x (Double Daily Wage)`
  }));

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">National & State Holiday Master Calendar (2026)</h2>
          <p className="text-xs text-slate-500">
            Statutory paid holidays under National and Festival Holidays Act and Chhattisgarh Industrial Establishments Rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            data={exportData}
            fileName="adro_korba_holiday_calendar_2026"
            label="Export Holiday Master"
            onPrint={() => window.print()}
          />
        </div>
      </div>

      {/* Holiday Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {holidays.map(hol => {
          const isNational = hol.type === 'National Holiday';
          const isState = hol.type.includes('State');

          return (
            <div
              key={hol.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isNational ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    isState ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                    'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}>
                    {hol.type}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    100% Paid
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-3">{hol.name}</h3>
                <div className="text-xs font-mono font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{hol.date}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Work Overtime Rule:</span>
                <span className="font-mono font-bold text-amber-700">{hol.otMultiplier}x Double Pay</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statutory Rules Card */}
      <div className="p-5 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
        <h4 className="font-bold text-amber-400 text-sm">Industrial Establishment Rules for Holiday Work:</h4>
        <ul className="list-disc pl-5 space-y-1 text-slate-300 leading-relaxed">
          <li>Every workman employed in an industrial establishment shall be allowed in each calendar year paid holidays for Republic Day, Independence Day, and Mahatma Gandhi Jayanti.</li>
          <li>If an industrial worker is called upon to work on a notified holiday, they are entitled to twice the ordinary rate of wages (2.0x) or compensatory day off within three days as per Factories Act.</li>
          <li>For Chhattisgarh Statehood Day (1st November), state sphere units observe paid holiday as gazetted by Chhattisgarh State Government.</li>
        </ul>
      </div>
    </div>
  );
};
