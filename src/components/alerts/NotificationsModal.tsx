import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import {
  Bell,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Cake,
  FileText,
  ShieldAlert,
  Check
} from 'lucide-react';
import { ComplianceAlert } from '../../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToModule?: (key: any) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToModule
}) => {
  const { alerts, resolveAlert } = useApp();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAlerts = alerts.filter(a => {
    if (filterType === 'active') return a.status === 'Active';
    if (filterType === 'compliance') return a.type === 'compliance_due' || a.type === 'wage_revision';
    if (filterType === 'employee') return a.type === 'birthday' || a.type === 'anniversary';
    return true;
  });

  const getAlertIcon = (type: ComplianceAlert['type']) => {
    switch (type) {
      case 'compliance_due':
      case 'wage_revision':
        return ShieldAlert;
      case 'birthday':
        return Cake;
      case 'document_expiry':
      case 'contract_expiry':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compliance & Operational Alerts Radar"
      subtitle="Statutory filing deadlines, contract reviews, and workforce lifecycle milestones"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium w-fit">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded cursor-pointer ${filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'}`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-2.5 py-1 rounded cursor-pointer ${filterType === 'active' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'}`}
          >
            Active Only ({alerts.filter(a => a.status === 'Active').length})
          </button>
          <button
            onClick={() => setFilterType('compliance')}
            className={`px-2.5 py-1 rounded cursor-pointer ${filterType === 'compliance' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'}`}
          >
            Statutory & Legal
          </button>
          <button
            onClick={() => setFilterType('employee')}
            className={`px-2.5 py-1 rounded cursor-pointer ${filterType === 'employee' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'}`}
          >
            Workforce Milestones
          </button>
        </div>

        {/* List of Alerts */}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No alerts match this filter. All operational indicators normal.
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const Icon = getAlertIcon(alert.type);
              const isResolved = alert.status === 'Resolved';

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isResolved
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : alert.severity === 'high'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : alert.severity === 'medium'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-blue-50/50 border-blue-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-lg mt-0.5 ${
                        alert.severity === 'high' ? 'bg-rose-100 text-rose-700' :
                        alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs">{alert.title}</h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            alert.severity === 'high' ? 'bg-rose-200 text-rose-800' :
                            alert.severity === 'medium' ? 'bg-amber-200 text-amber-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                          {alert.description}
                        </p>
                        {alert.dueDate && (
                          <div className="text-[10px] font-mono font-semibold text-slate-500 mt-1.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Action Deadline: {alert.dueDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isResolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold shrink-0 cursor-pointer flex items-center gap-1"
                        title="Mark alert as acknowledged"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
