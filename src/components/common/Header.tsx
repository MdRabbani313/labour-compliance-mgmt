import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Building2,
  ChevronDown,
  LogOut,
  Shield,
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  currentModuleTitle: string;
  currentModuleCategory: string;
  onOpenAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModuleTitle,
  currentModuleCategory,
  onOpenAlerts
}) => {
  const { currentUser, logout, switchUserRole } = useAuth();
  const { sites, selectedSiteId, setSelectedSiteId, alerts } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;

  const roleOptions: { role: UserRole; label: string }[] = [
    { role: 'super_admin', label: 'Super Admin' },
    { role: 'hr', label: 'HR Operations Manager' },
    { role: 'accounts', label: 'Accounts & Payroll Lead' },
    { role: 'site_supervisor', label: 'Site Incharge (Korba)' },
    { role: 'compliance_officer', label: 'Labour Compliance Officer' }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs no-print">
      {/* Zone 1: Breadcrumbs & Current Screen Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-xs text-slate-500 hidden sm:flex">
          <span className="font-semibold text-slate-700">Adro Korba</span>
          <span className="text-slate-300">/</span>
          <span>{currentModuleCategory}</span>
          <span className="text-slate-300">/</span>
        </div>
        <h1 className="text-base font-bold text-slate-900 truncate">
          {currentModuleTitle}
        </h1>
      </div>

      {/* Zone 2: Site Switcher Filter & Quick Search */}
      <div className="flex items-center gap-3">
        {/* Site Filter dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-400 text-[11px] hidden md:inline">Site:</span>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-none cursor-pointer pr-1"
          >
            <option value="all">All Sites (Consolidated)</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>
                {s.siteCode} - {s.siteName}
              </option>
            ))}
          </select>
        </div>

        {/* Alerts Center Trigger */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Statutory Alerts & Notifications"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white font-mono">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* User Account / Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-2xs">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <div className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                {currentUser?.name}
              </div>
              <div className="text-[10px] text-amber-600 font-medium truncate">
                {currentUser?.roleLabel}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{currentUser?.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser?.email}</div>
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Shield className="w-3 h-3" />
                  <span>{currentUser?.roleLabel}</span>
                </div>
              </div>

              {/* Fast Role Switch for testing */}
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                  Switch Active Role (Live Demo)
                </div>
                <div className="space-y-0.5">
                  {roleOptions.map((opt) => {
                    const isCurrent = currentUser?.role === opt.role;
                    return (
                      <button
                        key={opt.role}
                        onClick={() => {
                          switchUserRole(opt.role);
                          setIsProfileOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 text-xs rounded-md flex items-center justify-between cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-500/10 text-amber-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-1 px-2">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
