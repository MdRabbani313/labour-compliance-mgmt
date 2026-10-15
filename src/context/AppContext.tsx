import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Employee,
  SiteMaster,
  ShiftConfig,
  AttendanceRecord,
  LeaveRequest,
  GovernmentWageRevision,
  PayrollEntry,
  ComplianceAlert,
  AuditLog,
  HolidayItem
} from '../types';
import {
  MOCK_EMPLOYEES,
  MOCK_SITES,
  SHIFT_CONFIGS,
  MOCK_ATTENDANCE_RECORDS,
  MOCK_LEAVE_REQUESTS,
  MOCK_GOV_WAGE_REVISIONS,
  MOCK_PAYROLL_ENTRIES,
  MOCK_ALERTS,
  MOCK_AUDIT_LOGS,
  MOCK_HOLIDAYS
} from '../data/mockData';
import { useAuth } from './AuthContext';

interface AppContextType {
  employees: Employee[];
  sites: SiteMaster[];
  shifts: ShiftConfig[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  wageRevisions: GovernmentWageRevision[];
  payrollEntries: PayrollEntry[];
  alerts: ComplianceAlert[];
  auditLogs: AuditLog[];
  holidays: HolidayItem[];
  selectedSiteId: string; // 'all' or specific siteId
  setSelectedSiteId: (siteId: string) => void;

  // Actions
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  updateAttendance: (record: AttendanceRecord) => void;
  bulkApproveAttendance: (recordIds: string[]) => void;
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'appliedOn' | 'status'>) => void;
  approveLeave: (leaveId: string) => void;
  rejectLeave: (leaveId: string, reason: string) => void;
  processMonthlyPayroll: (payrollMonth: string, siteId?: string) => void;
  applyWageRevision: (revisionId: string) => void;
  calculateDualWages: (params: {
    category: Employee['category'];
    daysFirstHalf: number;
    daysSecondHalf: number;
    prevRate: number;
    newRate: number;
  }) => { totalWage: number; arrears: number; dailyBreakdown: string };
  resolveAlert: (alertId: string) => void;
  addAuditLog: (module: string, action: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('ak_employees');
    return saved ? JSON.parse(saved) : MOCK_EMPLOYEES;
  });

  const [sites] = useState<SiteMaster[]>(() => {
    const saved = localStorage.getItem('ak_sites');
    return saved ? JSON.parse(saved) : MOCK_SITES;
  });

  const [shifts] = useState<ShiftConfig[]>(SHIFT_CONFIGS);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('ak_attendance');
    return saved ? JSON.parse(saved) : MOCK_ATTENDANCE_RECORDS;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('ak_leaves');
    return saved ? JSON.parse(saved) : MOCK_LEAVE_REQUESTS;
  });

  const [wageRevisions, setWageRevisions] = useState<GovernmentWageRevision[]>(() => {
    const saved = localStorage.getItem('ak_wage_revisions');
    return saved ? JSON.parse(saved) : MOCK_GOV_WAGE_REVISIONS;
  });

  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>(() => {
    const saved = localStorage.getItem('ak_payroll');
    return saved ? JSON.parse(saved) : MOCK_PAYROLL_ENTRIES;
  });

  const [alerts, setAlerts] = useState<ComplianceAlert[]>(() => {
    const saved = localStorage.getItem('ak_alerts');
    return saved ? JSON.parse(saved) : MOCK_ALERTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('ak_audit_logs');
    return saved ? JSON.parse(saved) : MOCK_AUDIT_LOGS;
  });

  const [holidays] = useState<HolidayItem[]>(MOCK_HOLIDAYS);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');

  // Persistence
  useEffect(() => {
    localStorage.setItem('ak_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('ak_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('ak_leaves', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('ak_payroll', JSON.stringify(payrollEntries));
  }, [payrollEntries]);

  useEffect(() => {
    localStorage.setItem('ak_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('ak_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('ak_wage_revisions', JSON.stringify(wageRevisions));
  }, [wageRevisions]);

  const addAuditLog = (module: string, action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id || 'sys',
      userName: currentUser ? `${currentUser.name} (${currentUser.roleLabel})` : 'System',
      userRole: currentUser?.roleLabel || 'System',
      module,
      action,
      details,
      ipAddress: '103.24.120.45 (Korba HQ)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newId = `emp-${Date.now().toString().slice(-4)}`;
    const newEmp: Employee = {
      ...empData,
      id: newId
    };
    setEmployees(prev => [newEmp, ...prev]);
    addAuditLog('Employee Management', 'Registered Employee', `Added ${newEmp.fullName} (${newEmp.empCode}) at site ${newEmp.siteId}`);
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
    addAuditLog('Employee Management', 'Updated Employee Details', `Updated records for ${emp.fullName} (${emp.empCode})`);
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    addAuditLog('Employee Management', 'Terminated/Removed Employee', `Removed employee ${emp?.fullName || id}`);
  };

  const markAttendance = (recordData: Omit<AttendanceRecord, 'id'>) => {
    const existingIndex = attendanceRecords.findIndex(
      r => r.employeeId === recordData.employeeId && r.date === recordData.date
    );

    if (existingIndex >= 0) {
      const updated = [...attendanceRecords];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...recordData
      };
      setAttendanceRecords(updated);
    } else {
      const newRecord: AttendanceRecord = {
        ...recordData,
        id: `att-${Date.now()}`
      };
      setAttendanceRecords(prev => [newRecord, ...prev]);
    }
    addAuditLog('Attendance', 'Marked Daily Attendance', `Marked attendance for emp ${recordData.employeeId} on ${recordData.date} as ${recordData.status}`);
  };

  const updateAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => prev.map(r => r.id === record.id ? record : r));
    addAuditLog('Attendance', 'Updated Attendance & OT', `Updated record ${record.id} - OT: ${record.otHours}h, Status: ${record.status}`);
  };

  const bulkApproveAttendance = (recordIds: string[]) => {
    setAttendanceRecords(prev =>
      prev.map(r => recordIds.includes(r.id) ? { ...r, approvalStatus: 'Approved', approvedBy: currentUser?.name } : r)
    );
    addAuditLog('Attendance', 'Bulk Approved Attendance & OT', `Approved ${recordIds.length} attendance records`);
  };

  const applyLeave = (leaveData: Omit<LeaveRequest, 'id' | 'appliedOn' | 'status'>) => {
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: `lv-${Date.now().toString().slice(-4)}`,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };
    setLeaveRequests(prev => [newLeave, ...prev]);
    addAuditLog('Leave Management', 'Leave Application Submitted', `Applied ${leaveData.days} days ${leaveData.leaveType} for ${leaveData.employeeId}`);
  };

  const approveLeave = (leaveId: string) => {
    setLeaveRequests(prev =>
      prev.map(l => l.id === leaveId ? { ...l, status: 'Approved', approvedBy: currentUser?.name } : l)
    );
    addAuditLog('Leave Management', 'Approved Leave', `Approved leave application ${leaveId}`);
  };

  const rejectLeave = (leaveId: string, reason: string) => {
    setLeaveRequests(prev =>
      prev.map(l => l.id === leaveId ? { ...l, status: 'Rejected', rejectionReason: reason, approvedBy: currentUser?.name } : l)
    );
    addAuditLog('Leave Management', 'Rejected Leave', `Rejected leave application ${leaveId}. Reason: ${reason}`);
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Resolved' } : a));
    addAuditLog('Compliance Alerts', 'Resolved Alert', `Marked alert ${alertId} as resolved`);
  };

  const applyWageRevision = (revisionId: string) => {
    const rev = wageRevisions.find(r => r.id === revisionId);
    if (!rev) return;

    // Update employees with the revised wage rate based on their category
    setEmployees(prev =>
      prev.map(emp => {
        if (emp.salaryType === 'Dynamic Daily Wage') {
          const catRate = rev.categoryRates.find(c => c.category === emp.category);
          if (catRate) {
            return {
              ...emp,
              dailyWageRate: catRate.totalDailyWage
            };
          }
        }
        return emp;
      })
    );

    setWageRevisions(prev =>
      prev.map(r => r.id === revisionId ? { ...r, appliedStatus: 'Applied' } : r)
    );

    addAuditLog('Wage Revision', 'Enforced Government Wage Order', `Applied ${rev.sphere} order ${rev.orderNumber} effective ${rev.effectiveDate}`);
  };

  const calculateDualWages = (params: {
    category: Employee['category'];
    daysFirstHalf: number;
    daysSecondHalf: number;
    prevRate: number;
    newRate: number;
  }) => {
    const firstHalfAmount = params.daysFirstHalf * params.prevRate;
    const secondHalfAmount = params.daysSecondHalf * params.newRate;
    const totalWage = firstHalfAmount + secondHalfAmount;
    const rateDiff = Math.max(0, params.newRate - params.prevRate);
    const arrears = rateDiff * params.daysFirstHalf; // Arrears if applied retroactively to first half
    const dailyBreakdown = `${params.daysFirstHalf} days @ ₹${params.prevRate} = ₹${firstHalfAmount.toLocaleString('en-IN')} + ${params.daysSecondHalf} days @ ₹${params.newRate} = ₹${secondHalfAmount.toLocaleString('en-IN')}`;

    return { totalWage, arrears, dailyBreakdown };
  };

  const processMonthlyPayroll = (payrollMonth: string, targetSiteId?: string) => {
    // Generate calculated entries for eligible employees
    const filteredEmployees = employees.filter(e => {
      if (targetSiteId && targetSiteId !== 'all') {
        return e.siteId === targetSiteId;
      }
      return true;
    });

    const newEntries: PayrollEntry[] = filteredEmployees.map(emp => {
      const isDynamic = emp.salaryType === 'Dynamic Daily Wage';
      const rate = isDynamic ? (emp.dailyWageRate || 750) : ((emp.monthlyFixedSalary || 30000) / 26);
      
      const payableDays = 26;
      const presentDays = 22;
      const weeklyOffs = 4;
      const otHours = isDynamic ? Math.floor(Math.random() * 20) : 0;

      // Base wage calculation
      const basicWage = Math.round(rate * payableDays * 0.65);
      const daWage = Math.round(rate * payableDays * 0.35);
      const hra = Math.round(basicWage * 0.12);
      const foodAllowance = 1000;
      const canteenAllowance = 500;
      const conveyanceAllowance = 800;
      const medicalAllowance = 600;
      const washingAllowance = 300;
      const specialAllowance = isDynamic ? 300 : 2000;
      const bonusAmount = 1200;

      // OT Calculation: 2.0x hourly rate: (rate / 8) * 2 * otHours
      const otEarnings = isDynamic ? Math.round((rate / 8) * 2 * otHours) : 0;

      const grossEarnings = basicWage + daWage + hra + foodAllowance + canteenAllowance +
        conveyanceAllowance + medicalAllowance + washingAllowance + otEarnings + specialAllowance + bonusAmount;

      // Statutory deductions
      // PF: 12% on Basic + DA capped at 15000 base ceiling (max 1800)
      const pfBase = Math.min(15000, basicWage + daWage);
      const pfEmployee = Math.round(pfBase * 0.12);
      const pfEmployer = pfEmployee;

      // ESIC: 0.75% of Gross if gross <= 21000, otherwise exempt
      const esicEmployee = grossEarnings <= 21000 ? Math.round(grossEarnings * 0.0075) : 0;
      const esicEmployer = grossEarnings <= 21000 ? Math.round(grossEarnings * 0.0325) : 0;

      // Professional tax
      const professionalTax = grossEarnings > 20000 ? 200 : 150;
      const tds = (!isDynamic && (emp.monthlyFixedSalary || 0) > 40000) ? 1500 : 0;
      const advanceRecovery = 0;
      const loanRecovery = 0;
      const penalty = 0;

      const totalDeductions = pfEmployee + esicEmployee + professionalTax + tds + advanceRecovery + loanRecovery + penalty;
      const netPayable = grossEarnings - totalDeductions;

      return {
        id: `pay-${emp.id}-${Date.now().toString().slice(-4)}`,
        payrollMonth,
        employeeId: emp.id,
        siteId: emp.siteId,
        category: emp.category,
        salaryType: emp.salaryType,
        totalMonthDays: 31,
        payableDays,
        presentDays,
        weeklyOffs,
        paidHolidays: 1,
        absentDays: 0,
        leaveDays: 0,
        otHours,
        basicWage,
        daWage,
        hra,
        foodAllowance,
        canteenAllowance,
        conveyanceAllowance,
        medicalAllowance,
        washingAllowance,
        otEarnings,
        specialAllowance,
        bonusAmount,
        grossEarnings,
        pfEmployee,
        pfEmployer,
        esicEmployee,
        esicEmployer,
        professionalTax,
        tds,
        advanceRecovery,
        loanRecovery,
        penalty,
        totalDeductions,
        netPayable,
        paymentStatus: 'Processed',
        bankRefNo: `NEFT-${emp.bankName.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`
      };
    });

    setPayrollEntries(newEntries);
    addAuditLog('Payroll Management', 'Executed Monthly Payroll Run', `Processed ${newEntries.length} employees for cycle ${payrollMonth}`);
  };

  return (
    <AppContext.Provider
      value={{
        employees,
        sites,
        shifts,
        attendanceRecords,
        leaveRequests,
        wageRevisions,
        payrollEntries,
        alerts,
        auditLogs,
        holidays,
        selectedSiteId,
        setSelectedSiteId,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        markAttendance,
        updateAttendance,
        bulkApproveAttendance,
        applyLeave,
        approveLeave,
        rejectLeave,
        processMonthlyPayroll,
        applyWageRevision,
        calculateDualWages,
        resolveAlert,
        addAuditLog
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
