import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appointment, AppointmentStatus, SessionResult, Specialist, User, UserRole } from '../types';
import { INITIAL_APPOINTMENTS, INITIAL_SPECIALISTS, generateCompanyUsers } from '../data/mockData';

interface BookAppointmentInput {
  specialistId: string;
  dateShamsi: string;
  dateISO: string;
  timeSlot: string;
  userReason: string;
}

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  authLoading: boolean;
  loginLocal: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  setCurrentUser: (user: User) => void;
  users: User[];
  specialists: Specialist[];
  appointments: Appointment[];
  activeView: 'employee' | 'specialist' | 'admin';
  setActiveView: (view: 'employee' | 'specialist' | 'admin') => void;
  
  // Appointment Actions
  bookAppointment: (input: BookAppointmentInput) => Promise<{ success: boolean; message: string; appointment?: Appointment }>;
  cancelAppointment: (appointmentId: string, reason: string) => { success: boolean; message: string };
  recordSessionResult: (appointmentId: string, result: SessionResult, isNoShow: boolean) => { success: boolean; message: string };
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  
  // Admin & Specialist Actions
  updateUserRole: (userId: string, newRole: UserRole, specialistDetails?: Partial<Specialist>) => void;
  updateSpecialist: (specialist: Specialist) => void;
  addSpecialist: (specialist: Omit<Specialist, 'id'>) => void;
  resetToDefaultData: () => void;
  
  // Notification Toast State
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  // Selected Specialist for quick booking modal
  selectedSpecialistForBooking: Specialist | null;
  setSelectedSpecialistForBooking: (specialist: Specialist | null) => void;

  // Universal Dark / Light Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isDark: boolean;

  // Backward-compatible Admin Dark / Light Theme aliases
  adminTheme: 'light' | 'dark';
  setAdminTheme: (theme: 'light' | 'dark') => void;
  toggleAdminTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'mapna_res_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isProduction = import.meta.env.PROD;
  // Global Theme state (persisted across reloads for all views)
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}theme`) || localStorage.getItem(`${LOCAL_STORAGE_PREFIX}admin_theme`);
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}theme`, newTheme);
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_theme`, newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Aliases for adminTheme
  const adminTheme = theme;
  const setAdminTheme = setTheme;
  const toggleAdminTheme = toggleTheme;
  const isDark = theme === 'dark';
  // Initialize Users from LocalStorage or generate
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}users`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return generateCompanyUsers();
  });

  // Current Logged in User (Default: Rad Shahbazi - Employee)
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}current_user`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return users.find((u) => u.id === 'user-emp-1') || users[1] || users[0];
  });

  // Specialists
  const [specialists, setSpecialists] = useState<Specialist[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}specialists`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SPECIALISTS;
  });

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}appointments`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_APPOINTMENTS;
  });

  const [activeView, setActiveView] = useState<'employee' | 'specialist' | 'admin'>('employee');
  const [authReady, setAuthReady] = useState(!isProduction);
  const [isAuthenticated, setIsAuthenticated] = useState(!isProduction);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedSpecialistForBooking, setSelectedSpecialistForBooking] = useState<Specialist | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}specialists`, JSON.stringify(specialists));
  }, [specialists]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}appointments`, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}current_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const hideToast = () => {
    setToastMessage(null);
  };

  const loginLocal = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/local', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();
      if (!response.ok) return { success: false, message: 'نام کاربری یا رمز عبور صحیح نیست' };
      setCurrentUserState((previous) => ({ ...previous, ...payload.user }));
      setIsAuthenticated(true);
      const role = payload.user.role;
      setActiveView(role === 'admin' ? 'admin' : ['doctor', 'counselor', 'lawyer', 'barber', 'nutritionist'].includes(role) ? 'specialist' : 'employee');
      return { success: true, message: 'ورود موفق بود' };
    } catch {
      return { success: false, message: 'ارتباط با سرور برقرار نشد' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
  };

  const setCurrentUser = (user: User) => {
    if (isProduction && user.id !== currentUser.id) {
      showToast('تغییر حساب کاربری از داخل سامانه مجاز نیست. لطفاً از SSO سازمانی خارج و دوباره وارد شوید.', 'error');
      return;
    }
    setCurrentUserState(user);
    // Auto sync view based on role
    if (user.role === 'admin') {
      setActiveView('admin');
    } else if (['doctor', 'counselor', 'lawyer', 'barber', 'nutritionist'].includes(user.role)) {
      setActiveView('specialist');
    } else {
      setActiveView('employee');
    }
    showToast(`ورود با حساب کاربری: ${user.fullName} (${getRoleLabel(user.role)})`, 'info');
  };

  useEffect(() => {
    if (!isProduction) return;
    let cancelled = false;
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('AUTH_REQUIRED');
        return response.json();
      })
      .then(({ user }) => {
        if (cancelled || !user) return;
        const localUser = users.find((candidate) => candidate.id === user.id) || currentUser;
        setCurrentUserState({ ...localUser, ...user });
        setIsAuthenticated(true);
        setActiveView(user.role === 'admin' ? 'admin' : ['doctor', 'counselor', 'lawyer', 'barber', 'nutritionist'].includes(user.role) ? 'specialist' : 'employee');
      })
      .catch(() => {
        setIsAuthenticated(false);
        if (!cancelled) showToast('احراز هویت سازمانی انجام نشد. دسترسی به سامانه امکان‌پذیر نیست.', 'error');
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => { cancelled = true; };
  }, [isProduction]);

  const bookAppointment = async (input: BookAppointmentInput) => {
    if (isProduction) {
      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        const payload = await response.json();
        if (!response.ok) return { success: false, message: payload.error || 'ثبت نوبت انجام نشد' };
        const specialist = specialists.find((candidate) => candidate.id === input.specialistId);
        const appointment: Appointment = {
          id: payload.id,
          trackingCode: payload.trackingCode,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userPersonnelCode: currentUser.personnelCode,
          userDepartment: currentUser.department,
          userPhone: currentUser.phone,
          specialistId: input.specialistId,
          specialistName: specialist?.fullName || '',
          specialistCategory: specialist?.category || 'medical',
          specialistRoom: specialist?.roomNumber || '',
          dateShamsi: input.dateShamsi,
          dateISO: input.dateISO,
          timeSlot: input.timeSlot,
          status: 'confirmed',
          userReason: input.userReason,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        showToast(`نوبت شما با کد پیگیری ${appointment.trackingCode} با موفقیت ثبت شد.`, 'success');
        return { success: true, message: 'رزرو با موفقیت انجام شد', appointment };
      } catch {
        return { success: false, message: 'ارتباط با سرور برقرار نشد' };
      }
    }
    // Check if user is blocked due to excessive no-shows
    if (currentUser.isBlockedForNoShow) {
      showToast('حساب شما به دلیل ۳ غیبت بدون اطلاع در نوبت‌های قبلی، موقتاً مسدود شده است. لطفاً به مدیریت رفاهیات مراجعه فرمایید.', 'error');
      return { success: false, message: 'حساب مسدود است' };
    }

    const spec = specialists.find((s) => s.id === input.specialistId);
    if (!spec) {
      return { success: false, message: 'متخصص یافت نشد' };
    }

    // Check slot collision
    const existing = appointments.find(
      (a) =>
        a.specialistId === input.specialistId &&
        a.dateISO === input.dateISO &&
        a.timeSlot === input.timeSlot &&
        a.status !== 'cancelled' &&
        a.status !== 'no_show'
    );

    if (existing) {
      showToast('این بازه زمانی قبلاً توسط همکار دیگری رزرو شده است. لطفاً بازه دیگری انتخاب کنید.', 'error');
      return { success: false, message: 'تداخل زمان نوبت' };
    }

    // Create appointment
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `MP-${randomCode}`;
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      trackingCode,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userPersonnelCode: currentUser.personnelCode,
      userDepartment: currentUser.department,
      userPhone: currentUser.phone,
      specialistId: spec.id,
      specialistName: spec.fullName,
      specialistCategory: spec.category,
      specialistRoom: spec.roomNumber,
      dateShamsi: input.dateShamsi,
      dateISO: input.dateISO,
      timeSlot: input.timeSlot,
      status: 'confirmed',
      userReason: input.userReason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    // Update user stats
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, totalBookings: u.totalBookings + 1 }
          : u
      )
    );

    setCurrentUserState((prev) => ({
      ...prev,
      totalBookings: prev.totalBookings + 1,
    }));

    showToast(`نوبت شما با کد پیگیری ${trackingCode} با موفقیت ثبت شد. پیامک تایید ارسال شد.`, 'success');
    return { success: true, message: 'رزرو با موفقیت انجام شد', appointment: newAppointment };
  };

  const cancelAppointment = (appointmentId: string, reason: string) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return { success: false, message: 'نوبت یافت نشد' };

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'cancelled',
              cancellationReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );

    showToast(`نوبت با کد پیگیری ${apt.trackingCode} لغو شد.`, 'info');
    return { success: true, message: 'نوبت لغو شد' };
  };

  const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status, updatedAt: new Date().toISOString() } : a))
    );
  };

  const recordSessionResult = (appointmentId: string, result: SessionResult, isNoShow: boolean) => {
    const targetApt = appointments.find((a) => a.id === appointmentId);
    if (!targetApt) return { success: false, message: 'نوبت یافت نشد' };

    const newStatus: AppointmentStatus = isNoShow ? 'no_show' : 'completed';

    // Update appointment
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              status: newStatus,
              sessionResult: result,
              penaltyApplied: isNoShow,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );

    // Update the employee's attendance score and no-show count
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === targetApt.userId) {
          if (isNoShow) {
            const newNoShowCount = u.noShowCount + 1;
            const newScore = Math.max(0, u.attendanceScore - 25);
            const isBlocked = newNoShowCount >= 3;
            return {
              ...u,
              noShowCount: newNoShowCount,
              attendanceScore: newScore,
              isBlockedForNoShow: isBlocked,
            };
          } else {
            // Completed / Attended: Reward or maintain score
            const newScore = Math.min(100, u.attendanceScore + 5);
            return {
              ...u,
              attendanceScore: newScore,
            };
          }
        }
        return u;
      })
    );

    if (currentUser.id === targetApt.userId) {
      if (isNoShow) {
        setCurrentUserState((prev) => ({
          ...prev,
          noShowCount: prev.noShowCount + 1,
          attendanceScore: Math.max(0, prev.attendanceScore - 25),
          isBlockedForNoShow: prev.noShowCount + 1 >= 3,
        }));
      } else {
        setCurrentUserState((prev) => ({
          ...prev,
          attendanceScore: Math.min(100, prev.attendanceScore + 5),
        }));
      }
    }

    if (isNoShow) {
      showToast(`عدم حضور همکار ثبت شد و کسر امتیاز انضباطی در پرونده ایشان اعمال گردید.`, 'error');
    } else {
      showToast(`نتیجه ویزیت و توصیه‌ها با موفقیت ثبت شد و در کارتابل پرسنل قرار گرفت.`, 'success');
    }

    return { success: true, message: 'نتیجه ثبت شد' };
  };

  const updateUserRole = (userId: string, newRole: UserRole, specialistDetails?: Partial<Specialist>) => {
    let linkedSpecialistId: string | undefined;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          // If giving specialist role, check if specialist profile exists or create one
          if (['doctor', 'counselor', 'lawyer', 'barber', 'nutritionist'].includes(newRole)) {
            const existingSpec = specialists.find((s) => s.userId === userId);
            if (existingSpec) {
              linkedSpecialistId = existingSpec.id;
            } else {
              const newSpecId = `spec-${Date.now()}`;
              linkedSpecialistId = newSpecId;
              const newSpec: Specialist = {
                id: newSpecId,
                userId: u.id,
                fullName: specialistDetails?.fullName || u.fullName,
                title: specialistDetails?.title || `متخصص ${getRoleLabel(newRole)} سازمانی`,
                category: (specialistDetails?.category as any) || (newRole === 'doctor' ? 'medical' : newRole === 'counselor' ? 'counseling' : newRole === 'lawyer' ? 'legal' : newRole === 'barber' ? 'barber' : 'nutrition'),
                specialty: specialistDetails?.specialty || 'خدمات تخصصی سازمانی',
                roomNumber: specialistDetails?.roomNumber || 'اتاق درمانگاه مرکزی',
                building: specialistDetails?.building || 'ساختمان ستاد مرکزی مپنا',
                bio: specialistDetails?.bio || 'متخصص همکار گروه مپنا جهت ارائه خدمات رفاهی و ارتقای سلامت شغلی.',
                avatarUrl: specialistDetails?.avatarUrl || u.avatarUrl,
                consultationDurationMinutes: specialistDetails?.consultationDurationMinutes || 30,
                dailyCapacity: 8,
                rating: 5.0,
                reviewCount: 0,
                phoneExt: specialistDetails?.phoneExt || '۴۱۰۰',
                workingDays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'],
                timeSlots: ['۰۹:۰۰ - ۰۹:۳۰', '۰۹:۳۰ - ۱۰:۰۰', '۱۰:۰۰ - ۱۰:۳۰', '۱۰:۳۰ - ۱۱:۰۰', '۱۳:۳۰ - ۱۴:۰۰', '۱۴:۰۰ - ۱۴:۳۰'],
              };
              setSpecialists((specs) => [newSpec, ...specs]);
            }
          }

          return {
            ...u,
            role: newRole,
            specialistId: linkedSpecialistId || u.specialistId,
          };
        }
        return u;
      })
    );

    if (currentUser.id === userId) {
      setCurrentUserState((prev) => ({
        ...prev,
        role: newRole,
        specialistId: linkedSpecialistId || prev.specialistId,
      }));
    }

    showToast(`نقش کاربر به «${getRoleLabel(newRole)}» تغییر یافت.`, 'success');
  };

  const updateSpecialist = (specialist: Specialist) => {
    setSpecialists((prev) => prev.map((s) => (s.id === specialist.id ? specialist : s)));
    showToast(`اطلاعات ${specialist.fullName} به‌روزرسانی شد.`, 'success');
  };

  const addSpecialist = (specialistData: Omit<Specialist, 'id'>) => {
    const newSpec: Specialist = {
      ...specialistData,
      id: `spec-${Date.now()}`,
    };
    setSpecialists((prev) => [newSpec, ...prev]);
    showToast(`متخصص جدید «${specialistData.fullName}» به سامانه افزوده شد.`, 'success');
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}users`);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}specialists`);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}appointments`);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}current_user`);
    
    const freshUsers = generateCompanyUsers();
    setUsers(freshUsers);
    setSpecialists(INITIAL_SPECIALISTS);
    setAppointments(INITIAL_APPOINTMENTS);
    const defaultUser = freshUsers.find((u) => u.id === 'user-emp-1') || freshUsers[0];
    setCurrentUserState(defaultUser);
    setActiveView('employee');
    showToast('اطلاعات سامانه به حالت اولیه بازنشانی شد.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        authLoading: !authReady,
        loginLocal,
        logout,
        setCurrentUser,
        users,
        specialists,
        appointments,
        activeView,
        setActiveView,
        bookAppointment,
        cancelAppointment,
        recordSessionResult,
        updateAppointmentStatus,
        updateUserRole,
        updateSpecialist,
        addSpecialist,
        resetToDefaultData,
        toastMessage,
        showToast,
        hideToast,
        selectedSpecialistForBooking,
        setSelectedSpecialistForBooking,
        theme,
        setTheme,
        toggleTheme,
        isDark,
        adminTheme,
        setAdminTheme,
        toggleAdminTheme,
      }}
    >
      {isProduction && !authReady ? null : children}
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

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'مدیر ارشد / منابع انسانی';
    case 'doctor':
      return 'پزشک سازمانی';
    case 'counselor':
      return 'مشاور روانشناسی';
    case 'lawyer':
      return 'مشاور حقوقی و وکیل';
    case 'barber':
      return 'پیرایشگر سازمانی';
    case 'nutritionist':
      return 'کارشناس تغذیه';
    case 'employee':
    default:
      return 'پرسنل / همکار مپنا';
  }
};
