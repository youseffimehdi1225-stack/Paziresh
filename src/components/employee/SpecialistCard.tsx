import React from 'react';
import { Specialist } from '../../types';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/dateUtils';
import { 
  Building2, 
  Clock, 
  MapPin, 
  Star, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Stethoscope, 
  Brain, 
  Scale, 
  Scissors, 
  Apple, 
  Sparkles, 
  UserCheck 
} from 'lucide-react';

interface SpecialistCardProps {
  specialist: Specialist;
  onBook: (specialist: Specialist) => void;
  bookedCountForToday?: number;
}

export const SpecialistCard: React.FC<SpecialistCardProps> = ({ specialist, onBook, bookedCountForToday = 0 }) => {
  const { isDark } = useApp();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical':
        return <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />;
      case 'counseling':
        return <Brain className="w-3.5 h-3.5 text-blue-500" />;
      case 'legal':
        return <Scale className="w-3.5 h-3.5 text-amber-500" />;
      case 'barber':
        return <Scissors className="w-3.5 h-3.5 text-purple-500" />;
      case 'nutrition':
      default:
        return <Apple className="w-3.5 h-3.5 text-rose-500" />;
    }
  };

  const getCategoryBadgeClass = () => {
    return isDark 
      ? 'bg-[#181F2C] text-slate-300 border-slate-700/60' 
      : 'bg-[#F2F2F2] text-[#6D6E70] border-[#E5E5E5]';
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'medical':
        return 'پزشکی و طب کار';
      case 'counseling':
        return 'مشاوره روان‌شناسی';
      case 'legal':
        return 'مشاوره حقوقی';
      case 'barber':
        return 'پیرایش و آراستگی';
      case 'nutrition':
      default:
        return 'تغذیه و سلامت';
    }
  };

  return (
    <div className={`rounded-3xl border shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group ${
      isDark 
        ? 'bg-[#121622]/85 border-slate-700/60 hover:border-[#CF2F2F]/60 backdrop-blur-xl text-slate-100 shadow-black/40' 
        : 'bg-white border-[#E5E5E5] hover:border-[#CF2F2F]/40 shadow-xs'
    }`}>
      
      {/* Top Banner & Specialist Info */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          
          {/* Avatar with status indicator */}
          <div className="relative shrink-0">
            <img
              src={specialist.avatarUrl}
              alt={specialist.fullName}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 shadow-sm group-hover:scale-102 transition-transform ${
                isDark ? 'border-slate-700' : 'border-[#E5E5E5]'
              }`}
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white text-[9px]">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${getCategoryBadgeClass()}`}>
                {getCategoryIcon(specialist.category)}
                {getCategoryLabel(specialist.category)}
              </span>

              {/* Rating */}
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border ${
                isDark ? 'bg-[#181F2C] border-slate-700/60 text-slate-200' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
              }`}>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-mono">{toPersianDigits(specialist.rating)}</span>
                <span className={`text-[10px] font-normal ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>({toPersianDigits(specialist.reviewCount)})</span>
              </div>
            </div>

            <h3 className={`font-black text-base sm:text-lg mt-2 truncate group-hover:text-[#CF2F2F] transition-colors ${
              isDark ? 'text-white' : 'text-[#333333]'
            }`}>
              {specialist.fullName}
            </h3>
            
            <p className={`text-xs font-medium line-clamp-1 mt-0.5 ${
              isDark ? 'text-slate-300' : 'text-[#6D6E70]'
            }`}>
              {specialist.title}
            </p>
          </div>
        </div>

        {/* Specialty summary */}
        <p className={`text-xs mt-3.5 line-clamp-2 leading-relaxed p-3 rounded-2xl border ${
          isDark 
            ? 'bg-[#181F2C]/70 border-slate-700/50 text-slate-300' 
            : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#6D6E70]'
        }`}>
          {specialist.specialty}
        </p>

        {/* Info Grid (Room, Days, Duration) */}
        <div className={`mt-4 space-y-2.5 text-xs ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
          
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#CF2F2F] shrink-0" />
            <span className={`truncate font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>{specialist.roomNumber}</span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>({specialist.building})</span>
          </div>

          {/* Working Days & Attendance Badge */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className={`flex items-center gap-1 font-semibold ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                <Calendar className="w-3.5 h-3.5 text-[#CF2F2F]" />
                <span>روزهای حضور در شرکت:</span>
              </span>
              {specialist.workHoursStart && specialist.workHoursEnd && (
                <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                  ({toPersianDigits(specialist.workHoursStart)} تا {toPersianDigits(specialist.workHoursEnd)})
                </span>
              )}
            </div>

            {specialist.workingDays && specialist.workingDays.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {specialist.workingDays.map((day) => (
                  <span
                    key={day}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      isDark 
                        ? 'bg-rose-950/40 text-rose-300 border-rose-800/50' 
                        : 'bg-rose-50 text-[#CF2F2F] border-rose-200'
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 block">
                برنامه حضور ثبت نشده است
              </span>
            )}
          </div>

          <div className={`flex items-center justify-between pt-2 border-t ${
            isDark ? 'border-slate-700/50' : 'border-[#F2F2F2]'
          }`}>
            <div className="flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`} />
              <span>مدت هر ویزیت:</span>
              <strong className={`font-bold font-mono ${isDark ? 'text-white' : 'text-[#333333]'}`}>{toPersianDigits(specialist.consultationDurationMinutes)} دقیقه</strong>
            </div>

            <div className="flex items-center gap-1">
              <Phone className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`} />
              <span>داخلی:</span>
              <span className={`font-mono font-bold ${isDark ? 'text-amber-400' : 'text-[#333333]'}`}>{toPersianDigits(specialist.phoneExt)}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Footer Booking Action */}
      <div className={`p-4 border-t flex items-center justify-between gap-3 ${
        isDark ? 'bg-[#161B28]/90 border-slate-700/60' : 'bg-[#F8F8F8] border-[#E5E5E5]'
      }`}>
        <div className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
          <span>ظرفیت روزانه:</span>{' '}
          <strong className={`font-bold font-mono ${isDark ? 'text-white' : 'text-[#333333]'}`}>{toPersianDigits(specialist.dailyCapacity)} نوبت</strong>
        </div>

        <button
          onClick={() => onBook(specialist)}
          className="px-4 py-2 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-white" />
          <span>رزرو نوبت</span>
        </button>
      </div>

    </div>
  );
};
