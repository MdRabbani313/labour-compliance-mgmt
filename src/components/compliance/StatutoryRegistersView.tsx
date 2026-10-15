import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  Filter
} from 'lucide-react';
import { ExportButton } from '../common/ExportButton';

export const StatutoryRegistersView: React.FC = () => {
  const { payrollEntries, employees, sites, attendanceRecords, selectedSiteId } = useApp();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<'form_b' | 'form_d' | 'form_a' | 'pf_ecr' | 'esic' | 'bonus'>('form_b');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState(selectedSiteId);
  const [selectedMonth, setSelectedMonth] = useState('October 2026');

  const filteredEntries = payrollEntries.filter(entry => {
    if (entry.payrollMonth !== selectedMonth) return false;
    const activeSite = selectedSiteFilter !== 'all' ? selectedSiteFilter : (selectedSiteId !== 'all' ? selectedSiteId : 'all');
    if (activeSite !== 'all' && entry.siteId !== activeSite) return false;
    return true;
  });

  // Statutory Form B data (Register of Wages under Rule 26(1))
  const formBData = filteredEntries.map((e, idx) => {
    const emp = employees.find(emp => emp.id === e.employeeId);
    const site = sites.find(s => s.id === e.siteId);
    return {
      'Sl No': idx + 1,
      'Name of Workman': emp?.fullName || '',
      'Designation / Category': `${emp?.designation} (${e.category})`,
      'Wage Rate (Daily/Monthly)': emp?.salaryType === 'Dynamic Daily Wage' ? `₹${emp?.dailyWageRate}/day` : `₹${emp?.monthlyFixedSalary}/mo`,
      'Total Days Worked': e.payableDays,
      'Units of Work / OT Hours': e.otHours,
      'Basic Wage': e.basicWage,
      'DA (VDA)': e.daWage,
      'HRA': e.hra,
      'Other Allowances': e.foodAllowance + e.medicalAllowance + e.conveyanceAllowance + e.washingAllowance,
      'Overtime Earnings': e.otEarnings,
      'Gross Wage Payable': e.grossEarnings,
      'PF Deduction': e.pfEmployee,
      'ESIC Deduction': e.esicEmployee,
      'Professional Tax': e.professionalTax,
      'Total Deductions': e.totalDeductions,
      'Net Amount Paid': e.netPayable,
      'Date of Payment': '10th of Month',
      'Bank Ref / Signature': e.bankRefNo || 'NEFT Transferred'
    };
  });

  // Statutory Form D data (Register of Overtime under Rule 78(1)(a)(iii))
  const formDData = filteredEntries.filter(e => e.otHours > 0).map((e, idx) => {
    const emp = employees.find(emp => emp.id === e.employeeId);
    const rate = emp?.dailyWageRate || 750;
    const hourlyRate = rate / 8;
    const otRate = hourlyRate * 2;

    return {
      'Sl No': idx + 1,
      'Worker Name': emp?.fullName || '',
      'Emp Code': emp?.empCode || '',
      'Department': emp?.department || '',
      'Dates on which Overtime Worked': `${selectedMonth} (Multiple Shifts)`,
      'Total Overtime Hours': e.otHours,
      'Normal Hourly Rate (₹)': hourlyRate.toFixed(2),
      'Overtime Rate (2.0x) (₹)': otRate.toFixed(2),
      'Normal Earnings': Math.round(hourlyRate * e.otHours),
      'Overtime Earnings Paid (₹)': e.otEarnings,
      'Date of Payment': '10th of Month'
    };
  });

  // PF ECR Summary Format
  const pfEcrData = filteredEntries.map((e, idx) => {
    const emp = employees.find(emp => emp.id === e.employeeId);
    const wages = Math.min(15000, e.basicWage + e.daWage);
    const epf = Math.round(wages * 0.12);
    const eps = Math.round(wages * 0.0833);
    const epfDiff = epf - eps;

    return {
      'Member ID': emp?.pfNumber || '',
      'UAN': emp?.uanNumber || '',
      'Member Name': emp?.fullName || '',
      'Gross Wages': e.grossEarnings,
      'EPF Wages': wages,
      'EPS Wages': wages,
      'EDLI Wages': wages,
      'EPF Contribution (EE 12%)': epf,
      'EPS Contribution (ER 8.33%)': eps,
      'EPF Diff (ER 3.67%)': epfDiff,
      'NCP Days (Non-Contributory)': e.absentDays,
      'Refund of Advances': 0
    };
  });

  // ESIC Return Format
  const esicData = filteredEntries.filter(e => e.esicEmployee > 0).map((e, idx) => {
    const emp = employees.find(emp => emp.id === e.employeeId);
    return {
      'IP Number': emp?.esicNumber || '',
      'IP Name': emp?.fullName || '',
      'No of Days for which Wages Paid': e.payableDays,
      'Total Monthly Wages': e.grossEarnings,
      'IP Employee Contribution (0.75%)': e.esicEmployee,
      'Employer Contribution (3.25%)': e.esicEmployer,
      'Total Remittance': e.esicEmployee + e.esicEmployer,
      'Reason Code for Zero Working Days': '-'
    };
  });

  // Bonus Act Form C statement
  const bonusData = filteredEntries.map((e, idx) => {
    const emp = employees.find(emp => emp.id === e.employeeId);
    const annualWages = (e.basicWage + e.daWage) * 12;
    return {
      'Sl No': idx + 1,
      'Name of Employee': emp?.fullName || '',
      'Category': e.category,
      'Days Worked in Year': 296,
      'Total Salary / Wage Earned': annualWages,
      'Statutory Bonus Payable (8.33%)': e.bonusAmount * 12,
      'Interim Bonus Paid': 0,
      'Net Amount of Bonus Payable': e.bonusAmount * 12,
      'Date on Which Paid': 'Prior to Diwali'
    };
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Labour Compliance & Statutory Registers</h2>
          <p className="text-xs text-slate-500">
            Official registers under CLRA Act 1970, Minimum Wages Act, Factories Act & EPFO / ESIC statutory bodies
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'form_b' && (
            <ExportButton
              data={formBData}
              fileName={`adro_korba_form_b_wage_register_${selectedMonth.replace(' ', '_')}`}
              label="Export Form B (CSV)"
              onPrint={() => window.print()}
            />
          )}
          {activeTab === 'form_d' && (
            <ExportButton
              data={formDData}
              fileName={`adro_korba_form_d_overtime_register_${selectedMonth.replace(' ', '_')}`}
              label="Export Form D (CSV)"
              onPrint={() => window.print()}
            />
          )}
          {activeTab === 'pf_ecr' && (
            <ExportButton
              data={pfEcrData}
              fileName={`adro_korba_pf_ecr_challan_${selectedMonth.replace(' ', '_')}`}
              label="Export PF ECR (CSV)"
              onPrint={() => window.print()}
            />
          )}
          {activeTab === 'esic' && (
            <ExportButton
              data={esicData}
              fileName={`adro_korba_esic_return_${selectedMonth.replace(' ', '_')}`}
              label="Export ESIC Return (CSV)"
              onPrint={() => window.print()}
            />
          )}
          {activeTab === 'bonus' && (
            <ExportButton
              data={bonusData}
              fileName={`adro_korba_bonus_form_c_${selectedMonth.replace(' ', '_')}`}
              label="Export Bonus Form C"
              onPrint={() => window.print()}
            />
          )}
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div>
            <label className="text-slate-500 mr-2 font-medium">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded font-bold"
            >
              <option value="October 2026">October 2026</option>
              <option value="September 2026">September 2026</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 mr-2 font-medium">Site:</label>
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded"
            >
              <option value="all">All Sites (Consolidated)</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.siteCode} - {s.siteName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Audited and Formatted for Deputy Chief Labour Commissioner (Central) Inspection
        </div>
      </div>

      {/* Register Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-lg overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('form_b')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'form_b' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Form B: Wage Register (Rule 26)
        </button>
        <button
          onClick={() => setActiveTab('form_d')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'form_d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Form D: Overtime Register (Rule 78)
        </button>
        <button
          onClick={() => setActiveTab('pf_ecr')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'pf_ecr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          EPF ECR Electronic Challan
        </button>
        <button
          onClick={() => setActiveTab('esic')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'esic' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ESIC Monthly Contribution Return
        </button>
        <button
          onClick={() => setActiveTab('bonus')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'bonus' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Payment of Bonus Act (Form C)
        </button>
      </div>

      {/* Tab 1: Form B Register */}
      {activeTab === 'form_b' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print-sheet">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-amber-400">FORM B · REGISTER OF WAGES</div>
              <div className="text-xs text-slate-300">[See Rule 26(1) of Minimum Wages (Central) Rules, 1950 & Rule 78(1)(a)(i) of CLRA Act]</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Establishment: Adro Korba Industrial Infrastructure · Korba (CG)</div>
            </div>
            <div className="text-right text-xs">
              <span className="font-mono text-amber-400 font-bold">{selectedMonth}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 select-none">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Sl No</th>
                  <th className="py-2.5 px-3 font-semibold font-sans">Name of Workman</th>
                  <th className="py-2.5 px-3 font-semibold font-sans">Designation</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Days</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Basic+DA</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Allowances</th>
                  <th className="py-2.5 px-3 font-semibold text-right">OT Pay</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Gross Pay</th>
                  <th className="py-2.5 px-3 font-semibold text-right">PF</th>
                  <th className="py-2.5 px-3 font-semibold text-right">ESIC</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Net Paid</th>
                  <th className="py-2.5 px-3 font-semibold font-sans">Bank Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formBData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500">{row['Sl No']}</td>
                    <td className="py-2 px-3 font-sans font-bold text-slate-900">{row['Name of Workman']}</td>
                    <td className="py-2 px-3 font-sans text-slate-600">{row['Designation / Category']}</td>
                    <td className="py-2 px-3 text-right">{row['Total Days Worked']}</td>
                    <td className="py-2 px-3 text-right font-semibold">₹{(row['Basic Wage'] + row['DA (VDA)']).toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 text-right">₹{row['Other Allowances'].toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 text-right text-amber-600">₹{row['Overtime Earnings'].toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">₹{row['Gross Wage Payable'].toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 text-right text-rose-600">₹{row['PF Deduction']}</td>
                    <td className="py-2 px-3 text-right text-rose-600">₹{row['ESIC Deduction']}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">₹{row['Net Amount Paid'].toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 font-sans text-slate-500 text-[10px]">{row['Bank Ref / Signature']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Form D Register */}
      {activeTab === 'form_d' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print-sheet">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-amber-400">FORM D / FORM IV · OVERTIME REGISTER FOR WORKERS</div>
              <div className="text-xs text-slate-300">[See Rule 78(1)(a)(iii) of Contract Labour Rules & Chhattisgarh Factories Rules]</div>
            </div>
            <div className="text-right text-xs">
              <span className="font-mono text-amber-400 font-bold">{selectedMonth}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Sl No</th>
                  <th className="py-2.5 px-3 font-semibold font-sans">Worker Name</th>
                  <th className="py-2.5 px-3 font-semibold font-sans">Emp Code</th>
                  <th className="py-2.5 px-3 font-semibold text-right">OT Hours</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Normal Hourly Rate</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Overtime Hourly Rate (2.0x)</th>
                  <th className="py-2.5 px-3 font-semibold text-right font-bold">Total OT Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formDData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500">{row['Sl No']}</td>
                    <td className="py-2 px-3 font-sans font-bold text-slate-900">{row['Worker Name']}</td>
                    <td className="py-2 px-3">{row['Emp Code']}</td>
                    <td className="py-2 px-3 text-right font-bold text-amber-600">+{row['Total Overtime Hours']}h</td>
                    <td className="py-2 px-3 text-right">₹{row['Normal Hourly Rate (₹)']}</td>
                    <td className="py-2 px-3 text-right font-semibold text-amber-700">₹{row['Overtime Rate (2.0x) (₹)']}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">₹{row['Overtime Earnings Paid (₹)'].toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: EPF ECR */}
      {activeTab === 'pf_ecr' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-amber-400">EPFO ELECTRONIC CHALLAN RETURN (ECR) FILE FORMAT</div>
              <div className="text-xs text-slate-300">EPF & MP Act 1952 · Establishment Code: CG/KOR/0045210/000</div>
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold">Due: 15th October 2026</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">UAN</th>
                  <th className="py-2.5 px-3 font-sans">Member Name</th>
                  <th className="py-2.5 px-3 text-right">Gross Wages</th>
                  <th className="py-2.5 px-3 text-right">EPF Wages (Capped)</th>
                  <th className="py-2.5 px-3 text-right">EE Share (12%)</th>
                  <th className="py-2.5 px-3 text-right">EPS Share (8.33%)</th>
                  <th className="py-2.5 px-3 text-right">ER Share (3.67%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pfEcrData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">{row['UAN']}</td>
                    <td className="py-2 px-3 font-sans font-semibold text-slate-800">{row['Member Name']}</td>
                    <td className="py-2 px-3 text-right">₹{row['Gross Wages'].toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 text-right">₹{row['EPF Wages'].toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">₹{row['EPF Contribution (EE 12%)']}</td>
                    <td className="py-2 px-3 text-right">₹{row['EPS Contribution (ER 8.33%)']}</td>
                    <td className="py-2 px-3 text-right">₹{row['EPF Diff (ER 3.67%)']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: ESIC Return */}
      {activeTab === 'esic' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-amber-400">ESIC MONTHLY CONTRIBUTION RETURN</div>
              <div className="text-xs text-slate-300">ESI Act 1948 · Sub-Regional Office: Raipur / Korba Branch</div>
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold">Wage Ceiling: ₹21,000 / month</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">IP Number</th>
                  <th className="py-2.5 px-3 font-sans">Insured Person Name</th>
                  <th className="py-2.5 px-3 text-right">Worked Days</th>
                  <th className="py-2.5 px-3 text-right">Monthly Wages</th>
                  <th className="py-2.5 px-3 text-right">Employee (0.75%)</th>
                  <th className="py-2.5 px-3 text-right">Employer (3.25%)</th>
                  <th className="py-2.5 px-3 text-right font-bold">Total ESI Deposit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {esicData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">{row['IP Number']}</td>
                    <td className="py-2 px-3 font-sans font-semibold text-slate-800">{row['IP Name']}</td>
                    <td className="py-2 px-3 text-right">{row['No of Days for which Wages Paid']}</td>
                    <td className="py-2 px-3 text-right">₹{row['Total Monthly Wages'].toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 text-right text-rose-600">₹{row['IP Employee Contribution (0.75%)']}</td>
                    <td className="py-2 px-3 text-right text-rose-700">₹{row['Employer Contribution (3.25%)']}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">₹{row['Total Remittance']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Bonus Act Form C */}
      {activeTab === 'bonus' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-amber-400">PAYMENT OF BONUS ACT, 1965 · FORM C</div>
              <div className="text-xs text-slate-300">[See Rule 4(c)] Statement showing bonus paid to employees for accounting year</div>
            </div>
            <div className="text-xs font-mono text-amber-400 font-bold">Statutory Rate: 8.33%</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Sl No</th>
                  <th className="py-2.5 px-3 font-sans">Name of Employee</th>
                  <th className="py-2.5 px-3 font-sans">Category</th>
                  <th className="py-2.5 px-3 text-right">Days Worked</th>
                  <th className="py-2.5 px-3 text-right">Annual Base Wage</th>
                  <th className="py-2.5 px-3 text-right font-bold text-emerald-700">Statutory Bonus Payable (8.33%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bonusData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500">{row['Sl No']}</td>
                    <td className="py-2 px-3 font-sans font-bold text-slate-900">{row['Name of Employee']}</td>
                    <td className="py-2 px-3 font-sans">{row['Category']}</td>
                    <td className="py-2 px-3 text-right">{row['Days Worked in Year']}</td>
                    <td className="py-2 px-3 text-right">₹{row['Total Salary / Wage Earned'].toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">₹{row['Statutory Bonus Payable (8.33%)'].toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
