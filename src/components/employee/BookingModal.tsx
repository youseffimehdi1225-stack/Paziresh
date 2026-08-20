import React, { useState } from 'react';
import { Specialist, Appointment } from '../../types';
import { useApp } from '../../context/AppContext';
import { getAvailableWorkDays, toPersianDigits, DayOption, isTimeSlotPast } from '../../utils/dateUtils';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Building2, 
  FileText, 
  ShieldCheck,
  Printer,
  Sparkles
} from 'lucide-react';

interface BookingModalProps {
  specialist: Specialist;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ specialist, onClose }) => {
  const { currentUser, appointments, bookAppointment, isDark } = useApp();
  
  // Strictly display up to 10 days into the future starting today
  const availableDays = getAvailableWorkDays(10);
  
  // Strict filter: days that match specialist's configured working days, excluding leaves and Friday off days
  const validDays = availableDays.filter((day) => 
    !day.isOffDay &&
    specialist.workingDays.includes(day.dayName) &&
    !(specialist.leaveDates || []).includes(day.dateISO)
  );

  const isSpecialistInactive = specialist.isAvailable === false || validDays.length === 0 || specialist.workingDays.length === 0;

  const [selectedDay, setSelectedDay] = useState<DayOption>(validDays[0] || availableDays[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [userReason, setUserReason] = useState<string>('');
  const [agreeToPolicy, setAgreeToPolicy] = useState<boolean>(true);
  const [bookingSuccessData, setBookingSuccessData] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check which slots are already booked for this specialist on this date
  const bookedSlotsOnDate = appointments
    .filter(
      (a) =>
        a.specialistId === specialist.id &&
        a.dateISO === selectedDay?.dateISO &&
        a.status !== 'cancelled' &&
        a.status !== 'no_show'
    )
    .map((a) => a.timeSlot);

  // Count active (available) slots for the selected day that are not booked and not in the past
  const activeAvailableSlotsCount = specialist.timeSlots.filter(
    (slot) => !bookedSlotsOnDate.includes(slot) && !isTimeSlotPast(slot, Boolean(selectedDay?.isToday))
  ).length;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert('لطفاً یک بازه زمانی انتخاب نمایید.');
      return;
    }
    if (!userReason.trim()) {
      alert('لطفاً علت یا موضوع مراجعه را به صورت مختصر قید فرمایید.');
      return;
    }
    if (!agreeToPolicy) {
      alert('لطفاً تعهدنامه حضور در موعد مقرر را تایید فرمایید.');
      return;
    }

    setIsSubmitting(true);
    const result = bookAppointment({
      specialistId: specialist.id,
      dateShamsi: selectedDay.dateShamsi,
      dateISO: selectedDay.dateISO,
      timeSlot: selectedSlot,
      userReason: userReason.trim(),
    });

    setIsSubmitting(false);
    if (result.success && result.appointment) {
      setBookingSuccessData(result.appointment);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border transition-all text-right animate-scale-up ${
        isDark 
          ? 'bg-[#121622]/95 border-slate-700/60 backdrop-blur-xl text-slate-100 shadow-black/50' 
          : 'bg-white border-[#E5E5E5] text-[#333333]'
      }`}>
        
        {/* Modal Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-[#161B28] border-slate-700/50' : 'bg-[#F8F8F8] border-[#E5E5E5]'
        }`}>
          <div className="flex items-center gap-3.5">
            <img
              src={specialist.avatarUrl}
              alt={specialist.fullName}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#CF2F2F] shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className={`font-black text-base sm:text-lg ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                رزرو نوبت {specialist.fullName}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                {specialist.title} • {specialist.roomNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark 
                ? 'border-slate-700/60 hover:bg-[#1E2638] text-slate-400 hover:text-white' 
                : 'border-[#E5E5E5] hover:bg-[#E5E5E5] text-[#6D6E70] hover:text-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {!bookingSuccessData ? (
          <form onSubmit={handleConfirm} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto text-right">
            
            {/* User Profile confirmation callout Bento Tile */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
              isDark ? 'bg-[#181F2C] border-slate-700/50' : 'bg-[#F8F8F8] border-[#E5E5E5]'
            }`}>
              <div className={`flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                <User className="w-4 h-4 text-[#CF2F2F]" />
                <span>نوبت به نام: <strong className={isDark ? 'text-white' : 'text-[#333333]'}>{currentUser.fullName}</strong></span>
              </div>
              <span className={`font-mono px-2.5 py-1 rounded-lg border font-semibold ${
                isDark ? 'bg-[#121622] text-amber-400 border-slate-700/60' : 'bg-white text-[#6D6E70] border-[#E5E5E5]'
              }`}>
                کد پرسنلی: {toPersianDigits(currentUser.personnelCode)}
              </span>
            </div>

            {/* Presence Schedule Info Banner Bento Tile */}
            <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
              isDark ? 'bg-[#181F2C] border-slate-700/50' : 'bg-[#F8F8F8] border-[#E5E5E5]'
            }`}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#CF2F2F] shrink-0" />
                <span className={isDark ? 'text-slate-300' : 'text-[#333333]'}>
                  <strong>روزهای حضور در ستاد مپنا:</strong>{' '}
                  <span className="text-[#CF2F2F] font-bold">
                    {specialist.workingDays.length > 0 ? specialist.workingDays.join('، ') : 'نامشخص'}
                  </span>
                </span>
              </div>
              {specialist.workHoursStart && specialist.workHoursEnd && (
                <div className={`flex items-center gap-1 font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>پذیرش: {toPersianDigits(specialist.workHoursStart)} تا {toPersianDigits(specialist.workHoursEnd)}</span>
                </div>
              )}
            </div>

            {/* Blocked or Inactive Warnings */}
            {currentUser.isBlockedForNoShow ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-[#CF2F2F] text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#CF2F2F] shrink-0 mt-0.5" />
                <div>
                  <strong>هشدار مسدودیت حساب:</strong> به دلیل ثبت ۳ بار غیبت و عدم مراجعه به نوبت‌های قبلی، حساب شما مسدود شده است و امکان ثبت نوبت جدید وجود ندارد.
                </div>
              </div>
            ) : isSpecialistInactive ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong>عدم امکان نوبت‌دهی در حال حاضر:</strong> متخصص محترم در این بازه زمانی روز حضور فعالی در تقویم سازمانی ثبت نکرده‌اند یا در مرخصی می‌باشند. لطفاً در صورت نیاز اضطراری با شماره داخلی <strong className="font-mono text-white">{toPersianDigits(specialist.phoneExt)}</strong> تماس حاصل فرمایید.
                </div>
              </div>
            ) : null}

            {/* Step 1: Select Day */}
            {!isSpecialistInactive && (
              <div className="space-y-2">
                <label className={`block text-xs sm:text-sm font-bold flex items-center justify-between ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#CF2F2F]" />
                    <span>۱. انتخاب تاریخ مراجعه (تنها روزهای حضور مجاز)</span>
                  </span>
                  <span className={`text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                    ({toPersianDigits(validDays.length)} روز در دسترس)
                  </span>
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {validDays.map((day) => {
                    const isSelected = selectedDay?.dateISO === day.dateISO;
                    return (
                      <button
                        type="button"
                        key={day.dateISO}
                        onClick={() => {
                          setSelectedDay(day);
                          setSelectedSlot('');
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#CF2F2F] text-white border-[#CF2F2F] shadow-md font-bold'
                            : isDark
                            ? 'bg-[#181F2C] hover:bg-[#20293A] text-slate-300 border-slate-700/60'
                            : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#6D6E70] border-[#E5E5E5]'
                        }`}
                      >
                        <span className={`text-[11px] font-medium ${isSelected ? 'text-white/90' : isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>{day.dayName}</span>
                        <span className="text-xs font-bold mt-0.5">{day.shortDate}</span>
                        {day.isToday && (
                          <span className={`text-[9px] mt-1 px-1.5 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-white text-[#CF2F2F]' : isDark ? 'bg-slate-700 text-slate-200' : 'bg-[#E5E5E5] text-[#333333]'
                          }`}>
                            امروز
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Select Time Slot */}
            {!isSpecialistInactive && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`block text-xs sm:text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                    <Clock className="w-4 h-4 text-[#CF2F2F]" />
                    <span>۲. انتخاب ساعت و بازه زمانی حضور متخصص</span>
                  </label>
                  <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                    {toPersianDigits(activeAvailableSlotsCount)} نوبت قابل رزرو
                  </span>
                </div>

                {specialist.timeSlots.length === 0 ? (
                  <div className={`p-3 text-center rounded-2xl text-xs border ${
                    isDark ? 'bg-[#181F2C] text-slate-400 border-slate-700/50' : 'bg-[#F8F8F8] text-[#6D6E70] border-[#E5E5E5]'
                  }`}>
                    هیچ بازه زمانی برای این روز تعریف نشده است.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {specialist.timeSlots.map((slot) => {
                      const isBooked = bookedSlotsOnDate.includes(slot);
                      const isPast = isTimeSlotPast(slot, Boolean(selectedDay?.isToday));
                      const isDisabled = isBooked || isPast;
                      const isSelected = selectedSlot === slot;

                      return (
                        <button
                          type="button"
                          key={slot}
                          disabled={isDisabled}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-2xl border text-xs font-semibold transition-all flex items-center justify-between ${
                            isDisabled
                              ? isDark
                                ? 'bg-[#141924]/60 text-slate-600 border-slate-800/80 cursor-not-allowed opacity-60'
                                : 'bg-[#F2F2F2] text-[#8C8C8C] border-[#E5E5E5] cursor-not-allowed opacity-70'
                              : isSelected
                              ? 'bg-[#CF2F2F] text-white border-[#CF2F2F] shadow-md font-bold'
                              : isDark
                              ? 'bg-[#181F2C] hover:bg-[#222B3D] text-slate-200 border-slate-700/60 cursor-pointer'
                              : 'bg-white hover:bg-[#F8F8F8] text-[#333333] border-[#E5E5E5] cursor-pointer'
                          }`}
                        >
                          <span className={`font-mono text-xs ${isDisabled ? 'line-through' : ''}`}>
                            {toPersianDigits(slot)}
                          </span>
                          {isBooked ? (
                            <span className="text-[10px] text-[#CF2F2F] font-normal no-underline bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
                              رزرو شده
                            </span>
                          ) : isPast ? (
                            <span className={`text-[10px] font-normal no-underline px-1.5 py-0.5 rounded border ${
                              isDark ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-[#EBEBEB] text-[#6D6E70] border-[#D9D9D9]'
                            }`}>
                              زمان گذشته
                            </span>
                          ) : isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Reason for visit */}
            <div className="space-y-2">
              <label className={`block text-xs sm:text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                <FileText className="w-4 h-4 text-[#CF2F2F]" />
                <span>۳. شرح خلاصه علت مراجعه / موضوع مورد نیاز</span>
              </label>
              <textarea
                rows={2}
                required
                value={userReason}
                onChange={(e) => setUserReason(e.target.value)}
                placeholder="مثال: چکاپ دوره‌ای طب کار، مشاوره مدیریت استرس شغلی، بررسی قرارداد ملکی..."
                className={`w-full text-xs sm:text-sm p-3.5 rounded-2xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] transition-all ${
                  isDark
                    ? 'bg-[#181F2C] border-slate-700/60 text-slate-100 placeholder-slate-500'
                    : 'bg-[#F8F8F8] focus:bg-white border-[#E5E5E5] text-[#333333]'
                }`}
              />
            </div>

            {/* Attendance Commitment Notice Bento Tile */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#181F2C] border-slate-700/50' : 'bg-[#F8F8F8] border-[#E5E5E5]'
            }`}>
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="policyCheck"
                  checked={agreeToPolicy}
                  onChange={(e) => setAgreeToPolicy(e.target.checked)}
                  className="mt-1 rounded text-[#CF2F2F] focus:ring-[#CF2F2F] border-[#D1D5DB] accent-[#CF2F2F]"
                />
                <label htmlFor="policyCheck" className={`text-xs font-medium leading-relaxed cursor-pointer select-none ${
                  isDark ? 'text-slate-300' : 'text-[#6D6E70]'
                }`}>
                  متعهد می‌شوم در زمان مقرر در محل حضور یابم. می‌دانم که <strong className={isDark ? 'text-white' : 'text-[#333333]'}>عدم حضور (No-Show) بدون لغو قبلی موجب کسر ۲۵ امتیاز انضباطی</strong> و مسدودیت موقت حساب پس از ۳ بار غیبت خواهد شد.
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className={`pt-3 flex items-center justify-end gap-2.5 border-t ${
              isDark ? 'border-slate-700/50' : 'border-[#E5E5E5]'
            }`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  isDark 
                    ? 'border-slate-700/60 text-slate-300 hover:bg-[#1E2638]' 
                    : 'border-[#E5E5E5] text-[#6D6E70] hover:bg-[#F8F8F8] hover:text-[#333333]'
                }`}
              >
                انصراف
              </button>
              
              <button
                type="submit"
                disabled={currentUser.isBlockedForNoShow || isSpecialistInactive || isSubmitting || !selectedSlot}
                className="px-6 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>تایید نهایی و صدور برگه نوبت</span>
              </button>
            </div>

          </form>
        ) : (
          /* Confirmation Receipt View */
          <div className="p-6 text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                نوبت شما با موفقیت رزرو و ثبت شد
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                اطلاعات نوبت در کارتابل شما ذخیره شد و پیامک تایید به شماره همراه سازمانی ارسال گردید.
              </p>
            </div>

            {/* Official Receipt Bento Tile */}
            <div className={`p-5 rounded-2xl border text-right space-y-3 text-xs ${
              isDark ? 'bg-[#181F2C] border-slate-700/60 text-slate-200' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
            }`}>
              <div className={`flex items-center justify-between border-b pb-2.5 ${
                isDark ? 'border-slate-700/50' : 'border-[#E5E5E5]'
              }`}>
                <span className={isDark ? 'text-slate-400' : 'text-[#6D6E70]'}>کد رهگیری نوبت:</span>
                <span className={`font-mono text-sm font-black text-[#CF2F2F] px-3 py-1 rounded-lg border ${
                  isDark ? 'bg-[#121622] border-slate-700/60' : 'bg-white border-[#E5E5E5]'
                }`}>
                  {bookingSuccessData.trackingCode}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className={isDark ? 'text-slate-400' : 'text-[#6D6E70]'}>نام مراجع:</span>{' '}
                  <strong className={isDark ? 'text-white' : 'text-[#333333]'}>{bookingSuccessData.userName}</strong>
                </div>
                <div>
                  <span className={isDark ? 'text-slate-400' : 'text-[#6D6E70]'}>کد پرسنلی:</span>{' '}
                  <span className={`font-mono font-bold ${isDark ? 'text-amber-400' : 'text-[#333333]'}`}>{toPersianDigits(bookingSuccessData.userPersonnelCode)}</span>
                </div>
                <div>
                  <span className={isDark ? 'text-slate-400' : 'text-[#6D6E70]'}>متخصص:</span>{' '}
                  <strong className={isDark ? 'text-white' : 'text-[#333333]'}>{bookingSuccessData.specialistName}</strong>
                </div>
                <div>
                  <span className={isDark ? 'text-slate-400' : 'text-[#6D6E70]'}>محل مراجعه:</span>{' '}
                  <strong className={isDark ? 'text-white' : 'text-[#333333]'}>{bookingSuccessData.specialistRoom}</strong>
                </div>
                <div>
                  <span className={isDark ? 'text-slate-400' : 'text-[#6D6E70]'}>تاریخ:</span>{' '}
                  <strong className={isDark ? 'text-white' : 'text-[#333333]'}>{bookingSuccessData.dateShamsi}</strong>
                </div>
                <div>
                  <span className={isDark ? 'text-slate-400' : 'text-[#6D6E70]'}>ساعت ویزیت:</span>{' '}
                  <strong className="text-[#CF2F2F] font-mono font-bold">{toPersianDigits(bookingSuccessData.timeSlot)}</strong>
                </div>
              </div>

              <div className={`pt-2 border-t text-[11px] ${
                isDark ? 'border-slate-700/50 text-slate-400' : 'border-[#E5E5E5] text-[#6D6E70]'
              }`}>
                علت مراجعه قید شده: {bookingSuccessData.userReason}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => window.print()}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDark 
                    ? 'border-slate-700/60 bg-[#181F2C] hover:bg-[#222B3D] text-slate-300' 
                    : 'border-[#E5E5E5] hover:bg-[#F8F8F8] text-[#6D6E70]'
                }`}
              >
                <Printer className="w-4 h-4 text-[#CF2F2F]" />
                <span>چاپ رسید نوبت</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
              >
                بستن و مشاهده در نوبت‌های من
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
