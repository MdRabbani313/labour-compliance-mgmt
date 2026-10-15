import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { Sidebar, NavItemKey } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { EmployeeManagementView } from './components/employees/EmployeeManagementView';
import { ManpowerView } from './components/manpower/ManpowerView';
import { SiteManagementView } from './components/sites/SiteManagementView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { ShiftManagementView } from './components/shifts/ShiftManagementView';
import { LeaveManagementView } from './components/leave/LeaveManagementView';
import { PayrollView } from './components/payroll/PayrollView';
import { WageRevisionView } from './components/compliance/WageRevisionView';
import { DailyWagesView } from './components/compliance/DailyWagesView';
import { StatutoryRegistersView } from './components/compliance/StatutoryRegistersView';
import { RolePermissionsView } from './components/roles/RolePermissionsView';
import { HolidayCalendarView } from './components/holidays/HolidayCalendarView';
import { NotificationsModal } from './components/alerts/NotificationsModal';

const MainPortalContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<NavItemKey>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const getModuleMeta = (key: NavItemKey): { title: string; category: string } => {
    switch (key) {
      case 'dashboard':
        return { title: 'Executive MIS & Compliance Overview', category: 'Executive' };
      case 'employees':
        return { title: 'Employee Master Directory', category: 'Workforce Operations' };
      case 'manpower':
        return { title: 'Manpower Deployment & Workforce Planning', category: 'Workforce Operations' };
      case 'sites':
        return { title: 'Site Master & Client Contracts', category: 'Workforce Operations' };
      case 'attendance':
        return { title: 'Daily Attendance & Overtime Verification', category: 'Time & Attendance' };
      case 'shifts':
        return { title: 'Shift Configuration & Rotational Rosters', category: 'Time & Attendance' };
      case 'leave':
        return { title: 'Leave Applications & Encashment', category: 'Time & Attendance' };
      case 'holidays':
        return { title: 'Holiday Master & Statutory Overtime Rules', category: 'Time & Attendance' };
      case 'payroll':
        return { title: 'Monthly Payroll Runs & Salary Registers', category: 'Compensation & Payroll' };
      case 'daily_wages':
        return { title: 'Daily Wages Muster & Cash Disbursement', category: 'Compensation & Payroll' };
      case 'wage_revision':
        return { title: 'Government Wage Revision (1 Apr & 1 Oct)', category: 'Compensation & Payroll' };
      case 'statutory_registers':
        return { title: 'Labour Compliance Registers (Form B, D, Muster & PF/ESIC)', category: 'Statutory & Governance' };
      case 'roles_permissions':
        return { title: 'Role-Based Access Control & Immutable Audit Trail', category: 'Administration' };
      default:
        return { title: 'Industrial HRMS Portal', category: 'Adro Korba' };
    }
  };

  const meta = getModuleMeta(currentView);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex flex-1 overflow-hidden h-screen">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(v) => setCurrentView(v)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main View Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <Header
            currentModuleTitle={meta.title}
            currentModuleCategory={meta.category}
            onOpenAlerts={() => setIsAlertsModalOpen(true)}
          />

          {/* View Container */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {currentView === 'dashboard' && <DashboardView onNavigate={(k) => setCurrentView(k)} />}
              {currentView === 'employees' && <EmployeeManagementView />}
              {currentView === 'manpower' && <ManpowerView />}
              {currentView === 'sites' && <SiteManagementView />}
              {currentView === 'attendance' && <AttendanceView />}
              {currentView === 'shifts' && <ShiftManagementView />}
              {currentView === 'leave' && <LeaveManagementView />}
              {currentView === 'holidays' && <HolidayCalendarView />}
              {currentView === 'payroll' && <PayrollView />}
              {currentView === 'daily_wages' && <DailyWagesView />}
              {currentView === 'wage_revision' && <WageRevisionView />}
              {currentView === 'statutory_registers' && <StatutoryRegistersView />}
              {currentView === 'roles_permissions' && <RolePermissionsView />}
            </div>
          </main>
        </div>
      </div>

      {/* Notifications / Alerts Center Modal */}
      <NotificationsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        onNavigateToModule={(k) => {
          setIsAlertsModalOpen(false);
          setCurrentView(k);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainPortalContent />
      </AppProvider>
    </AuthProvider>
  );
}
