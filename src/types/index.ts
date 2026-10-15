export type UserRole = 'super_admin' | 'hr' | 'accounts' | 'site_supervisor' | 'compliance_officer';

export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave' | 'Resigned' | 'Transferred';

export type EmployeeCategory = 'Unskilled' | 'Semi-Skilled' | 'Skilled' | 'Highly Skilled';

export type SalaryType = 'Fixed' | 'Dynamic Daily Wage';

export type AttendanceStatus = 'P' | 'A' | 'HD' | 'WO' | 'H' | 'L' | 'Late' | 'Early';

export type ShiftType = 'Shift A' | 'Shift B' | 'Shift C' | 'Shift G';

export interface UserPermission {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  assignedSites: string[]; // Site IDs or ['*'] for all
  permissions: UserPermission[];
  lastLogin: string;
}

export interface Employee {
  id: string;
  empCode: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  contactNo: string;
  email: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  doj: string;
  status: EmployeeStatus;
  
  // Employment Details
  department: string;
  designation: string;
  siteId: string;
  reportingManager: string;
  category: EmployeeCategory;
  salaryType: SalaryType;
  contractorName: string;
  
  // Document Management
  aadhaarNumber: string;
  panNumber: string;
  pfNumber: string;
  esicNumber: string;
  uanNumber: string;
  
  // Bank Details
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;

  // Wage / Base Details
  monthlyFixedSalary?: number;
  dailyWageRate?: number; // Base daily wage under government minimum wage or custom
  baseAllowance?: number;
}

export interface SiteMaster {
  id: string;
  siteCode: string;
  siteName: string;
  clientName: string;
  location: string;
  contractDuration: string;
  contractStart: string;
  contractEnd: string;
  salaryCycle: string; // e.g. "1st to 30th/31st" or "26th to 25th"
  requiredManpower: number;
  activeShifts: ShiftType[];
  overtimeRule: string; // e.g. "Double Hourly Rate (2.0x)"
  wageSphere: 'Central Sphere' | 'State Sphere (Chhattisgarh)';
  status: 'Active' | 'Under Review' | 'Completed';
}

export interface ShiftConfig {
  id: string;
  name: ShiftType;
  code: string;
  startTime: string;
  endTime: string;
  breakDurationMinutes: number;
  gracePeriodMinutes: number;
  isNightShift: boolean;
  color: string;
  description: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  shift: ShiftType;
  inTime: string;
  outTime: string;
  workingHours: number;
  otHours: number;
  siteId: string;
  approvalStatus: 'Approved' | 'Pending' | 'Rejected';
  approvedBy?: string;
  remarks?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: 'Sick Leave' | 'Paid Leave' | 'Casual Leave';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface LeaveBalance {
  employeeId: string;
  sickLeaveTotal: number;
  sickLeaveUsed: number;
  paidLeaveTotal: number;
  paidLeaveUsed: number;
  casualLeaveTotal: number;
  casualLeaveUsed: number;
}

export interface GovernmentWageRevision {
  id: string;
  effectiveDate: string; // e.g. "2026-10-01" or "2026-04-01"
  sphere: 'Central Sphere' | 'State Sphere (Chhattisgarh)';
  orderNumber: string;
  categoryRates: {
    category: EmployeeCategory;
    previousDailyWage: number;
    revisedDailyWage: number;
    previousVDA: number;
    revisedVDA: number;
    totalDailyWage: number;
  }[];
  appliedStatus: 'Applied' | 'Scheduled' | 'Draft';
  notes: string;
}

export interface PayrollEntry {
  id: string;
  payrollMonth: string; // e.g., "October 2026"
  employeeId: string;
  siteId: string;
  category: EmployeeCategory;
  salaryType: SalaryType;
  
  // Attendance metrics
  totalMonthDays: number;
  payableDays: number;
  presentDays: number;
  weeklyOffs: number;
  paidHolidays: number;
  absentDays: number;
  leaveDays: number;
  otHours: number;
  
  // Earnings
  basicWage: number;
  daWage: number;
  hra: number;
  foodAllowance: number;
  canteenAllowance: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  washingAllowance: number;
  otEarnings: number;
  specialAllowance: number;
  bonusAmount: number;
  grossEarnings: number;
  
  // Deductions
  pfEmployee: number; // 12%
  pfEmployer: number; // 12%
  esicEmployee: number; // 0.75%
  esicEmployer: number; // 3.25%
  professionalTax: number;
  tds: number;
  advanceRecovery: number;
  loanRecovery: number;
  penalty: number;
  totalDeductions: number;
  
  // Net
  netPayable: number;
  paymentStatus: 'Processed' | 'Paid' | 'Hold';
  paymentDate?: string;
  bankRefNo?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  module: string;
  action: string;
  details: string;
  ipAddress: string;
}

export interface ComplianceAlert {
  id: string;
  type: 'compliance_due' | 'wage_revision' | 'document_expiry' | 'contract_expiry' | 'birthday' | 'anniversary' | 'approval_pending';
  severity: 'high' | 'medium' | 'info';
  title: string;
  description: string;
  dueDate?: string;
  targetId?: string;
  status: 'Active' | 'Resolved';
}

export interface HolidayItem {
  id: string;
  date: string;
  name: string;
  type: 'National Holiday' | 'State Holiday (Chhattisgarh)' | 'Festival Holiday' | 'Weekly Off';
  isPaid: boolean;
  otMultiplier: number; // 2.0x
}
