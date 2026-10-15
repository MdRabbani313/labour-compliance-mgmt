import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  HardHat,
  Building,
  Clock,
  CalendarCheck2,
  CalendarRange,
  Banknote,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  ShieldAlert,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export type NavItemKey =
  | 'dashboard'
  | 'employees'
  | 'manpower'
  | 'sites'
  | 'attendance'
  | 'shifts'
  | 'leave'
  | 'payroll'
  | 'wage_revision'
  | 'daily_wages'
  | 'statutory_registers'
  | 'roles_permissions'
  | 'holidays';

interface SidebarProps {
  currentView: NavItemKey;
  onSelectView: (view: NavItemKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse
}) => {
  const { currentUser, hasPermission } = useAuth();
  const { leaveRequests, attendanceRecords } = useApp();

  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'Pending').length;
  const pendingAttendanceCount = attendanceRecords.filter(a => a.approvalStatus === 'Pending').length;

  const navSections = [
    {
      heading: 'Executive & Overview',
      items: [
        {
          key: 'dashboard' as NavItemKey,
          label: 'Executive MIS',
          icon: LayoutDashboard,
          visible: true
        }
      ]
    },
    {
      heading: 'Workforce Operations',
      items: [
        {
          key: 'employees' as NavItemKey,
          label: 'Employee Master',
          icon: Users,
          visible: hasPermission('employees', 'view')
        },
        {
          key: 'manpower' as NavItemKey,
          label: 'Manpower Deployment',
          icon: HardHat,
          visible: hasPermission('manpower', 'view')
        },
        {
          key: 'sites' as NavItemKey,
          label: 'Site Master',
          icon: Building,
          visible: true
        }
      ]
    },
    {
      heading: 'Time & Attendance',
      items: [
        {
          key: 'attendance' as NavItemKey,
          label: 'Daily Attendance & OT',
          icon: CalendarCheck2,
          badge: pendingAttendanceCount > 0 ? pendingAttendanceCount : undefined,
          visible: hasPermission('attendance', 'view')
        },
        {
          key: 'shifts' as NavItemKey,
          label: 'Shift Management',
          icon: Clock,
          visible: hasPermission('shifts', 'view')
        },
        {
          key: 'leave' as NavItemKey,
          label: 'Leave Management',
          icon: CalendarRange,
          badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
          visible: hasPermission('leave', 'view')
        },
        {
          key: 'holidays' as NavItemKey,
          label: 'Holiday Calendar',
          icon: Sliders,
          visible: true
        }
      ]
    },
    {
      heading: 'Compensation & Payroll',
      items: [
        {
          key: 'payroll' as NavItemKey,
          label: 'Monthly Payroll & Slips',
          icon: Banknote,
          visible: hasPermission('payroll', 'view')
        },
        {
          key: 'daily_wages' as NavItemKey,
          label: 'Daily Wages Register',
          icon: Receipt,
          visible: hasPermission('daily_wages', 'view')
        },
        {
          key: 'wage_revision' as NavItemKey,
          label: 'Wage Revisions (1 Apr/Oct)',
          icon: TrendingUp,
          visible: hasPermission('wage_revision', 'view')
        }
      ]
    },
    {
      heading: 'Statutory & Governance',
      items: [
        {
          key: 'statutory_registers' as NavItemKey,
          label: 'Labour Compliance Registers',
          icon: FileSpreadsheet,
          visible: hasPermission('compliance', 'view') || currentUser?.role === 'super_admin'
        },
        {
          key: 'roles_permissions' as NavItemKey,
          label: 'Roles & Audit Trail',
          icon: ShieldAlert,
          visible: currentUser?.role === 'super_admin'
        }
      ]
    }
  ];

  return (
    <aside
      className={`bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-200 select-none no-print ${
        isCollapsed ? 'w-16' : 'w-64'
      } shrink-0`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md">
              AK
            </div>
            <div className="leading-tight truncate">
              <span className="font-bold text-white text-sm tracking-tight block">ADRO KORBA</span>
              <span className="text-[10px] text-amber-400 font-medium tracking-wide uppercase">Labour Compliance HRMS</span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-md">
            AK
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 hidden sm:block"
          title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navSections.map((section, sIdx) => {
          const visibleItems = section.items.filter(item => item.visible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.heading}
                </div>
              )}
              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectView(item.key)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-2.5 py-2 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${
                        isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Current Active Role Capsule Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <div className="text-[11px] font-semibold text-slate-200 truncate">{currentUser?.name}</div>
              <div className="text-[10px] text-amber-400 truncate">{currentUser?.roleLabel}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
