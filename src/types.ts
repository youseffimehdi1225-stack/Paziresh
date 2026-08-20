export type UserRole = 
  | 'employee'      // کارمند / کاربر عادی
  | 'doctor'        // پزشک سازمانی
  | 'counselor'     // مشاور روانشناسی و شغلی
  | 'lawyer'        // وکیل و مشاور حقوقی
  | 'barber'        // آرایشگر و پیرایشگر
  | 'nutritionist'  // کارشناس تغذیه و سلامت
  | 'admin';        // مدیر سیستم / منابع انسانی

export type SpecialistCategory = 'medical' | 'counseling' | 'legal' | 'barber' | 'nutrition';

export type AppointmentStatus = 
  | 'pending'       // در انتظار تایید / رزرو شده
  | 'confirmed'     // تایید شده
  | 'in_progress'   // در حال ویزیت/مشاوره
  | 'completed'     // انجام شده و حاضر (ویزیت انجام شد)
  | 'no_show'       // عدم حضور و غیبت (بدون اطلاع)
  | 'cancelled';    // لغو شده (توسط کاربر یا متخصص)

export interface User {
  id: string;
  fullName: string;
  personnelCode: string;
  nationalId: string;
  department: string;
  role: UserRole;
  email: string;
  phone: string;
  avatarUrl: string;
  attendanceScore: number; // 0 to 100 (امتیاز خوش‌قولی و تعهد به نوبت‌ها)
  noShowCount: number;     // تعداد دفعات عدم حضور
  totalBookings: number;
  isBlockedForNoShow: boolean; // در صورت بیش از ۳ بار غیبت
  specialistId?: string;   // اگر این کاربر متخصص باشد
}

export interface Specialist {
  id: string;
  userId?: string;
  fullName: string;
  title: string;
  category: SpecialistCategory;
  specialty: string;
  roomNumber: string;
  building: string;
  bio: string;
  avatarUrl: string;
  consultationDurationMinutes: number;
  dailyCapacity: number;
  rating: number;
  reviewCount: number;
  phoneExt: string;
  workingDays: string[]; // e.g. ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه']
  timeSlots: string[];   // e.g. ['08:30 - 08:50', '08:50 - 09:10', ...]
  workHoursStart?: string; // e.g. '08:30'
  workHoursEnd?: string;   // e.g. '15:00'
  breakStart?: string;     // e.g. '12:00'
  breakEnd?: string;       // e.g. '13:00'
  leaveDates?: string[];   // ISO dates of absence e.g. ['2026-08-28']
  isAvailable?: boolean;   // Active presence status
}

export interface SessionResult {
  diagnosisOrSummary: string;     // خلاصه شرح حال / نتیجه جلسه / اقدام انجام شده
  recommendations: string;        // توصیه‌ها و مراقبت‌های لازم برای کارمند
  prescriptionOrAction?: string;  // نسخه دارویی / ارجاع / بندهای حقوقی / خدمات پیرایش
  followUpDate?: string;          // تاریخ مراجعه بعدی در صورت نیاز
  privateNotes?: string;          // یادداشت محرمانه پزشک/مشاور (غیرقابل مشاهده برای کارمند)
  recordedAt: string;
  attended: boolean;
}

export interface Appointment {
  id: string;
  trackingCode: string;           // کد رهگیری نوبت (e.g. MP-8492)
  userId: string;
  userName: string;
  userPersonnelCode: string;
  userDepartment: string;
  userPhone: string;
  specialistId: string;
  specialistName: string;
  specialistCategory: SpecialistCategory;
  specialistRoom: string;
  dateShamsi: string;             // تاریخ شمسی e.g. "۱۴۰۳/۰۶/۰۵" یا "دوشنبه ۵ شهریور"
  dateISO: string;                // YYYY-MM-DD
  timeSlot: string;               // e.g. "09:30 - 10:00"
  status: AppointmentStatus;
  userReason: string;             // علت مراجعه یا نیاز کارمند
  sessionResult?: SessionResult;  // نتیجه ثبت شده توسط دکتر/مشاور/وکیل
  cancellationReason?: string;
  penaltyApplied?: boolean;       // اعمال کسر امتیاز غیبت
  createdAt: string;
  updatedAt: string;
}

export interface CategoryMeta {
  id: SpecialistCategory;
  title: string;
  description: string;
  iconName: string;
  badgeColor: string;
  colorClass: string;
  bgLight: string;
}

export interface LdapConfig {
  enabled: boolean;
  serverHost: string;
  port: number;
  protocol: 'ldap' | 'ldaps' | 'starttls';
  baseDn: string;
  userSearchBase: string;
  bindDn: string;
  bindPassword: string;
  userFilter: string;
  mailAttribute: string;
  fullNameAttribute: string;
  personnelCodeAttribute: string;
  departmentAttribute: string;
  phoneAttribute: string;
  nationalIdAttribute: string;
  connectionTimeoutMs: number;
  sslValidation: 'strict' | 'corporate_ca' | 'skip';
  proxyUrl?: string;
  dnsServers: string[];
  fallbackLocalAuth: boolean;
  syncSchedule: 'realtime' | 'hourly' | 'daily' | 'manual';
  autoCreateUsers: boolean;
  defaultRole: UserRole;
  allowedIpRanges?: string;
  enableSso: boolean;
  lastSyncTime?: string;
  lastTestStatus?: 'success' | 'failed' | 'idle';
  lastTestLatency?: number;
  lastTestMessage?: string;
}

export interface LdapLogEntry {
  id: string;
  timestamp: string;
  type: 'auth_success' | 'auth_failed' | 'sync' | 'test' | 'config_update';
  username?: string;
  ipAddress: string;
  message: string;
  details?: string;
  status: 'ok' | 'error' | 'warn';
}

