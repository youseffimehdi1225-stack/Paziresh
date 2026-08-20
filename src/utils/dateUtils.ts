// Date and Persian Number Helpers for MAPNA Reservation System

export const toPersianDigits = (n: number | string): string => {
  if (n === null || n === undefined) return '';
  const str = String(n);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
};

export const toEnglishDigits = (str: string): string => {
  if (!str) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let res = str;
  persianDigits.forEach((p, i) => {
    res = res.replaceAll(p, String(i));
  });
  return res;
};

// Standard Iranian Weekdays
export const PERSIAN_WEEKDAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

export const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

export interface DayOption {
  dateISO: string;       // e.g. "2026-08-19"
  dateShamsi: string;    // e.g. "چهارشنبه ۲۸ مرداد ۱۴۰۵"
  dayName: string;       // e.g. "چهارشنبه"
  shortDate: string;     // e.g. "۲۸ مرداد"
  isToday: boolean;
  isOffDay: boolean;
}

// Generate up to 30 business days starting today
export const getAvailableWorkDays = (count: number = 20): DayOption[] => {
  const days: DayOption[] = [];
  const now = new Date();
  
  // Persian day sequence table
  const baseDayNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
  const startDayNum = 24;
  const monthName = 'مرداد';
  const nextMonthName = 'شهریور';
  const yearNum = 1405;

  let currentDayNum = startDayNum;
  let currentMonth = monthName;
  let currentDayNameIndex = 0; // Starts with شنبه 24 مرداد

  for (let i = 0; i < count; i++) {
    const targetDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dateISO = targetDate.toISOString().split('T')[0];
    const dayName = baseDayNames[currentDayNameIndex % 7];

    days.push({
      dateISO,
      dateShamsi: `${dayName} ${toPersianDigits(currentDayNum)} ${currentMonth} ${toPersianDigits(yearNum)}`,
      dayName,
      shortDate: `${toPersianDigits(currentDayNum)} ${currentMonth}`,
      isToday: i === 0,
      isOffDay: dayName === 'جمعه'
    });

    currentDayNameIndex++;
    currentDayNum++;
    if (currentMonth === 'مرداد' && currentDayNum > 31) {
      currentDayNum = 1;
      currentMonth = nextMonthName;
    }
  }

  return days;
};

// Generates time slots list from start hour, end hour, slot duration and optional break
export const generateTimeSlotsFromHours = (
  startHour: string = '08:30',
  endHour: string = '15:00',
  durationMinutes: number = 30,
  breakStart?: string,
  breakEnd?: string
): string[] => {
  const parseMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const startM = parseMinutes(startHour);
  const endM = parseMinutes(endHour);
  const breakStartM = breakStart ? parseMinutes(breakStart) : null;
  const breakEndM = breakEnd ? parseMinutes(breakEnd) : null;

  const slots: string[] = [];
  let curr = startM;

  while (curr + durationMinutes <= endM) {
    const slotStart = curr;
    const slotEnd = curr + durationMinutes;

    // Check if slot overlaps with break time
    const overlapsBreak = breakStartM !== null && breakEndM !== null &&
      ((slotStart >= breakStartM && slotStart < breakEndM) ||
       (slotEnd > breakStartM && slotEnd <= breakEndM) ||
       (slotStart <= breakStartM && slotEnd >= breakEndM));

    if (!overlapsBreak) {
      slots.push(`${formatTime(slotStart)} - ${formatTime(slotEnd)}`);
    }

    curr += durationMinutes;
  }

  return slots;
};

// Check if a time slot has already passed for the current day
export const isTimeSlotPast = (slotStr: string, isToday: boolean): boolean => {
  if (!isToday || !slotStr) return false;
  const eng = toEnglishDigits(slotStr);
  const startPart = eng.split('-')[0].trim();
  const [hStr, mStr] = startPart.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h)) return false;

  const slotMinutes = h * 60 + (isNaN(m) ? 0 : m);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return slotMinutes <= currentMinutes;
};

