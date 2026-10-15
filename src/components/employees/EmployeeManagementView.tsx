import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Employee, EmployeeCategory, SalaryType, EmployeeStatus } from '../../types';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CreditCard,
  FileText,
  Building,
  UserCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ExportButton } from '../common/ExportButton';

export const EmployeeManagementView: React.FC = () => {
  const { employees, sites, addEmployee, updateEmployee, deleteEmployee, selectedSiteId } = useApp();
  const { hasPermission } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>(selectedSiteId);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const initialFormState: Omit<Employee, 'id'> = {
    empCode: `AK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: '',
    gender: 'Male',
    dob: '1995-01-01',
    contactNo: '+91 ',
    email: '',
    emergencyContact: { name: '', relation: 'Spouse', phone: '' },
    doj: new Date().toISOString().split('T')[0],
    status: 'Active',
    department: 'Civil Operations & Rigging',
    designation: 'Industrial Rigger',
    siteId: sites[0]?.id || 'site-1',
    reportingManager: 'Mahendra Sahu',
    category: 'Skilled',
    salaryType: 'Dynamic Daily Wage',
    contractorName: 'Adro Direct Manpower',
    aadhaarNumber: '',
    panNumber: '',
    pfNumber: 'CG/KOR/0045210/000/',
    esicNumber: '4100987654321',
    uanNumber: '100987654',
    bankName: 'State Bank of India',
    accountNumber: '',
    ifscCode: 'SBIN0000417',
    branchName: 'Korba Branch',
    dailyWageRate: 824,
    baseAllowance: 100,
    monthlyFixedSalary: 25000
  };

  const [formData, setFormData] = useState<Omit<Employee, 'id'>>(initialFormState);

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    // Global or local site filter
    const activeSite = selectedSiteFilter !== 'all' ? selectedSiteFilter : (selectedSiteId !== 'all' ? selectedSiteId : 'all');
    if (activeSite !== 'all' && emp.siteId !== activeSite) return false;

    if (categoryFilter !== 'all' && emp.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && emp.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.fullName.toLowerCase().includes(q);
      const matchCode = emp.empCode.toLowerCase().includes(q);
      const matchDept = emp.department.toLowerCase().includes(q);
      const matchAadhaar = emp.aadhaarNumber.includes(q);
      const matchUan = emp.uanNumber.includes(q);
      return matchName || matchCode || matchDept || matchAadhaar || matchUan;
    }

    return true;
  });

  const handleOpenAdd = () => {
    setFormData({
      ...initialFormState,
      empCode: `AK-2026-0${employees.length + 101}`
    });
    setIsEditMode(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setActiveEmployee(emp);
    setFormData({ ...emp });
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleOpenView = (emp: Employee) => {
    setActiveEmployee(emp);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from active rolls?`)) {
      deleteEmployee(id);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && activeEmployee) {
      updateEmployee({
        ...formData,
        id: activeEmployee.id
      });
    } else {
      addEmployee(formData);
    }
    setIsAddModalOpen(false);
  };

  // CSV export representation
  const exportData = filteredEmployees.map(emp => {
    const site = sites.find(s => s.id === emp.siteId);
    return {
      'Emp Code': emp.empCode,
      'Full Name': emp.fullName,
      'Category': emp.category,
      'Department': emp.department,
      'Designation': emp.designation,
      'Site': site?.siteName || emp.siteId,
      'Status': emp.status,
      'Salary Type': emp.salaryType,
      'Daily Wage / Salary': emp.salaryType === 'Dynamic Daily Wage' ? `₹${emp.dailyWageRate}/day` : `₹${emp.monthlyFixedSalary}/mo`,
      'PF No': emp.pfNumber,
      'ESIC No': emp.esicNumber,
      'UAN': emp.uanNumber,
      'Bank': emp.bankName,
      'Account No': emp.accountNumber,
      'IFSC': emp.ifscCode,
      'DOJ': emp.doj,
      'Contact': emp.contactNo
    };
  });

  return (
    <div className="space-y-5">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Employee Master Directory</h2>
          <p className="text-xs text-slate-500">
            Registered industrial manpower across Korba projects ({filteredEmployees.length} records found)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            data={exportData}
            fileName="adro_korba_employees"
            label="Export Register"
          />

          {hasPermission('employees', 'create') && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, Code, Aadhaar, UAN, Dept..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        {/* Site Filter */}
        <div>
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Sites</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>
                {s.siteCode} - {s.siteName}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Skill Categories</option>
            <option value="Highly Skilled">Highly Skilled</option>
            <option value="Skilled">Skilled</option>
            <option value="Semi-Skilled">Semi-Skilled</option>
            <option value="Unskilled">Unskilled</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
            <option value="Resigned">Resigned</option>
            <option value="Transferred">Transferred</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-4 font-semibold">Emp ID & Name</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold">Site & Department</th>
                <th className="py-3 px-3 font-semibold">Salary / Wage</th>
                <th className="py-3 px-3 font-semibold">Statutory IDs</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No employee records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => {
                  const site = sites.find(s => s.id === emp.siteId);
                  const isDynamic = emp.salaryType === 'Dynamic Daily Wage';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{emp.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {emp.empCode} · {emp.gender} · DOJ: {emp.doj}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                          emp.category === 'Highly Skilled' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          emp.category === 'Skilled' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          emp.category === 'Semi-Skilled' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {emp.category}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{site?.siteName || emp.siteId}</div>
                        <div className="text-[11px] text-slate-500">{emp.designation} · {emp.department}</div>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        {isDynamic ? (
                          <div>
                            <span className="font-bold text-slate-900 tabular-nums">₹{emp.dailyWageRate}</span>
                            <span className="text-[10px] text-slate-500"> / day</span>
                            <div className="text-[10px] text-amber-600 font-sans">Dynamic Daily Wage</div>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-900 tabular-nums">₹{emp.monthlyFixedSalary?.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-slate-500"> / mo</span>
                            <div className="text-[10px] text-blue-600 font-sans">Fixed Monthly</div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        <div>UAN: <span className="text-slate-900 font-semibold">{emp.uanNumber}</span></div>
                        <div className="text-[10px] text-slate-400">PF: {emp.pfNumber.slice(-8)}</div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                          emp.status === 'On Leave' ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {emp.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenView(emp)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {hasPermission('employees', 'edit') && (
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                              title="Edit Details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('employees', 'delete') && (
                            <button
                              onClick={() => handleDelete(emp.id, emp.fullName)}
                              className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isEditMode ? 'Edit Employee Details' : 'Register New Industrial Employee'}
        subtitle="Complete statutory documentation & site deployment details"
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-6 text-xs">
          {/* Section 1: Personal Information */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <span>01. Personal Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Employee ID (Generated)</label>
                <input
                  type="text"
                  value={formData.empCode}
                  disabled
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded font-mono font-bold text-slate-700"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Full Name (As per Aadhaar) *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar Patel"
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Contact Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.contactNo}
                  onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="employee@adrokorba.com"
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                  })}
                  placeholder="Name"
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                  })}
                  placeholder="Phone"
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Employment & Deployment */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <span>02. Employment Details & Site Allocation</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Site Allocation *</label>
                <select
                  value={formData.siteId}
                  onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.siteCode} - {s.siteName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Skill Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value as EmployeeCategory;
                    let defaultRate = 680;
                    if (cat === 'Highly Skilled') defaultRate = 894;
                    else if (cat === 'Skilled') defaultRate = 824;
                    else if (cat === 'Semi-Skilled') defaultRate = 752;
                    setFormData({ ...formData, category: cat, dailyWageRate: defaultRate });
                  }}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                >
                  <option value="Highly Skilled">Highly Skilled</option>
                  <option value="Skilled">Skilled</option>
                  <option value="Semi-Skilled">Semi-Skilled</option>
                  <option value="Unskilled">Unskilled</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Department *</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Date of Joining *</label>
                <input
                  type="date"
                  required
                  value={formData.doj}
                  onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Employment Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Salary Type *</label>
                <select
                  value={formData.salaryType}
                  onChange={(e) => setFormData({ ...formData, salaryType: e.target.value as any })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                >
                  <option value="Dynamic Daily Wage">Dynamic Daily Wage (Hourly OT 2.0x)</option>
                  <option value="Fixed">Fixed Monthly Salary</option>
                </select>
              </div>
              {formData.salaryType === 'Dynamic Daily Wage' ? (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Daily Minimum Wage (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.dailyWageRate}
                    onChange={(e) => setFormData({ ...formData, dailyWageRate: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Fixed Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.monthlyFixedSalary}
                    onChange={(e) => setFormData({ ...formData, monthlyFixedSalary: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-600 font-medium mb-1">Contractor / Deployment Mode</label>
                <input
                  type="text"
                  value={formData.contractorName}
                  onChange={(e) => setFormData({ ...formData, contractorName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Statutory & Banking Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <span>03. Statutory Documents & Bank Transfer Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Aadhaar Number *</label>
                <input
                  type="text"
                  required
                  placeholder="XXXX XXXX XXXX"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">PAN Number *</label>
                <input
                  type="text"
                  required
                  placeholder="ABCDE1234F"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Universal Account Number (UAN) *</label>
                <input
                  type="text"
                  required
                  placeholder="100XXXXXXXXX"
                  value={formData.uanNumber}
                  onChange={(e) => setFormData({ ...formData, uanNumber: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">PF Number *</label>
                <input
                  type="text"
                  required
                  value={formData.pfNumber}
                  onChange={(e) => setFormData({ ...formData, pfNumber: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">ESIC IP Number *</label>
                <input
                  type="text"
                  required
                  value={formData.esicNumber}
                  onChange={(e) => setFormData({ ...formData, esicNumber: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Bank Account Number *</label>
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">IFSC Code *</label>
                <input
                  type="text"
                  required
                  placeholder="SBIN0000417"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500 font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Branch Name</label>
                <input
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {isEditMode ? 'Save Employee Changes' : 'Confirm Registration & Allocate Site'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Full Employee Profile Modal */}
      {activeEmployee && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Employee Dossier: ${activeEmployee.fullName}`}
          subtitle={`${activeEmployee.empCode} · ${activeEmployee.designation}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">{activeEmployee.fullName}</div>
                <div className="text-slate-400 font-mono">{activeEmployee.empCode} · {activeEmployee.category}</div>
                <div className="text-amber-400 mt-1">{activeEmployee.department}</div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  {activeEmployee.status}
                </span>
                <div className="text-slate-400 font-mono mt-1 text-[11px]">DOJ: {activeEmployee.doj}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-2">Statutory Identifiers</h5>
                <div className="space-y-1 text-slate-600 font-mono">
                  <div>Aadhaar: <strong className="text-slate-900">{activeEmployee.aadhaarNumber}</strong></div>
                  <div>PAN: <strong className="text-slate-900">{activeEmployee.panNumber}</strong></div>
                  <div>UAN: <strong className="text-slate-900">{activeEmployee.uanNumber}</strong></div>
                  <div>PF No: <strong className="text-slate-900">{activeEmployee.pfNumber}</strong></div>
                  <div>ESIC: <strong className="text-slate-900">{activeEmployee.esicNumber}</strong></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-2">Banking & Wage Details</h5>
                <div className="space-y-1 text-slate-600">
                  <div>Bank: <strong className="text-slate-900">{activeEmployee.bankName}</strong></div>
                  <div>A/C No: <strong className="text-slate-900 font-mono">{activeEmployee.accountNumber}</strong></div>
                  <div>IFSC: <strong className="text-slate-900 font-mono">{activeEmployee.ifscCode}</strong></div>
                  <div>Salary Type: <strong className="text-slate-900">{activeEmployee.salaryType}</strong></div>
                  <div>Base Daily Rate: <strong className="text-slate-900 font-mono">₹{activeEmployee.dailyWageRate || 'N/A'}/day</strong></div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h5 className="font-bold text-slate-900 mb-2">Emergency Contacts & Site Allocation</h5>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Site: <strong className="text-slate-900">{sites.find(s => s.id === activeEmployee.siteId)?.siteName}</strong></div>
                <div>Reporting Manager: <strong className="text-slate-900">{activeEmployee.reportingManager}</strong></div>
                <div>Emergency Contact: <strong className="text-slate-900">{activeEmployee.emergencyContact.name} ({activeEmployee.emergencyContact.relation})</strong></div>
                <div>Emergency Phone: <strong className="text-slate-900 font-mono">{activeEmployee.emergencyContact.phone}</strong></div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
