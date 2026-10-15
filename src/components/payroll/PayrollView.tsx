import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PayrollEntry } from '../../types';
import {
  Banknote,
  Printer,
  Download,
  Building,
  CheckCircle2,
  FileText,
  CreditCard,
  Play,
  RotateCw,
  Eye,
  Send
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ExportButton } from '../common/ExportButton';

export const PayrollView: React.FC = () => {
  const { payrollEntries, employees, sites, processMonthlyPayroll, selectedSiteId } = useApp();
  const { hasPermission } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [siteFilter, setSiteFilter] = useState(selectedSiteId);
  const [salaryTypeFilter, setSalaryTypeFilter] = useState<string>('all');
  const [activePayslip, setActivePayslip] = useState<PayrollEntry | null>(null);
  const [isBankTransferOpen, setIsBankTransferOpen] = useState(false);

  // Filtered payroll entries
  const filteredEntries = payrollEntries.filter(entry => {
    if (entry.payrollMonth !== selectedMonth) return false;
    const emp = employees.find(e => e.id === entry.employeeId);
    if (!emp) return false;

    const activeSite = siteFilter !== 'all' ? siteFilter : (selectedSiteId !== 'all' ? selectedSiteId : 'all');
    if (activeSite !== 'all' && entry.siteId !== activeSite) return false;

    if (salaryTypeFilter !== 'all' && entry.salaryType !== salaryTypeFilter) return false;

    return true;
  });

  const totalGross = filteredEntries.reduce((sum, e) => sum + e.grossEarnings, 0);
  const totalNet = filteredEntries.reduce((sum, e) => sum + e.netPayable, 0);
  const totalDeductions = filteredEntries.reduce((sum, e) => sum + e.totalDeductions, 0);
  const totalPf = filteredEntries.reduce((sum, e) => sum + e.pfEmployee + e.pfEmployer, 0);
  const totalEsic = filteredEntries.reduce((sum, e) => sum + e.esicEmployee + e.esicEmployer, 0);
  const totalOt = filteredEntries.reduce((sum, e) => sum + e.otEarnings, 0);

  const handleRunPayroll = () => {
    processMonthlyPayroll(selectedMonth, siteFilter);
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  const exportSalaryRegisterData = filteredEntries.map(e => {
    const emp = employees.find(emp => emp.id === e.employeeId);
    const site = sites.find(s => s.id === e.siteId);
    return {
      'Month': e.payrollMonth,
      'Emp Code': emp?.empCode || '',
      'Worker Name': emp?.fullName || '',
      'Site': site?.siteName || '',
      'Category': e.category,
      'Salary Type': e.salaryType,
      'Payable Days': e.payableDays,
      'OT Hours': e.otHours,
      'Basic Wage': e.basicWage,
      'DA': e.daWage,
      'HRA': e.hra,
      'Allowances (Food/Medical/Wash/Conv)': e.foodAllowance + e.medicalAllowance + e.washingAllowance + e.conveyanceAllowance,
      'OT Earnings': e.otEarnings,
      'Bonus': e.bonusAmount,
      'Gross Earnings': e.grossEarnings,
      'PF (Employee 12%)': e.pfEmployee,
      'ESIC (0.75%)': e.esicEmployee,
      'Prof. Tax (PT)': e.professionalTax,
      'TDS': e.tds,
      'Total Deductions': e.totalDeductions,
      'Net Payable': e.netPayable,
      'Payment Status': e.paymentStatus,
      'Bank Ref': e.bankRefNo || ''
    };
  });

  const exportBankTransferData = filteredEntries.map(e => {
    const emp = employees.find(emp => emp.id === e.employeeId);
    return {
      'Beneficiary Name': emp?.fullName || '',
      'Bank Name': emp?.bankName || '',
      'Account Number': emp?.accountNumber || '',
      'IFSC Code': emp?.ifscCode || '',
      'Net Amount (₹)': e.netPayable,
      'Payment Mode': 'NEFT / RTGS',
      'Purpose': `Salary for ${e.payrollMonth}`,
      'Ref Number': e.bankRefNo || ''
    };
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Payroll Processing & Salary Registers</h2>
          <p className="text-xs text-slate-500">
            Automated dynamic wage calculations, 2.0x overtime, statutory deductions (PF/ESIC/PT), and bank NEFT advice
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportButton
            data={exportSalaryRegisterData}
            fileName={`adro_korba_salary_register_${selectedMonth.replace(' ', '_')}`}
            label="Salary Register"
          />

          <button
            onClick={() => setIsBankTransferOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Bank Transfer (NEFT)</span>
          </button>

          {hasPermission('payroll', 'create') && (
            <button
              onClick={handleRunPayroll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Run {selectedMonth} Payroll</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Period Selection Strip */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Payroll Cycle Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-amber-500 font-bold"
          >
            <option value="October 2026">October 2026 (Live Current)</option>
            <option value="September 2026">September 2026</option>
            <option value="August 2026">August 2026</option>
          </select>
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

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Salary Structure Mode</label>
          <select
            value={salaryTypeFilter}
            onChange={(e) => setSalaryTypeFilter(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-amber-500"
          >
            <option value="all">All Structures (Fixed & Dynamic Daily)</option>
            <option value="Dynamic Daily Wage">Dynamic Daily Wage (Hourly OT 2.0x)</option>
            <option value="Fixed">Monthly Fixed Salary</option>
          </select>
        </div>
      </div>

      {/* Financial Aggregates Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Gross Earnings Outflow</span>
          <div className="mt-1.5 text-xl font-bold font-mono text-slate-900 tabular-nums">
            ₹{totalGross.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Includes ₹{totalOt.toLocaleString('en-IN')} in OT</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Deductions</span>
          <div className="mt-1.5 text-xl font-bold font-mono text-rose-600 tabular-nums">
            -₹{totalDeductions.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">PF, ESIC, PT & Advances</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Net Bank Transfer</span>
          <div className="mt-1.5 text-xl font-bold font-mono text-emerald-600 tabular-nums">
            ₹{totalNet.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{filteredEntries.length} Worker Accounts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Statutory Remittance</span>
          <div className="mt-1.5 text-xl font-bold font-mono text-slate-900 tabular-nums">
            ₹{(totalPf + totalEsic).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-purple-700 font-semibold mt-0.5 block">PF (₹{totalPf.toLocaleString('en-IN')}) + ESIC</span>
        </div>
      </div>

      {/* Salary Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Worker Name</th>
                <th className="py-3 px-3 font-semibold">Structure</th>
                <th className="py-3 px-3 font-semibold text-right">Days / OT</th>
                <th className="py-3 px-3 font-semibold text-right">Basic + DA</th>
                <th className="py-3 px-3 font-semibold text-right">Allowances</th>
                <th className="py-3 px-3 font-semibold text-right">Gross Pay</th>
                <th className="py-3 px-3 font-semibold text-right">PF & Deductions</th>
                <th className="py-3 px-3 font-semibold text-right">Net Payable</th>
                <th className="py-3 px-4 font-semibold text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                    No payroll entries processed for {selectedMonth}. Click "Run {selectedMonth} Payroll" to generate.
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => {
                  const emp = employees.find(e => e.id === entry.employeeId);
                  const allowances = entry.grossEarnings - (entry.basicWage + entry.daWage + entry.otEarnings);

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{emp?.fullName || entry.employeeId}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {emp?.empCode} · {entry.category}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          entry.salaryType === 'Dynamic Daily Wage' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {entry.salaryType}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                        <div>{entry.payableDays} Days</div>
                        {entry.otHours > 0 && (
                          <div className="text-amber-600 font-bold text-[10px]">+{entry.otHours}h OT</div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                        ₹{(entry.basicWage + entry.daWage).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums">
                        ₹{allowances.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ₹{entry.grossEarnings.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-rose-600 tabular-nums">
                        -₹{entry.totalDeductions.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-700 tabular-nums text-sm">
                        ₹{entry.netPayable.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setActivePayslip(entry)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                          <span>View Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Formatted Payslip Modal */}
      {activePayslip && (() => {
        const emp = employees.find(e => e.id === activePayslip.employeeId);
        const site = sites.find(s => s.id === activePayslip.siteId);

        return (
          <Modal
            isOpen={!!activePayslip}
            onClose={() => setActivePayslip(null)}
            title={`Salary Payslip: ${emp?.fullName}`}
            subtitle={`Cycle: ${activePayslip.payrollMonth} · ${site?.siteName}`}
            maxWidth="4xl"
          >
            <div className="space-y-5 text-xs text-slate-800 print-sheet" id="printable-payslip">
              {/* Slip Header */}
              <div className="p-4 bg-slate-900 text-white rounded-lg flex items-start justify-between">
                <div>
                  <h3 className="text-base font-black tracking-tight text-amber-400">ADRO KORBA</h3>
                  <p className="text-xs text-slate-300">Industrial Infrastructure & Manpower Services</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Korba Thermal Power & Mining Operations Hub, Chhattisgarh</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Pay Advice / Wage Slip
                  </span>
                  <div className="text-xs font-mono text-amber-400 font-bold mt-0.5">{activePayslip.payrollMonth}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Rule 26(2) of Minimum Wages Act</div>
                </div>
              </div>

              {/* Employee & Statutory Metadata Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] block">Employee Name</span>
                  <strong className="text-slate-900">{emp?.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Employee ID</span>
                  <strong className="text-slate-900">{emp?.empCode}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Designation</span>
                  <strong className="text-slate-900">{emp?.designation}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Skill Category</span>
                  <strong className="text-slate-900">{emp?.category}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">UAN Number</span>
                  <strong className="text-slate-900">{emp?.uanNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">PF Number</span>
                  <strong className="text-slate-900">{emp?.pfNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">ESIC IP Number</span>
                  <strong className="text-slate-900">{emp?.esicNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Bank A/C & IFSC</span>
                  <strong className="text-slate-900">{emp?.accountNumber.slice(-4)} · {emp?.ifscCode}</strong>
                </div>
              </div>

              {/* Attendance Breakdown */}
              <div className="grid grid-cols-4 gap-2 text-center p-2.5 bg-slate-100 rounded-lg text-xs font-mono">
                <div>Total Days: <strong>{activePayslip.totalMonthDays}</strong></div>
                <div>Payable Days: <strong>{activePayslip.payableDays}</strong></div>
                <div>Present: <strong>{activePayslip.presentDays}</strong></div>
                <div>Approved OT: <strong className="text-amber-600">+{activePayslip.otHours} hrs</strong></div>
              </div>

              {/* Two Column Earnings & Deductions Statement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Earnings Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 text-xs">Earnings Components</div>
                  <div className="p-3 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between"><span>Basic Minimum Wage</span><span>₹{activePayslip.basicWage.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Dearness Allowance (DA / VDA)</span><span>₹{activePayslip.daWage.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>House Rent Allowance (HRA)</span><span>₹{activePayslip.hra.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Food Allowance</span><span>₹{activePayslip.foodAllowance.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Canteen Allowance</span><span>₹{activePayslip.canteenAllowance.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Conveyance Allowance</span><span>₹{activePayslip.conveyanceAllowance.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Medical Allowance</span><span>₹{activePayslip.medicalAllowance.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Washing Allowance</span><span>₹{activePayslip.washingAllowance.toLocaleString('en-IN')}</span></div>
                    {activePayslip.otEarnings > 0 && (
                      <div className="flex justify-between text-amber-700 font-bold">
                        <span>Overtime (2.0x Rate)</span><span>₹{activePayslip.otEarnings.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between"><span>Statutory Bonus</span><span>₹{activePayslip.bonusAmount.toLocaleString('en-IN')}</span></div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Gross Earnings (A)</span><span>₹{activePayslip.grossEarnings.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 text-xs">Deduction Components</div>
                  <div className="p-3 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between"><span>Provident Fund (PF Employee 12%)</span><span>₹{activePayslip.pfEmployee.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>ESIC Contribution (0.75%)</span><span>₹{activePayslip.esicEmployee.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Professional Tax (PT Chhattisgarh)</span><span>₹{activePayslip.professionalTax.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Income Tax (TDS)</span><span>₹{activePayslip.tds.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Advance Salary Recovery</span><span>₹{activePayslip.advanceRecovery.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Loan Recovery</span><span>₹{activePayslip.loanRecovery.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Penalties / Fine</span><span>₹{activePayslip.penalty.toLocaleString('en-IN')}</span></div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-rose-600">
                      <span>Total Deductions (B)</span><span>-₹{activePayslip.totalDeductions.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payable Highlight Box */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Net Remittance Payable (A - B)</span>
                  <div className="text-[11px] text-emerald-700 font-mono">Disbursed via Direct Bank Credit (NEFT)</div>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-700 tabular-nums">
                  ₹{activePayslip.netPayable.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Print Action in Modal */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 no-print">
                <span className="text-[11px] text-slate-400">System Generated Document · No Signature Required</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintPayslip}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Formal Payslip</span>
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Bank Transfer NEFT Modal */}
      <Modal
        isOpen={isBankTransferOpen}
        onClose={() => setIsBankTransferOpen(false)}
        title="Direct Bank Transfer Advice (NEFT / RTGS Export)"
        subtitle={`Total Disbursement: ₹${totalNet.toLocaleString('en-IN')} for ${filteredEntries.length} employees`}
        maxWidth="4xl"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800">
            <div>
              <strong>Bank Batch Ready:</strong> State Bank of India & PNB Bulk Corporate Banking File
            </div>
            <ExportButton
              data={exportBankTransferData}
              fileName={`adro_korba_neft_transfer_${selectedMonth.replace(' ', '_')}`}
              label="Download Bank CSV"
            />
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Beneficiary Worker</th>
                  <th className="py-2.5 px-3">Bank Name</th>
                  <th className="py-2.5 px-3 font-mono">A/C Number</th>
                  <th className="py-2.5 px-3 font-mono">IFSC</th>
                  <th className="py-2.5 px-3 font-mono text-right">Net Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredEntries.map(e => {
                  const emp = employees.find(emp => emp.id === e.employeeId);
                  return (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{emp?.fullName}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-700">{emp?.bankName}</td>
                      <td className="py-2.5 px-3 text-slate-800">{emp?.accountNumber}</td>
                      <td className="py-2.5 px-3 text-slate-800">{emp?.ifscCode}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700 tabular-nums">
                        ₹{e.netPayable.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                          {e.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};
