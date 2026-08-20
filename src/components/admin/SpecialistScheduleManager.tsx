import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Specialist } from '../../types';
import { 
  PERSIAN_WEEKDAYS, 
  toPersianDigits, 
  generateTimeSlotsFromHours, 
  getAvailableWorkDays 
} from '../../utils/dateUtils';
import { 
  Calendar, 
  Clock, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Building2, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Stethoscope, 
  Brain, 
  Scale, 
  Scissors, 
  Apple, 
  Sliders, 
  UserCheck, 
  CalendarOff,
  Sun,
  Coffee,
  Info
} from 'lucide-react';

interface SpecialistScheduleManagerProps {
  specialistIdToEdit?: string | null;
  onClose?: () => void;
  isSpecialistSelfService?: boolean;
}

export const SpecialistScheduleManager: React.FC<SpecialistScheduleManagerProps> = ({
  specialistIdToEdit,
  onClose,
  isSpecialistSelfService = false
}) => {
  const { specialists, updateSpecialist, showToast, currentUser, adminTheme } = useApp();
  const isDark = adminTheme === 'dark';

  // Find initial specialist
  const defaultSpecId = specialistIdToEdit || (isSpecialistSelfService ? specialists.find(s => s.userId === currentUser.id)?.id : null) || specialists[0]?.id;
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>(defaultSpecId || '');

  const activeSpecialist = specialists.find(s => s.id === selectedSpecialistId) || specialists[0];

  // Editable schedule state
  const [workingDays, setWorkingDays] = useState<string[]>(activeSpecialist?.workingDays || []);
  const [workHoursStart, setWorkHoursStart] = useState<string>(activeSpecialist?.workHoursStart || '08:30');
  const [workHoursEnd, setWorkHoursEnd] = useState<string>(activeSpecialist?.workHoursEnd || '15:00');
  const [breakStart, setBreakStart] = useState<string>(activeSpecialist?.breakStart || '12:00');
  const [breakEnd, setBreakEnd] = useState<string>(activeSpecialist?.breakEnd || '13:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(activeSpecialist?.consultationDurationMinutes || 30);
  const [timeSlots, setTimeSlots] = useState<string[]>(activeSpecialist?.timeSlots || []);
  const [isAvailable, setIsAvailable] = useState<boolean>(activeSpecialist?.isAvailable ?? true);
  const [leaveDates, setLeaveDates] = useState<string[]>(activeSpecialist?.leaveDates || []);
  const [newCustomSlot, setNewCustomSlot] = useState<string>('');
  const [selectedLeaveDate, setSelectedLeaveDate] = useState<string>('');

  // When changing selected specialist, sync local state
  const handleSelectSpecialist = (spec: Specialist) => {
    setSelectedSpecialistId(spec.id);
    setWorkingDays(spec.workingDays || []);
    setWorkHoursStart(spec.workHoursStart || '08:30');
    setWorkHoursEnd(spec.workHoursEnd || '15:00');
    setBreakStart(spec.breakStart || '12:00');
    setBreakEnd(spec.breakEnd || '13:00');
    setDurationMinutes(spec.consultationDurationMinutes || 30);
    setTimeSlots(spec.timeSlots || []);
    setIsAvailable(spec.isAvailable ?? true);
    setLeaveDates(spec.leaveDates || []);
  };

  // Toggle a single weekday
  const toggleWeekday = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      // Keep natural order of weekdays
      const newDays = [...workingDays, day];
      newDays.sort((a, b) => PERSIAN_WEEKDAYS.indexOf(a) - PERSIAN_WEEKDAYS.indexOf(b));
      setWorkingDays(newDays);
    }
  };

  // Preset schedules
  const applyPreset = (presetType: string) => {
    switch (presetType) {
      case 'full_time':
        setWorkingDays(['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه']);
        setWorkHoursStart('08:30');
        setWorkHoursEnd('15:00');
        break;
      case 'even_days':
        setWorkingDays(['شنبه', 'دوشنبه', 'چهارشنبه']);
        break;
      case 'odd_days':
        setWorkingDays(['یکشنبه', 'سه‌شنبه']);
        break;
      case 'two_days_end':
        setWorkingDays(['سه‌شنبه', 'چهارشنبه']);
        break;
      case 'single_monday':
        setWorkingDays(['دوشنبه']);
        break;
      case 'clear':
        setWorkingDays([]);
        break;
      default:
        break;
    }
    showToast('الگوی حضور با موفقیت اعمال گردید. برای تولید نوبت‌ها روی کلید تولید خودکار بزنید.', 'info');
  };

  // Auto generate slots based on start/end/duration/break
  const handleAutoGenerateSlots = () => {
    const generated = generateTimeSlotsFromHours(
      workHoursStart,
      workHoursEnd,
      durationMinutes,
      breakStart || undefined,
      breakEnd || undefined
    );

    // Convert to Persian digits format for nice display
    const persianFormatted = generated.map(slot => toPersianDigits(slot));
    setTimeSlots(persianFormatted);
    showToast(`${toPersianDigits(generated.length)} بازه زمانی نوبت بر اساس ساعات و مدت ویزیت تولید شد.`, 'success');
  };

  // Add custom single slot
  const handleAddCustomSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomSlot.trim()) return;
    const formatted = toPersianDigits(newCustomSlot.trim());
    if (!timeSlots.includes(formatted)) {
      setTimeSlots([...timeSlots, formatted]);
      setNewCustomSlot('');
      showToast('بازه زمانی سفارشی اضافه شد.', 'info');
    }
  };

  // Remove single slot
  const handleRemoveSlot = (slotToRemove: string) => {
    setTimeSlots(timeSlots.filter(s => s !== slotToRemove));
  };

  // Add leave date
  const handleAddLeaveDate = () => {
    if (!selectedLeaveDate) return;
    if (!leaveDates.includes(selectedLeaveDate)) {
      setLeaveDates([...leaveDates, selectedLeaveDate]);
      setSelectedLeaveDate('');
      showToast('تاریخ عدم حضور / مرخصی ثبت گردید.', 'info');
    }
  };

  // Remove leave date
  const handleRemoveLeaveDate = (date: string) => {
    setLeaveDates(leaveDates.filter(d => d !== date));
  };

  // Save changes
  const handleSaveChanges = () => {
    if (!activeSpecialist) return;

    if (workingDays.length === 0) {
      showToast('هشدار: هیچ روز حضوری انتخاب نشده است. متخصص برای نوبت‌دهی غیرفعال خواهد بود.', 'warning');
    }

    const updated: Specialist = {
      ...activeSpecialist,
      workingDays,
      workHoursStart,
      workHoursEnd,
      breakStart,
      breakEnd,
      consultationDurationMinutes: durationMinutes,
      dailyCapacity: timeSlots.length > 0 ? timeSlots.length : activeSpecialist.dailyCapacity,
      timeSlots,
      isAvailable,
      leaveDates
    };

    updateSpecialist(updated);
    showToast(`برنامه حضور و ساعات کاری ${activeSpecialist.fullName} با موفقیت ذخیره و به‌روزرسانی شد.`, 'success');
    if (onClose) onClose();
  };

  // Preview upcoming available work days for this specialist
  const allUpcomingDays = getAvailableWorkDays(25);
  const matchedDays = allUpcomingDays.filter(day => 
    workingDays.includes(day.dayName) && !leaveDates.includes(day.dateISO)
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical': return <Stethoscope className="w-4 h-4 text-[#CF2F2F]" />;
      case 'counseling': return <Brain className="w-4 h-4 text-[#CF2F2F]" />;
      case 'legal': return <Scale className="w-4 h-4 text-[#CF2F2F]" />;
      case 'barber': return <Scissors className="w-4 h-4 text-[#CF2F2F]" />;
      case 'nutrition':
      default: return <Apple className="w-4 h-4 text-[#CF2F2F]" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Title Bento */}
      <div className={`border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
        isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
      }`}>
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold mb-2 border ${
            isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-300' : 'bg-white border-[#E5E5E5] text-[#6D6E70]'
          }`}>
            <Calendar className="w-3.5 h-3.5 text-[#CF2F2F]" />
            <span>سامانه زمان‌بندی و مدیریت حضور متخصصین مپنا</span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
            {isSpecialistSelfService ? 'تنظیم برنامه حضور و ساعات کاری من' : 'مدیریت برنامه حضور و ساعات کاری متخصصان'}
          </h2>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
            تعیین روزهای حضور در شرکت، ساعات شروع و پایان، بازه‌های زمانی نوبت‌دهی و ثبت مرخصی. نوبت‌دهی به پرسنل دقیقاً بر اساس این برنامه محدود می‌شود.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isDark
                ? 'bg-[#1C222D] hover:bg-[#252C38] text-slate-300 border-[#2D3542]'
                : 'bg-white hover:bg-[#F2F2F2] text-[#6D6E70] border-[#E5E5E5]'
            }`}
          >
            <X className="w-4 h-4" />
            <span>بستن پنجره</span>
          </button>
        )}
      </div>

      {/* Specialist Selector (Only show selector if not self-service single specialist mode) */}
      {!isSpecialistSelfService && (
        <div className={`border rounded-2xl p-5 shadow-xs space-y-3 transition-colors ${
          isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-extrabold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
              <UserCheck className="w-4 h-4 text-[#CF2F2F]" />
              <span>انتخاب متخصص جهت مشاهده و ویرایش برنامه حضور:</span>
            </h3>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
              تعداد متخصصین فعال: <strong className={isDark ? 'text-slate-200' : 'text-[#333333]'}>{toPersianDigits(specialists.length)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {specialists.map(spec => {
              const isSelected = spec.id === selectedSpecialistId;
              return (
                <button
                  key={spec.id}
                  onClick={() => handleSelectSpecialist(spec)}
                  className={`p-3.5 rounded-xl border text-right transition-all flex items-center gap-3 relative ${
                    isSelected
                      ? 'bg-[#CF2F2F] text-white border-[#CF2F2F] shadow-sm'
                      : isDark
                        ? 'bg-[#1C222D] hover:bg-[#252C38] text-slate-200 border-[#2D3542]'
                        : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#333333] border-[#E5E5E5]'
                  }`}
                >
                  <img
                    src={spec.avatarUrl}
                    alt={spec.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-white/40 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                      {spec.fullName}
                    </h4>
                    <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-white/80' : isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                      {spec.title}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isDark
                            ? 'bg-[#151921] text-slate-300 border border-[#2D3542]'
                            : 'bg-white text-[#6D6E70] border border-[#E5E5E5]'
                      }`}>
                        {toPersianDigits(spec.workingDays?.length || 0)} روز حضور
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white absolute top-3 left-3 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Schedule Configuration Grid */}
      {activeSpecialist && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Presence Days & Working Hours (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section 1: Weekday Presence Selector */}
            <div className={`border rounded-2xl p-6 shadow-xs space-y-5 transition-colors ${
              isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b ${
                isDark ? 'border-[#252C38]' : 'border-[#E5E5E5]'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[#CF2F2F] border ${
                    isDark ? 'bg-rose-950/40 border-rose-800/60' : 'bg-rose-50 border-rose-100'
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-extrabold ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                      ۱. روزهای حضور در شرکت مپنا
                    </h3>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                      پرسنل تنها در این روزهای هفته قادر به ثبت و رزرو نوبت خواهند بود.
                    </p>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  isDark ? 'bg-[#1C222D] border-[#2D3542]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
                }`}>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>وضعیت فعالیت:</span>
                  <button
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      isAvailable 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : isDark ? 'bg-slate-700 text-slate-300' : 'bg-[#6D6E70] text-white'
                    }`}
                  >
                    {isAvailable ? 'حاضر و نوبت‌پذیر' : 'غیرفعال موقت'}
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>الگوهای سریع حضور:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('full_time')}
                    className={`px-3 py-1.5 text-xs rounded-xl transition-all font-medium border ${
                      isDark
                        ? 'bg-[#1C222D] hover:bg-[#252C38] text-slate-200 border-[#2D3542]'
                        : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] border-[#E5E5E5] text-[#333333]'
                    }`}
                  >
                    تمام‌وقت (شنبه تا چهارشنبه)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('even_days')}
                    className={`px-3 py-1.5 text-xs rounded-xl transition-all font-medium border ${
                      isDark
                        ? 'bg-[#1C222D] hover:bg-[#252C38] text-slate-200 border-[#2D3542]'
                        : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] border-[#E5E5E5] text-[#333333]'
                    }`}
                  >
                    روزهای زوج (شنبه، دوشنبه، چهارشنبه)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('odd_days')}
                    className={`px-3 py-1.5 text-xs rounded-xl transition-all font-medium border ${
                      isDark
                        ? 'bg-[#1C222D] hover:bg-[#252C38] text-slate-200 border-[#2D3542]'
                        : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] border-[#E5E5E5] text-[#333333]'
                    }`}
                  >
                    روزهای فرد (یکشنبه، سه‌شنبه)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('two_days_end')}
                    className={`px-3 py-1.5 text-xs rounded-xl transition-all font-medium border ${
                      isDark
                        ? 'bg-[#1C222D] hover:bg-[#252C38] text-slate-200 border-[#2D3542]'
                        : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] border-[#E5E5E5] text-[#333333]'
                    }`}
                  >
                    دو روز در هفته (سه‌شنبه، چهارشنبه)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('single_monday')}
                    className={`px-3 py-1.5 text-xs rounded-xl transition-all font-medium border ${
                      isDark
                        ? 'bg-[#1C222D] hover:bg-[#252C38] text-slate-200 border-[#2D3542]'
                        : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] border-[#E5E5E5] text-[#333333]'
                    }`}
                  >
                    تک روز (فقط دوشنبه‌ها)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('clear')}
                    className={`px-3 py-1.5 text-xs rounded-xl transition-all font-bold border ${
                      isDark
                        ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60'
                        : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-[#CF2F2F]'
                    }`}
                  >
                    عدم حضور در تمام روزها
                  </button>
                </div>
              </div>

              {/* Interactive Weekday Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
                {PERSIAN_WEEKDAYS.map((day) => {
                  const isPresent = workingDays.includes(day);
                  const isFriday = day === 'جمعه';

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekday(day)}
                      className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all relative ${
                        isPresent
                          ? 'bg-[#CF2F2F] text-white border-[#CF2F2F] shadow-xs'
                          : isDark
                            ? 'bg-[#1C222D] hover:bg-[#252C38] text-slate-300 border-[#2D3542]'
                            : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#6D6E70] border-[#E5E5E5]'
                      }`}
                    >
                      <span className="text-xs font-extrabold">{day}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        isPresent
                          ? 'bg-white text-[#CF2F2F]'
                          : isDark
                            ? 'bg-[#2D3542] text-slate-400'
                            : 'bg-[#E5E5E5] text-white'
                      }`}>
                        {isPresent ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3" />}
                      </div>
                      <span className="text-[10px] opacity-85">
                        {isPresent ? 'حاضر در مپنا' : isFriday ? 'تعطیل هفتگی' : 'عدم حضور'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {workingDays.length === 0 && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  isDark
                    ? 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    توجه: هیچ روز حضوری برای این متخصص انتخاب نشده است. پرسنل قادر به انتخاب این متخصص در فرم رزرو نوبت نخواهند بود.
                  </span>
                </div>
              )}
            </div>

            {/* Section 2: Working Hours & Slot Engine */}
            <div className={`border rounded-2xl p-6 shadow-xs space-y-5 transition-colors ${
              isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
            }`}>
              <div className={`flex items-center gap-2 pb-4 border-b ${
                isDark ? 'border-[#252C38]' : 'border-[#E5E5E5]'
              }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[#CF2F2F] border ${
                  isDark ? 'bg-rose-950/40 border-rose-800/60' : 'bg-rose-50 border-rose-100'
                }`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-extrabold ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                    ۲. ساعات کاری و بازه‌های نوبت‌دهی روزانه
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                    تنظیم ساعت شروع و پایان حضور، بازه استراحت و مدت زمان هر نوبت جهت تولید دقیق اسلات‌ها
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Start Hour */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>ساعت شروع حضور:</span>
                  </label>
                  <input
                    type="time"
                    value={workHoursStart}
                    onChange={(e) => setWorkHoursStart(e.target.value)}
                    className={`w-full text-xs sm:text-sm font-mono px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                      isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-100' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333] focus:bg-white'
                    }`}
                  />
                </div>

                {/* End Hour */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                    <Clock className="w-3.5 h-3.5 text-[#CF2F2F]" />
                    <span>ساعت پایان حضور:</span>
                  </label>
                  <input
                    type="time"
                    value={workHoursEnd}
                    onChange={(e) => setWorkHoursEnd(e.target.value)}
                    className={`w-full text-xs sm:text-sm font-mono px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                      isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-100' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333] focus:bg-white'
                    }`}
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                    <Sliders className="w-3.5 h-3.5 text-[#CF2F2F]" />
                    <span>مدت هر نوبت (دقیقه):</span>
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className={`w-full text-xs sm:text-sm px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                      isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-100' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333] focus:bg-white'
                    }`}
                  >
                    <option value={15}>۱۵ دقیقه (معاینات کوتاه)</option>
                    <option value={20}>۲۰ دقیقه (طب کار / چکاپ)</option>
                    <option value={25}>۲۵ دقیقه (تغذیه و رژیم)</option>
                    <option value={30}>۳۰ دقیقه (مشاوره حقوقی / پیرایش)</option>
                    <option value={45}>۴۵ دقیقه (روانشناسی و مشاوره)</option>
                    <option value={60}>۶۰ دقیقه (جلسات تخصصی)</option>
                  </select>
                </div>

                {/* Break Interval */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                    <Coffee className="w-3.5 h-3.5 text-[#CF2F2F]" />
                    <span>استراحت و ناهار:</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={breakStart}
                      onChange={(e) => setBreakStart(e.target.value)}
                      className={`w-1/2 text-[11px] font-mono px-2 py-2 rounded-lg border ${
                        isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-100' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
                      }`}
                      title="شروع استراحت"
                    />
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>تا</span>
                    <input
                      type="time"
                      value={breakEnd}
                      onChange={(e) => setBreakEnd(e.target.value)}
                      className={`w-1/2 text-[11px] font-mono px-2 py-2 rounded-lg border ${
                        isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-100' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
                      }`}
                      title="پایان استراحت"
                    />
                  </div>
                </div>

              </div>

              {/* Auto Slot Generation Button */}
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t ${
                isDark ? 'border-[#252C38]' : 'border-[#E5E5E5]'
              }`}>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                  تعداد نوبت‌های فعلی تعریف‌شده: <strong className={`font-mono ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>{toPersianDigits(timeSlots.length)} نوبت در روز</strong>
                </div>

                <button
                  type="button"
                  onClick={handleAutoGenerateSlots}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#CF2F2F] hover:bg-[#b52626] text-white rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تولید خودکار بازه‌های نوبت روزانه</span>
                </button>
              </div>

              {/* Slots Tag Cloud */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                    لیست بازه‌های زمانی فعال نوبت‌دهی:
                  </span>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                    (جهت حذف هر بازه روی علامت ضربدر کلیک کنید)
                  </span>
                </div>

                {timeSlots.length === 0 ? (
                  <div className={`p-4 text-center rounded-xl border border-dashed text-xs ${
                    isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-400' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#6D6E70]'
                  }`}>
                    هیچ بازه زمانی تولید نشده است. لطفاً روی دکمه «تولید خودکار بازه‌های نوبت» کلیک کنید یا به صورت دستی بازه اضافه نمایید.
                  </div>
                ) : (
                  <div className={`flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 rounded-xl border ${
                    isDark ? 'bg-[#1C222D] border-[#2D3542]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
                  }`}>
                    {timeSlots.map((slot, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono shadow-xs group ${
                          isDark
                            ? 'bg-[#151921] border-[#2D3542] text-slate-200'
                            : 'bg-white border-[#E5E5E5] text-[#333333]'
                        }`}
                      >
                        <Clock className="w-3 h-3 text-[#CF2F2F]" />
                        <span>{slot}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(slot)}
                          className={`transition-colors p-0.5 ${isDark ? 'text-slate-400 hover:text-[#CF2F2F]' : 'text-[#6D6E70] hover:text-[#CF2F2F]'}`}
                          title="حذف این نوبت"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add Custom Slot Input */}
                <form onSubmit={handleAddCustomSlot} className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="افزودن بازه دستی مثلاً: ۱۱:۴۵ - ۱۲:۱۵"
                    value={newCustomSlot}
                    onChange={(e) => setNewCustomSlot(e.target.value)}
                    className={`flex-1 text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                      isDark
                        ? 'bg-[#1C222D] border-[#2D3542] text-slate-100 placeholder:text-slate-500'
                        : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333] focus:bg-white'
                    }`}
                  />
                  <button
                    type="submit"
                    className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      isDark
                        ? 'bg-[#1C222D] hover:bg-[#252C38] border-[#2D3542] text-slate-200'
                        : 'bg-white hover:bg-[#F2F2F2] border-[#E5E5E5] text-[#333333]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-[#CF2F2F]" />
                    <span>افزودن</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Section 3: Temporary Leaves / Absence Exceptions */}
            <div className={`border rounded-2xl p-6 shadow-xs space-y-4 transition-colors ${
              isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
            }`}>
              <div className={`flex items-center gap-2 pb-3 border-b ${
                isDark ? 'border-[#252C38]' : 'border-[#E5E5E5]'
              }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-amber-500 border ${
                  isDark ? 'bg-amber-950/40 border-amber-800/60' : 'bg-amber-50 border-amber-100'
                }`}>
                  <CalendarOff className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-extrabold ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                    ۳. ثبت مرخصی و عدم حضور موقت در روز خاص
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                    اگر متخصص در یک تاریخ خاص در شرکت حضور ندارد، آن تاریخ را مسدود کنید.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={selectedLeaveDate}
                  onChange={(e) => setSelectedLeaveDate(e.target.value)}
                  className={`flex-1 text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                    isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-100' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333] focus:bg-white'
                  }`}
                >
                  <option value="">-- انتخاب تاریخ روز کاری آینده جهت ثبت مرخصی --</option>
                  {allUpcomingDays.filter(d => !d.isOffDay).map(day => (
                    <option key={day.dateISO} value={day.dateISO}>
                      {day.dateShamsi} ({day.dateISO})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddLeaveDate}
                  disabled={!selectedLeaveDate}
                  className={`w-full sm:w-auto px-4 py-2 disabled:opacity-50 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isDark
                      ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-800/60'
                      : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <CalendarOff className="w-3.5 h-3.5 text-amber-500" />
                  <span>ثبت عدم حضور در این تاریخ</span>
                </button>
              </div>

              {/* Leave dates list */}
              {leaveDates.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {leaveDates.map((ld, i) => {
                    const matched = allUpcomingDays.find(d => d.dateISO === ld);
                    return (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                          isDark
                            ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                            : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}
                      >
                        <CalendarOff className="w-3.5 h-3.5 text-amber-500" />
                        <span>{matched ? matched.dateShamsi : ld} (مرخصی)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLeaveDate(ld)}
                          className="hover:text-red-500 p-0.5"
                          title="حذف مرخصی و فعال‌سازی مجدد"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

          {/* Right Column: Specialist Summary & Live Booking Simulation (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Specialist Profile Card */}
            <div className={`border rounded-2xl p-6 shadow-xs space-y-4 transition-colors ${
              isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
            }`}>
              <div className="flex items-center gap-3">
                <img
                  src={activeSpecialist.avatarUrl}
                  alt={activeSpecialist.fullName}
                  className={`w-14 h-14 rounded-2xl object-cover border shadow-xs ${
                    isDark ? 'border-[#2D3542]' : 'border-[#E5E5E5]'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(activeSpecialist.category)}
                    <h3 className={`text-sm font-extrabold ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                      {activeSpecialist.fullName}
                    </h3>
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>{activeSpecialist.title}</p>
                </div>
              </div>

              <div className={`space-y-2 pt-3 border-t text-xs ${
                isDark ? 'border-[#252C38] text-slate-400' : 'border-[#E5E5E5] text-[#6D6E70]'
              }`}>
                <div className="flex items-center justify-between">
                  <span>محل استقرار در مپنا:</span>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>{activeSpecialist.roomNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>ساختمان:</span>
                  <span className={`font-semibold text-[11px] truncate max-w-[170px] ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>{activeSpecialist.building}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>شماره تلفن داخلی:</span>
                  <span className="font-mono font-bold text-[#CF2F2F]">{activeSpecialist.phoneExt}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`pt-4 border-t space-y-2 ${isDark ? 'border-[#252C38]' : 'border-[#E5E5E5]'}`}>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="w-full py-3 bg-[#CF2F2F] hover:bg-[#b52626] text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>ذخیره و اعمال نهایی برنامه حضور</span>
                </button>
              </div>
            </div>

            {/* Live Booking Simulation Preview */}
            <div className={`border rounded-2xl p-5 shadow-xs space-y-3 transition-colors ${
              isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
            }`}>
              <div className={`flex items-center justify-between pb-2 border-b ${
                isDark ? 'border-[#252C38]' : 'border-[#E5E5E5]'
              }`}>
                <span className={`text-xs font-extrabold flex items-center gap-1.5 ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                  <Sparkles className="w-4 h-4 text-[#CF2F2F]" />
                  پیش‌نمایش تقویم در دسترس پرسنل
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                  isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-300' : 'bg-white border-[#E5E5E5] text-[#6D6E70]'
                }`}>
                  {toPersianDigits(matchedDays.length)} روز فعال
                </span>
              </div>

              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                پرسنل با مراجعه به بخش رزرو، تنها روزهای زیر را برای <strong className={isDark ? 'text-slate-200' : 'text-[#333333]'}>{activeSpecialist.fullName}</strong> مشاهده و انتخاب خواهند کرد:
              </p>

              {matchedDays.length === 0 ? (
                <div className={`p-4 text-center rounded-xl border text-xs space-y-1 ${
                  isDark ? 'bg-[#1C222D] border-rose-900/50 text-rose-400' : 'bg-white border-rose-200 text-[#CF2F2F]'
                }`}>
                  <ShieldAlert className="w-6 h-6 mx-auto" />
                  <p className="font-bold">هیچ روزی در دسترس نیست!</p>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>لطفاً حداقل یک روز هفته را در بخش بالا انتخاب فرمایید.</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {matchedDays.slice(0, 8).map((day, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        isDark ? 'bg-[#1C222D] border-[#2D3542]' : 'bg-white border-[#E5E5E5]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>{day.dateShamsi}</span>
                      </div>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                        {toPersianDigits(timeSlots.length)} نوبت
                      </span>
                    </div>
                  ))}
                  {matchedDays.length > 8 && (
                    <p className={`text-[10px] text-center pt-1 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                      و {toPersianDigits(matchedDays.length - 8)} روز کاری دیگر...
                    </p>
                  )}
                </div>
              )}

              <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
                isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-400' : 'bg-white border-[#E5E5E5] text-[#6D6E70]'
              }`}>
                <div className={`flex items-center gap-1.5 font-bold ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                  <Info className="w-3.5 h-3.5 text-[#CF2F2F]" />
                  <span>قانون عدم حضور و لغو:</span>
                </div>
                <p className="leading-normal">
                  سایر روزهای هفته در فرم رزرو به طور کامل غیرفعال (Disabled) خواهند بود.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
