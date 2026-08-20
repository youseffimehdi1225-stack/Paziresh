import React, { useState } from 'react';
import { useApp, getRoleLabel } from '../../context/AppContext';
import { Specialist, User, UserRole, Appointment, SpecialistCategory } from '../../types';
import { toPersianDigits } from '../../utils/dateUtils';
import { DEPARTMENTS } from '../../data/mockData';
import { SpecialistScheduleManager } from './SpecialistScheduleManager';
import { EditSpecialistProfileModal } from '../common/EditSpecialistProfileModal';
import { LdapNetworkSettings } from './LdapNetworkSettings';
import { LdapNetworkMonitor } from './LdapNetworkMonitor';
import { AdminThemeSwitcher } from './AdminThemeSwitcher';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  Clock,
  Award, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  Stethoscope, 
  Brain, 
  Scale, 
  Scissors, 
  Apple,
  MapPin,
  Building2,
  Lock,
  Unlock,
  Sparkles,
  Sliders,
  Camera,
  Edit3,
  Server,
  Activity
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    users, 
    specialists, 
    appointments, 
    updateUserRole, 
    addSpecialist, 
    updateSpecialist,
    resetToDefaultData,
    showToast,
    adminTheme,
  } = useApp();

  const isDark = adminTheme === 'dark';

  const [activeTab, setActiveTab] = useState<'users' | 'specialists' | 'schedule_management' | 'all_appointments' | 'ldap_network' | 'ldap_monitor' | 'analytics'>('users');
  const [specialistToEditSchedule, setSpecialistToEditSchedule] = useState<string | null>(null);
  const [specialistToEditProfile, setSpecialistToEditProfile] = useState<Specialist | null>(null);

  // User Management filters & pagination
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Role Edit Modal State
  const [editingUserForRole, setEditingUserForRole] = useState<User | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState<UserRole>('employee');
  const [specFormTitle, setSpecFormTitle] = useState('');
  const [specFormCategory, setSpecFormCategory] = useState<SpecialistCategory>('medical');
  const [specFormRoom, setSpecFormRoom] = useState('');
  const [specFormSpecialty, setSpecFormSpecialty] = useState('');

  // Add/Edit Specialist Modal
  const [showAddSpecialistModal, setShowAddSpecialistModal] = useState(false);
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecTitle, setNewSpecTitle] = useState('');
  const [newSpecCategory, setNewSpecCategory] = useState<SpecialistCategory>('medical');
  const [newSpecSpecialty, setNewSpecSpecialty] = useState('');
  const [newSpecRoom, setNewSpecRoom] = useState('');
  const [newSpecBuilding, setNewSpecBuilding] = useState('ساختمان ستاد مرکزی مپنا');
  const [newSpecExt, setNewSpecExt] = useState('۴۲۰۰');

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.includes(userSearchQuery) ||
      u.personnelCode.includes(userSearchQuery) ||
      u.nationalId.includes(userSearchQuery) ||
      u.email.includes(userSearchQuery);

    const matchesDept = selectedDeptFilter === 'all' || u.department === selectedDeptFilter;
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;

    return matchesSearch && matchesDept && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Statistics
  const totalBookings = appointments.length;
  const completedBookings = appointments.filter((a) => a.status === 'completed').length;
  const noShowBookings = appointments.filter((a) => a.status === 'no_show').length;
  const activeBookings = appointments.filter((a) => a.status === 'confirmed' || a.status === 'in_progress').length;
  const noShowRate = totalBookings > 0 ? Math.round((noShowBookings / totalBookings) * 100) : 0;
  const attendanceRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

  const handleOpenRoleModal = (user: User) => {
    setEditingUserForRole(user);
    setNewSelectedRole(user.role);
    setSpecFormTitle(`متخصص ${getRoleLabel(user.role)}`);
    setSpecFormCategory(user.role === 'doctor' ? 'medical' : user.role === 'counselor' ? 'counseling' : user.role === 'lawyer' ? 'legal' : user.role === 'barber' ? 'barber' : 'nutrition');
    setSpecFormRoom('اتاق ۱۰۴ درمانگاه مرکزی');
    setSpecFormSpecialty('خدمات تخصصی سازمانی مپنا');
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserForRole) return;

    updateUserRole(editingUserForRole.id, newSelectedRole, {
      fullName: editingUserForRole.fullName,
      title: specFormTitle,
      category: specFormCategory,
      roomNumber: specFormRoom,
      specialty: specFormSpecialty,
    });

    setEditingUserForRole(null);
  };

  const handleCreateSpecialist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecName || !newSpecTitle || !newSpecRoom) {
      alert('لطفاً تمامی فیلدهای الزامی را پر نمایید.');
      return;
    }

    addSpecialist({
      fullName: newSpecName,
      title: newSpecTitle,
      category: newSpecCategory,
      specialty: newSpecSpecialty || 'خدمات تخصصی سازمانی',
      roomNumber: newSpecRoom,
      building: newSpecBuilding,
      bio: 'متخصص همکار گروه مپنا.',
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
      consultationDurationMinutes: 30,
      dailyCapacity: 10,
      rating: 5.0,
      reviewCount: 0,
      phoneExt: newSpecExt,
      workingDays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'],
      timeSlots: ['۰۸:۳۰ - ۰۹:۰۰', '۰۹:۰۰ - ۰۹:۳۰', '۱۰:۰۰ - ۱۰:۳۰', '۱۰:۳۰ - ۱۱:۰۰', '۱۳:۳۰ - ۱۴:۰۰', '۱۴:۰۰ - ۱۴:۳۰'],
    });

    setShowAddSpecialistModal(false);
    setNewSpecName('');
    setNewSpecTitle('');
  };

  return (
    <div className="space-y-6">
      
      {/* Bento Top Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Main Admin Hero Bento Tile (7 cols) */}
        <div className={`lg:col-span-7 rounded-2xl p-5 sm:p-6 border shadow-xs flex flex-col justify-between relative overflow-hidden transition-colors ${
          isDark ? 'bg-[#151921] border-[#252C38] text-slate-100' : 'bg-white border-[#E5E5E5] text-[#333333]'
        }`}>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[#CF2F2F] shrink-0 shadow-xs border ${
                isDark ? 'bg-[#1E2430] border-[#2D3542]' : 'bg-white border-[#E5E5E5]'
              }`}>
                <ShieldCheck className="w-6 h-6 text-[#CF2F2F]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#CF2F2F] text-white">
                    پنل مدیریت ارشد و منابع انسانی
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>گروه مپنا</span>
                </div>
                <h2 className={`text-lg sm:text-xl font-bold mt-1 ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                  داشبورد نظارت کلان، انضباط نوبت‌ها و انتصاب نقش‌ها
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                  مدیریت ۱۰۰۰ پرسنل ستاد و شرکت‌های تابعه، تنظیم متخصصین و تحلیل نرخ حضور و غیاب (No-Show)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* In-dashboard Theme Switcher */}
              <AdminThemeSwitcher variant="compact" />

              <button
                onClick={resetToDefaultData}
                title="بازنشانی پایگاه داده پیش‌فرض"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                  isDark
                    ? 'bg-[#1E2430] hover:bg-[#2A3242] text-slate-300 border-[#2D3542]'
                    : 'bg-[#F8F8F8] hover:bg-[#E5E5E5] text-[#6D6E70] hover:text-[#333333] border-[#E5E5E5]'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>بازنشانی داده‌ها</span>
              </button>
            </div>
          </div>

          <div className={`flex items-center gap-2 mt-5 pt-4 border-t text-xs ${
            isDark ? 'border-[#252C38] text-slate-400' : 'border-[#E5E5E5] text-[#6D6E70]'
          }`}>
            <Sparkles className="w-4 h-4 text-[#CF2F2F]" />
            <span>سامانه یکپارچه خدمات رفاهی پرسنلی با پایگاه ۱۰۰۰ کاربر فعال</span>
          </div>
        </div>

        {/* 4-Metric Bento Tiles Grid (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          
          <div className={`rounded-2xl p-4 border shadow-xs flex flex-col justify-between transition-colors ${
            isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
          }`}>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>کل کاربران سازمان</span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className={`text-xl sm:text-2xl font-bold font-mono ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                {toPersianDigits(users.length)}
              </strong>
              <Users className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`} />
            </div>
            <span className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>پرسنل ستاد و تابعه</span>
          </div>

          <div className={`rounded-2xl p-4 border shadow-xs flex flex-col justify-between transition-colors ${
            isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
          }`}>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>نرخ حضور موفق</span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className="text-xl sm:text-2xl font-bold font-mono text-emerald-500">
                {toPersianDigits(attendanceRate)}٪
              </strong>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-[10px] text-emerald-500 mt-1">{toPersianDigits(completedBookings)} ویزیت موفق</span>
          </div>

          <div className={`rounded-2xl p-4 border shadow-xs flex flex-col justify-between transition-colors ${
            isDark ? 'bg-rose-950/20 border-rose-900/40' : 'bg-[#FFF9F9] border-[#F5C2C2]'
          }`}>
            <span className="text-[11px] font-bold text-[#CF2F2F] block">نرخ عدم حضور (No-Show)</span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className="text-xl sm:text-2xl font-bold font-mono text-[#CF2F2F]">
                {toPersianDigits(noShowRate)}٪
              </strong>
              <UserX className="w-4 h-4 text-[#CF2F2F]" />
            </div>
            <span className="text-[10px] text-[#CF2F2F] mt-1">{toPersianDigits(noShowBookings)} مورد غیبت</span>
          </div>

          <div className={`rounded-2xl p-4 border shadow-xs flex flex-col justify-between transition-colors ${
            isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
          }`}>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>متخصصین فعال رفاهی</span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className="text-xl sm:text-2xl font-bold font-mono text-[#CF2F2F]">
                {toPersianDigits(specialists.length)}
              </strong>
              <Stethoscope className="w-4 h-4 text-[#CF2F2F]" />
            </div>
            <span className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>پزشک، مشاور، وکیل، آرایشگر</span>
          </div>

        </div>

      </div>

      {/* Admin Tabs Bento Bar */}
      <div className={`flex items-center gap-2 p-3 rounded-2xl border shadow-xs overflow-x-auto text-xs sm:text-sm font-semibold transition-colors ${
        isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
      }`}>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#CF2F2F] text-white shadow-xs font-bold'
              : isDark ? 'text-slate-400 hover:bg-[#1E2430] hover:text-slate-200' : 'text-[#6D6E70] hover:bg-[#F8F8F8]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>مدیریت کاربران و انتصاب نقش‌ها ({toPersianDigits(users.length)})</span>
        </button>

        <button
          onClick={() => {
            setSpecialistToEditSchedule(null);
            setActiveTab('specialists');
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'specialists'
              ? 'bg-[#CF2F2F] text-white shadow-xs font-bold'
              : isDark ? 'text-slate-400 hover:bg-[#1E2430] hover:text-slate-200' : 'text-[#6D6E70] hover:bg-[#F8F8F8]'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>تنظیمات متخصصین و اتاق‌ها ({toPersianDigits(specialists.length)})</span>
        </button>

        <button
          onClick={() => {
            setSpecialistToEditSchedule(null);
            setActiveTab('schedule_management');
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'schedule_management'
              ? 'bg-[#CF2F2F] text-white shadow-xs font-bold'
              : isDark ? 'text-slate-400 hover:bg-[#1E2430] hover:text-slate-200' : 'text-[#6D6E70] hover:bg-[#F8F8F8]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>برنامه حضور و تقویم کاری متخصصان</span>
        </button>

        <button
          onClick={() => setActiveTab('all_appointments')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'all_appointments'
              ? 'bg-[#CF2F2F] text-white shadow-xs font-bold'
              : isDark ? 'text-slate-400 hover:bg-[#1E2430] hover:text-slate-200' : 'text-[#6D6E70] hover:bg-[#F8F8F8]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>دفتر کل نوبت‌های سازمان ({toPersianDigits(appointments.length)})</span>
        </button>

        <button
          id="tab-admin-ldap-network"
          onClick={() => setActiveTab('ldap_network')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ldap_network'
              ? 'bg-[#CF2F2F] text-white shadow-xs font-bold'
              : isDark ? 'text-slate-400 hover:bg-[#1E2430] hover:text-slate-200' : 'text-[#6D6E70] hover:bg-[#F8F8F8]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>تنظیمات سرور LDAP و شبکه سازمانی</span>
        </button>

        <button
          id="tab-admin-ldap-monitor"
          onClick={() => setActiveTab('ldap_monitor')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ldap_monitor'
              ? 'bg-[#CF2F2F] text-white shadow-xs font-bold'
              : isDark ? 'text-slate-400 hover:bg-[#1E2430] hover:text-slate-200' : 'text-[#6D6E70] hover:bg-[#F8F8F8]'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>مانیتورینگ زنده سلامت شبکه (Recharts)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* TAB 1: USERS & ROLE ASSIGNMENT TABLE */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className={`p-4 rounded-2xl border flex flex-col lg:flex-row items-center justify-between gap-3 shadow-xs transition-colors ${
            isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
          }`}>
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className={`w-4 h-4 absolute right-3.5 top-3 ${isDark ? 'text-slate-500' : 'text-[#6D6E70]'}`} />
              <input
                type="text"
                placeholder="جستجو در بین ۱۰۰۰ کاربر بر اساس نام، کد پرسنلی، کد ملی یا ایمیل..."
                value={userSearchQuery}
                onChange={(e) => {
                  setUserSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full text-xs pr-10 pl-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] focus:border-[#CF2F2F] transition-colors ${
                  isDark
                    ? 'bg-[#1C222D] border-[#2D3542] text-slate-100 placeholder-slate-500'
                    : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333] focus:bg-white'
                }`}
              />
            </div>

            {/* Department Dropdown Filter */}
            <div className="w-full lg:w-64">
              <select
                value={selectedDeptFilter}
                onChange={(e) => {
                  setSelectedDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] focus:border-[#CF2F2F] transition-colors ${
                  isDark
                    ? 'bg-[#1C222D] border-[#2D3542] text-slate-200'
                    : 'bg-white border-[#E5E5E5] text-[#333333]'
                }`}
              >
                <option value="all">همه شرکت‌ها و بخش‌های مپنا</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Dropdown Filter */}
            <div className="w-full lg:w-44">
              <select
                value={selectedRoleFilter}
                onChange={(e) => {
                  setSelectedRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] focus:border-[#CF2F2F] transition-colors ${
                  isDark
                    ? 'bg-[#1C222D] border-[#2D3542] text-slate-200'
                    : 'bg-white border-[#E5E5E5] text-[#333333]'
                }`}
              >
                <option value="all">همه نقش‌ها</option>
                <option value="employee">کارمند عادی</option>
                <option value="doctor">پزشک معتمد</option>
                <option value="counselor">مشاور روانشناسی</option>
                <option value="lawyer">مشاور حقوقی / وکیل</option>
                <option value="barber">پیرایشگر</option>
                <option value="nutritionist">کارشناس تغذیه</option>
                <option value="admin">مدیر سیستم (Admin)</option>
              </select>
            </div>

          </div>

          {/* Users Table */}
          <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
            isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
          }`}>
            <div className="overflow-x-auto">
              <table className={`w-full text-right text-xs ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                <thead className={`font-bold border-b transition-colors ${
                  isDark ? 'bg-[#1C222D] text-slate-200 border-[#252C38]' : 'bg-[#F8F8F8] text-[#333333] border-[#E5E5E5]'
                }`}>
                  <tr>
                    <th className="p-3.5">نام و نام خانوادگی</th>
                    <th className="p-3.5">کد پرسنلی</th>
                    <th className="p-3.5">بخش / شرکت مپنا</th>
                    <th className="p-3.5">نقش فعلی در سامانه</th>
                    <th className="p-3.5 text-center">امتیاز خوش‌قولی</th>
                    <th className="p-3.5 text-center">تعداد غیبت</th>
                    <th className="p-3.5">وضعیت حساب</th>
                    <th className="p-3.5 text-center">عملیات نقش</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${isDark ? 'divide-[#252C38]' : 'divide-[#E5E5E5]'}`}>
                  {paginatedUsers.map((u) => {
                    return (
                      <tr key={u.id} className={`transition-colors ${
                        isDark ? 'hover:bg-[#1C222D]' : 'hover:bg-[#F8F8F8]'
                      }`}>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatarUrl}
                              alt={u.fullName}
                              className={`w-8 h-8 rounded-lg object-cover border ${
                                isDark ? 'border-[#2D3542]' : 'border-[#E5E5E5]'
                              }`}
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className={`font-bold block ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>{u.fullName}</span>
                              <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>{u.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className={`p-3.5 font-mono font-bold ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                          {toPersianDigits(u.personnelCode)}
                        </td>

                        <td className={`p-3.5 max-w-[180px] truncate ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                          {u.department}
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1 ${
                              u.role === 'admin'
                                ? isDark ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60' : 'bg-[#FDF2F2] text-[#CF2F2F] border border-[#F5C2C2]'
                                : u.role === 'doctor'
                                ? isDark ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : u.role === 'counselor'
                                ? isDark ? 'bg-[#1E2430] text-slate-300 border border-[#2D3542]' : 'bg-[#F8F8F8] text-[#333333] border border-[#E5E5E5]'
                                : u.role === 'lawyer'
                                ? isDark ? 'bg-[#1E2430] text-slate-300 border border-[#2D3542]' : 'bg-[#F8F8F8] text-[#333333] border border-[#E5E5E5]'
                                : u.role === 'barber'
                                ? isDark ? 'bg-[#1E2430] text-slate-300 border border-[#2D3542]' : 'bg-[#F8F8F8] text-[#333333] border border-[#E5E5E5]'
                                : isDark ? 'bg-[#1C222D] text-slate-400' : 'bg-[#F8F8F8] text-[#6D6E70]'
                            }`}
                          >
                            {getRoleLabel(u.role)}
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <span className={`font-mono font-bold ${
                            u.attendanceScore >= 80 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') :
                            u.attendanceScore >= 50 ? 'text-amber-500' : 'text-[#CF2F2F]'
                          }`}>
                            {toPersianDigits(u.attendanceScore)}٪
                          </span>
                        </td>

                        <td className="p-3.5 text-center font-mono">
                          {u.noShowCount > 0 ? (
                            <span className={`font-bold px-2 py-0.5 rounded border ${
                              isDark ? 'bg-rose-950/40 text-rose-300 border-rose-800/60' : 'bg-[#FDF2F2] text-[#CF2F2F] border-[#F5C2C2]'
                            }`}>
                              {toPersianDigits(u.noShowCount)} غیبت
                            </span>
                          ) : (
                            <span className={isDark ? 'text-slate-500' : 'text-[#6D6E70]'}>۰</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {u.isBlockedForNoShow ? (
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1 ${
                              isDark ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60' : 'bg-[#FDF2F2] text-[#CF2F2F]'
                            }`}>
                              <Lock className="w-3 h-3 text-[#CF2F2F]" />
                              مسدود (۳ غیبت)
                            </span>
                          ) : (
                            <span className={`text-[11px] font-medium flex items-center gap-1 ${
                              isDark ? 'text-emerald-400' : 'text-emerald-700'
                            }`}>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              فعال
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleOpenRoleModal(u)}
                            className={`px-3 py-1 rounded-lg font-semibold text-[11px] border transition-colors inline-flex items-center gap-1 cursor-pointer ${
                              isDark
                                ? 'bg-[#1E2430] hover:bg-[#CF2F2F] text-slate-200 hover:text-white border-[#2D3542]'
                                : 'bg-white hover:bg-[#CF2F2F] hover:text-white text-[#333333] border-[#E5E5E5]'
                            }`}
                          >
                            <Edit className="w-3 h-3" />
                            <span>تغییر نقش</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className={`p-3.5 border-t flex items-center justify-between text-xs transition-colors ${
              isDark ? 'bg-[#1C222D] border-[#252C38]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
            }`}>
              <span className={isDark ? 'text-slate-400' : 'text-[#6D6E70]'}>
                نمایش صفحه {toPersianDigits(currentPage)} از {toPersianDigits(totalPages)} (مجموع: {toPersianDigits(filteredUsers.length)} کاربر)
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={`px-3 py-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors ${
                    isDark
                      ? 'bg-[#151921] border-[#2D3542] text-slate-200 hover:bg-[#252C38]'
                      : 'bg-white border-[#E5E5E5] text-[#333333] hover:bg-gray-50'
                  }`}
                >
                  صفحه قبل
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={`px-3 py-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors ${
                    isDark
                      ? 'bg-[#151921] border-[#2D3542] text-slate-200 hover:bg-[#252C38]'
                      : 'bg-white border-[#E5E5E5] text-[#333333] hover:bg-gray-50'
                  }`}
                >
                  صفحه بعد
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: SPECIALISTS MANAGEMENT */}
      {activeTab === 'specialists' && (
        <div className="space-y-4">
          <div className={`flex items-center justify-between p-4 rounded-2xl border shadow-xs transition-colors ${
            isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
          }`}>
            <div>
              <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                لیست متخصصین سلامت، حقوقی و رفاهی مپنا
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                تعیین پزشکان، مشاوران، آرایشگر، اتاق‌های استقرار و بازه‌های زمانی ویزیت
              </p>
            </div>

            <button
              onClick={() => setShowAddSpecialistModal(true)}
              className="px-4 py-2 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن متخصص جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialists.map((spec) => (
              <div key={spec.id} className={`rounded-2xl border p-5 shadow-xs space-y-3 transition-colors ${
                isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
              }`}>
                <div className="flex items-start gap-3">
                  <img
                    src={spec.avatarUrl}
                    alt={spec.fullName}
                    className={`w-14 h-14 rounded-xl object-cover border ${
                      isDark ? 'border-[#2D3542]' : 'border-[#E5E5E5]'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className={`font-bold text-base ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>{spec.fullName}</h4>
                    <p className="text-xs text-[#CF2F2F] font-semibold">{spec.title}</p>
                    <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>{spec.specialty}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl space-y-1.5 text-xs border ${
                  isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-300' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#6D6E70]'
                }`}>
                  <div>
                    <span className={isDark ? 'text-slate-400' : 'text-[#6D6E70]'}>محل استقرار:</span>{' '}
                    <strong className={isDark ? 'text-slate-100' : 'text-[#333333]'}>{spec.roomNumber} ({spec.building})</strong>
                  </div>
                  <div>
                    <span className={isDark ? 'text-slate-400' : 'text-[#6D6E70]'}>روزهای حضور:</span>{' '}
                    <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>{spec.workingDays.join('، ')}</span>
                  </div>
                  <div>
                    <span className={isDark ? 'text-slate-400' : 'text-[#6D6E70]'}>مدت هر نوبت:</span>{' '}
                    <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>{toPersianDigits(spec.consultationDurationMinutes)} دقیقه</span>
                  </div>
                  <div>
                    <span className={isDark ? 'text-slate-400' : 'text-[#6D6E70]'}>شماره تلفن داخلی:</span>{' '}
                    <span className={`font-mono font-bold ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>{toPersianDigits(spec.phoneExt)}</span>
                  </div>
                </div>

                <div className={`pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
                  isDark ? 'border-[#252C38]' : 'border-[#E5E5E5]'
                }`}>
                  <button
                    type="button"
                    onClick={() => setSpecialistToEditProfile(spec)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-colors flex items-center gap-1 cursor-pointer ${
                      isDark
                        ? 'bg-[#1C222D] hover:bg-[#252C38] text-slate-200 border-[#2D3542]'
                        : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#333333] border-[#E5E5E5]'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#CF2F2F]" />
                    <span>ویرایش اطلاعات و عکس</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSpecialistToEditSchedule(spec.id);
                      setActiveTab('schedule_management');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-colors flex items-center gap-1 cursor-pointer ${
                      isDark
                        ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60'
                        : 'bg-rose-50 hover:bg-rose-100 text-[#CF2F2F] border-rose-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>تنظیم روزهای حضور</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: SPECIALIST SCHEDULE AND ATTENDANCE MANAGER */}
      {activeTab === 'schedule_management' && (
        <SpecialistScheduleManager
          specialistIdToEdit={specialistToEditSchedule}
        />
      )}

      {/* TAB 3: ALL APPOINTMENTS MASTER LOG */}
      {activeTab === 'all_appointments' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs transition-colors ${
            isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
          }`}>
            <div>
              <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                دفتر کل نوبت‌های رزرو شده در سراسر سازمان
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                پایش لحظه‌ای نوبت‌های انجام‌شده، در صف، و غیبت‌های پرسنل
              </p>
            </div>

            <button
              onClick={() => {
                showToast('گزارش نوبت‌ها در قالب فایل خروجی اکسل آماده‌سازی شد.', 'success');
              }}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#1C222D] hover:bg-[#252C38] text-slate-200 border-[#2D3542]'
                  : 'bg-white hover:bg-[#F8F8F8] text-[#333333] border-[#E5E5E5]'
              }`}
            >
              <Download className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`} />
              <span>خروجی اکسل / CSV</span>
            </button>
          </div>

          <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
            isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
          }`}>
            <div className="overflow-x-auto">
              <table className={`w-full text-right text-xs ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                <thead className={`font-bold border-b transition-colors ${
                  isDark ? 'bg-[#1C222D] text-slate-200 border-[#252C38]' : 'bg-[#F8F8F8] text-[#333333] border-[#E5E5E5]'
                }`}>
                  <tr>
                    <th className="p-3.5">کد رهگیری</th>
                    <th className="p-3.5">نام کارمند</th>
                    <th className="p-3.5">کد پرسنلی</th>
                    <th className="p-3.5">بخش سازمانی</th>
                    <th className="p-3.5">متخصص</th>
                    <th className="p-3.5">تاریخ و ساعت</th>
                    <th className="p-3.5">وضعیت نوبت</th>
                    <th className="p-3.5">ثبت نتیجه / علت مراجعه</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${isDark ? 'divide-[#252C38]' : 'divide-[#E5E5E5]'}`}>
                  {appointments.map((a) => (
                    <tr key={a.id} className={`transition-colors ${
                      isDark ? 'hover:bg-[#1C222D]' : 'hover:bg-[#F8F8F8]'
                    }`}>
                      <td className={`p-3.5 font-mono font-bold ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>{a.trackingCode}</td>
                      <td className={`p-3.5 font-semibold ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>{a.userName}</td>
                      <td className={`p-3.5 font-mono ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>{toPersianDigits(a.userPersonnelCode)}</td>
                      <td className={`p-3.5 max-w-[150px] truncate ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>{a.userDepartment}</td>
                      <td className={`p-3.5 font-medium ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>{a.specialistName}</td>
                      <td className="p-3.5">
                        <span className={isDark ? 'text-slate-200' : 'text-[#333333]'}>{a.dateShamsi}</span>
                        <span className={`block text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>{toPersianDigits(a.timeSlot)}</span>
                      </td>
                      <td className="p-3.5">
                        {a.status === 'completed' && (
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                            isDark ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            انجام شد
                          </span>
                        )}
                        {a.status === 'no_show' && (
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                            isDark ? 'bg-rose-950/40 text-rose-300 border-rose-800/60' : 'bg-[#FDF2F2] text-[#CF2F2F] border-[#F5C2C2]'
                          }`}>
                            غیبت (No-Show)
                          </span>
                        )}
                        {a.status === 'in_progress' && (
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                            isDark ? 'bg-amber-950/40 text-amber-300 border-amber-800/60' : 'bg-[#F8F8F8] text-[#CF2F2F] border-[#E5E5E5]'
                          }`}>
                            در حال ویزیت
                          </span>
                        )}
                        {a.status === 'confirmed' && (
                          <span className={`px-2 py-0.5 rounded-md font-medium text-[10px] border ${
                            isDark ? 'bg-[#1C222D] text-slate-300 border-[#2D3542]' : 'bg-[#F8F8F8] text-[#333333] border-[#E5E5E5]'
                          }`}>
                            تایید شده
                          </span>
                        )}
                        {a.status === 'cancelled' && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] border ${
                            isDark ? 'bg-[#1C222D] text-slate-400 border-[#2D3542]' : 'bg-[#F8F8F8] text-[#6D6E70] border-[#E5E5E5]'
                          }`}>
                            لغو شده
                          </span>
                        )}
                      </td>
                      <td className={`p-3.5 max-w-[200px] truncate ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                        {a.sessionResult?.diagnosisOrSummary || a.userReason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: LDAP SERVER & NETWORK CONFIGURATION */}
      {activeTab === 'ldap_network' && (
        <LdapNetworkSettings />
      )}

      {/* TAB: REAL-TIME LDAP & NETWORK MONITOR */}
      {activeTab === 'ldap_monitor' && (
        <LdapNetworkMonitor />
      )}

      {/* ROLE EDIT MODAL */}
      {editingUserForRole && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border text-right animate-scale-up ${
            isDark ? 'bg-[#151921] border-[#2D3542] text-slate-100' : 'bg-white border-[#E5E5E5] text-[#333333]'
          }`}>
            <div className={`p-5 border-b flex items-center justify-between ${
              isDark ? 'bg-[#1C222D] border-[#2D3542]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
            }`}>
              <div>
                <h3 className={`font-bold text-base ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                  تغییر و انتصاب نقش کاربر سازمانی
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                  {editingUserForRole.fullName} (کد: {toPersianDigits(editingUserForRole.personnelCode)})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className={`block font-bold ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>انتخاب نقش جدید:</label>
                <select
                  value={newSelectedRole}
                  onChange={(e) => setNewSelectedRole(e.target.value as UserRole)}
                  className={`w-full p-2.5 rounded-xl border font-medium focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] focus:border-[#CF2F2F] ${
                    isDark
                      ? 'bg-[#1C222D] border-[#2D3542] text-slate-100'
                      : 'bg-white border-[#E5E5E5] text-[#333333]'
                  }`}
                >
                  <option value="employee">کارمند عادی (رزرو نوبت)</option>
                  <option value="doctor">پزشک سازمانی (طب کار / بهداری)</option>
                  <option value="counselor">مشاور روانشناسی و سلامت روان</option>
                  <option value="lawyer">مشاور امور حقوقی و قراردادها</option>
                  <option value="barber">پیرایشگر سالن رفاهی</option>
                  <option value="nutritionist">کارشناس تغذیه و رژیم‌درمانی</option>
                  <option value="admin">مدیر ارشد و منابع انسانی (Admin)</option>
                </select>
              </div>

              {/* If specialist role selected: show extra fields */}
              {['doctor', 'counselor', 'lawyer', 'barber', 'nutritionist'].includes(newSelectedRole) && (
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-[#1C222D] border-[#2D3542]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
                }`}>
                  <span className={`font-bold block text-xs ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                    اطلاعات تکمیلی جهت نمایش در لیست متخصصان:
                  </span>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>عنوان تخصصی:</label>
                    <input
                      type="text"
                      value={specFormTitle}
                      onChange={(e) => setSpecFormTitle(e.target.value)}
                      placeholder="مثال: متخصص طب کار و سلامت شغلی..."
                      className={`w-full text-xs p-2 rounded-lg border focus:outline-none focus:border-[#CF2F2F] ${
                        isDark
                          ? 'bg-[#151921] border-[#2D3542] text-slate-100 placeholder-slate-500'
                          : 'bg-white border-[#E5E5E5] text-[#333333]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>اتاق و محل استقرار:</label>
                    <input
                      type="text"
                      value={specFormRoom}
                      onChange={(e) => setSpecFormRoom(e.target.value)}
                      placeholder="مثال: اتاق ۱۰۴ درمانگاه مرکزی..."
                      className={`w-full text-xs p-2 rounded-lg border focus:outline-none focus:border-[#CF2F2F] ${
                        isDark
                          ? 'bg-[#151921] border-[#2D3542] text-slate-100 placeholder-slate-500'
                          : 'bg-white border-[#E5E5E5] text-[#333333]'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div className={`pt-3 border-t flex items-center justify-end gap-2 ${
                isDark ? 'border-[#2D3542]' : 'border-[#E5E5E5]'
              }`}>
                <button
                  type="button"
                  onClick={() => setEditingUserForRole(null)}
                  className={`px-4 py-2 rounded-xl border font-medium cursor-pointer ${
                    isDark
                      ? 'border-[#2D3542] text-slate-400 hover:bg-[#1C222D] hover:text-slate-200'
                      : 'border-[#E5E5E5] text-[#6D6E70] hover:bg-[#F8F8F8]'
                  }`}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white font-bold shadow-xs cursor-pointer"
                >
                  ذخیره و اعمال دسترسی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SPECIALIST MODAL */}
      {showAddSpecialistModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border text-right animate-scale-up ${
            isDark ? 'bg-[#151921] border-[#2D3542] text-slate-100' : 'bg-white border-[#E5E5E5] text-[#333333]'
          }`}>
            <div className={`p-5 border-b ${isDark ? 'bg-[#1C222D] border-[#2D3542]' : 'bg-[#F8F8F8] border-[#E5E5E5]'}`}>
              <h3 className={`font-bold text-base ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                تعریف متخصص رفاهی و درمانی جدید
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                افزودن به لیست پذیرش نوبت‌های سازمان مپنا
              </p>
            </div>

            <form onSubmit={handleCreateSpecialist} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>نام و نام خانوادگی متخصص: *</label>
                <input
                  type="text"
                  required
                  value={newSpecName}
                  onChange={(e) => setNewSpecName(e.target.value)}
                  placeholder="مثال: دکتر مهدی کیانی..."
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#CF2F2F] ${
                    isDark
                      ? 'bg-[#1C222D] border-[#2D3542] text-slate-100 placeholder-slate-500'
                      : 'bg-white border-[#E5E5E5] text-[#333333]'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>دسته خدمت: *</label>
                <select
                  value={newSpecCategory}
                  onChange={(e) => setNewSpecCategory(e.target.value as SpecialistCategory)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#CF2F2F] ${
                    isDark
                      ? 'bg-[#1C222D] border-[#2D3542] text-slate-100'
                      : 'bg-white border-[#E5E5E5] text-[#333333]'
                  }`}
                >
                  <option value="medical">پزشکی و طب کار</option>
                  <option value="counseling">مشاوره روانشناسی</option>
                  <option value="legal">مشاوره حقوقی</option>
                  <option value="barber">پیرایش و آراستگی</option>
                  <option value="nutrition">تغذیه و سلامت</option>
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>عنوان و سمت: *</label>
                <input
                  type="text"
                  required
                  value={newSpecTitle}
                  onChange={(e) => setNewSpecTitle(e.target.value)}
                  placeholder="مثال: پزشک عمومی و معاینات شغلی..."
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#CF2F2F] ${
                    isDark
                      ? 'bg-[#1C222D] border-[#2D3542] text-slate-100 placeholder-slate-500'
                      : 'bg-white border-[#E5E5E5] text-[#333333]'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>شماره اتاق و ساختمان: *</label>
                <input
                  type="text"
                  required
                  value={newSpecRoom}
                  onChange={(e) => setNewSpecRoom(e.target.value)}
                  placeholder="مثال: اتاق ۱۰۲ درمانگاه ستاد..."
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#CF2F2F] ${
                    isDark
                      ? 'bg-[#1C222D] border-[#2D3542] text-slate-100 placeholder-slate-500'
                      : 'bg-white border-[#E5E5E5] text-[#333333]'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>شماره تلفن داخلی مپنا:</label>
                <input
                  type="text"
                  value={newSpecExt}
                  onChange={(e) => setNewSpecExt(e.target.value)}
                  placeholder="۴۲۰۰"
                  className={`w-full p-2.5 rounded-xl border font-mono focus:outline-none focus:border-[#CF2F2F] ${
                    isDark
                      ? 'bg-[#1C222D] border-[#2D3542] text-slate-100 placeholder-slate-500'
                      : 'bg-white border-[#E5E5E5] text-[#333333]'
                  }`}
                />
              </div>

              <div className={`pt-3 border-t flex items-center justify-end gap-2 ${
                isDark ? 'border-[#2D3542]' : 'border-[#E5E5E5]'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowAddSpecialistModal(false)}
                  className={`px-4 py-2 rounded-xl border font-medium cursor-pointer ${
                    isDark
                      ? 'border-[#2D3542] text-slate-400 hover:bg-[#1C222D] hover:text-slate-200'
                      : 'border-[#E5E5E5] text-[#6D6E70] hover:bg-[#F8F8F8]'
                  }`}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white font-bold shadow-xs cursor-pointer"
                >
                  ثبت متخصص
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SPECIALIST FULL PROFILE & PHOTO MODAL */}
      {specialistToEditProfile && (
        <EditSpecialistProfileModal
          specialist={specialistToEditProfile}
          onClose={() => setSpecialistToEditProfile(null)}
          onSaved={(updated) => {
            setSpecialistToEditProfile(null);
          }}
        />
      )}

    </div>
  );
};
