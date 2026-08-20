import React, { useState, useRef } from 'react';
import { Specialist, SpecialistCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/dateUtils';
import { 
  X, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  User, 
  Stethoscope, 
  Brain, 
  Scale, 
  Scissors, 
  Apple, 
  MapPin, 
  Phone, 
  Clock, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Star,
  Sparkles,
  Camera
} from 'lucide-react';

interface EditSpecialistProfileModalProps {
  specialist: Specialist;
  onClose: () => void;
  onSaved?: (updated: Specialist) => void;
}

// Preset professional avatars for quick selection
const PRESET_AVATARS: { category: SpecialistCategory; label: string; url: string }[] = [
  {
    category: 'medical',
    label: 'پزشک آقا',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
  },
  {
    category: 'medical',
    label: 'پزشک خانم',
    url: 'https://images.unsplash.com/photo-1594824813576-621b19159938?w=400&auto=format&fit=crop&q=80',
  },
  {
    category: 'counseling',
    label: 'روانشناس خانم',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },
  {
    category: 'counseling',
    label: 'روانشناس آقا',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
  },
  {
    category: 'legal',
    label: 'وکیل پایه یک',
    url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
  },
  {
    category: 'barber',
    label: 'استاد پیرایش',
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80',
  },
  {
    category: 'nutrition',
    label: 'مشاور تغذیه خانم',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
  },
  {
    category: 'medical',
    label: 'متخصص طب کار',
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
  },
];

export const EditSpecialistProfileModal: React.FC<EditSpecialistProfileModalProps> = ({
  specialist,
  onClose,
  onSaved,
}) => {
  const { updateSpecialist, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [fullName, setFullName] = useState(specialist.fullName || '');
  const [title, setTitle] = useState(specialist.title || '');
  const [category, setCategory] = useState<SpecialistCategory>(specialist.category || 'medical');
  const [specialty, setSpecialty] = useState(specialist.specialty || '');
  const [roomNumber, setRoomNumber] = useState(specialist.roomNumber || '');
  const [building, setBuilding] = useState(specialist.building || '');
  const [phoneExt, setPhoneExt] = useState(specialist.phoneExt || '');
  const [bio, setBio] = useState(specialist.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(specialist.avatarUrl || '');
  const [consultationDurationMinutes, setConsultationDurationMinutes] = useState<number>(
    specialist.consultationDurationMinutes || 30
  );
  const [dailyCapacity, setDailyCapacity] = useState<number>(specialist.dailyCapacity || 8);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Handle local file upload (base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('حجم تصویر نباید بیشتر از ۲ مگابایت باشد.', 'error');
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          showToast('تصویر پرسنلی با موفقیت بارگذاری شد.', 'success');
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        showToast('خطا در خواندن فایل تصویر.', 'error');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setAvatarUrl(customUrlInput.trim());
      setCustomUrlInput('');
      showToast('آدرس اینترنتی تصویر اعمال شد.', 'success');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('لطفاً نام و نام خانوادگی را وارد کنید.', 'error');
      return;
    }
    if (!specialty.trim()) {
      showToast('لطفاً شرح تخصص را وارد کنید.', 'error');
      return;
    }

    const updatedSpecialist: Specialist = {
      ...specialist,
      fullName: fullName.trim(),
      title: title.trim(),
      category,
      specialty: specialty.trim(),
      roomNumber: roomNumber.trim(),
      building: building.trim(),
      phoneExt: phoneExt.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || specialist.avatarUrl,
      consultationDurationMinutes: Number(consultationDurationMinutes) || 30,
      dailyCapacity: Number(dailyCapacity) || 8,
    };

    updateSpecialist(updatedSpecialist);
    if (onSaved) {
      onSaved(updatedSpecialist);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#E5E5E5] text-right animate-scale-up flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-[#F8F8F8] border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#CF2F2F]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#333333]">
                ویرایش کامل پروفایل و تصویر متخصص
              </h3>
              <p className="text-xs text-[#6D6E70]">
                مدیریت مشخصات فردی، عکس، اتاق استقرار و اطلاعات سازمانی در مپنا
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-[#E5E5E5] text-[#6D6E70] flex items-center justify-center transition-colors border border-[#E5E5E5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm">
          
          {/* SECTION 1: AVATAR & PHOTO MANAGEMENT BENTO TILE */}
          <div className="p-5 rounded-2xl bg-[#F8F8F8] border border-[#E5E5E5] space-y-4">
            <h4 className="font-bold text-[#333333] flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4 text-[#CF2F2F]" />
              <span>تصویر و عکس پرسنلی متخصص</span>
            </h4>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              
              {/* Current Avatar Preview */}
              <div className="relative group shrink-0">
                <img
                  src={avatarUrl || specialist.avatarUrl}
                  alt={fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white shadow-md"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[11px] font-bold"
                >
                  <Upload className="w-5 h-5 mb-1" />
                  <span>تغییر تصویر</span>
                </button>
              </div>

              {/* Upload & URL Controls */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-[#F2F2F2] border border-[#E5E5E5] text-[#333333] font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#CF2F2F]" />
                    <span>{isUploading ? 'در حال بارگذاری...' : 'بارگذاری عکس از کامپیوتر'}</span>
                  </button>

                  <span className="text-[11px] text-[#6D6E70] self-center">
                    فرمت‌های مجاز: JPG، PNG (حداکثر ۲ مگابایت)
                  </span>
                </div>

                {/* Direct Image URL input */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="یا درج مستقیم آدرس اینترنتی تصویر (Image URL)..."
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-[#E5E5E5] bg-white text-xs text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#CF2F2F]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 py-2.5 rounded-xl bg-[#333333] hover:bg-[#1E293B] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    ثبت لینک
                  </button>
                </div>

                {/* Preset Avatars Selection */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-[#6D6E70] font-semibold block">
                    یا انتخاب سریع از میان تصاویر پرسنلی پیش‌فرض:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setAvatarUrl(preset.url)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                          avatarUrl === preset.url
                            ? 'bg-[#CF2F2F] text-white border-[#CF2F2F] font-bold shadow-xs'
                            : 'bg-white hover:bg-[#F2F2F2] text-[#6D6E70] border-[#E5E5E5]'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-5 h-5 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* SECTION 2: BASIC SPECIALIST INFORMATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">
                نام و نام خانوادگی متخصص <span className="text-[#CF2F2F]">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: دکتر علیرضا رادمنش"
                className="w-full p-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] text-[#333333]"
              />
            </div>

            {/* Title / Suffix */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">
                عنوان شغلی و سازمانی <span className="text-[#CF2F2F]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: متخصص طب کار و سلامت شغلی"
                className="w-full p-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] text-[#333333]"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">
                دسته‌بندی خدمت در سامانه مپنا <span className="text-[#CF2F2F]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SpecialistCategory)}
                className="w-full p-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] text-[#333333]"
              >
                <option value="medical">پزشکی و طب کار</option>
                <option value="counseling">مشاوره و روان‌شناسی</option>
                <option value="legal">مشاوره حقوقی</option>
                <option value="barber">پیرایش و آراستگی</option>
                <option value="nutrition">تغذیه و اصلاح سبک زندگی</option>
              </select>
            </div>

            {/* Phone Extension */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">
                شماره تلفن داخلی مپنا <span className="text-[#CF2F2F]">*</span>
              </label>
              <input
                type="text"
                required
                value={phoneExt}
                onChange={(e) => setPhoneExt(e.target.value)}
                placeholder="مثال: ۴۱۰۰"
                className="w-full p-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] text-[#333333] font-mono"
              />
            </div>

            {/* Room Number */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">
                شماره اتاق / درمانگاه / سالن <span className="text-[#CF2F2F]">*</span>
              </label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="مثال: اتاق ۱۰۴ (درمانگاه مرکزی)"
                className="w-full p-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] text-[#333333]"
              />
            </div>

            {/* Building */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">
                ساختمان و محل استقرار در مپنا <span className="text-[#CF2F2F]">*</span>
              </label>
              <input
                type="text"
                required
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="مثال: ساختمان ستاد مرکزی مپنا - طبقه همکف"
                className="w-full p-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] text-[#333333]"
              />
            </div>

          </div>

          {/* Specialty Description */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#333333]">
              تخصص و حوزه‌های ارائه خدمت <span className="text-[#CF2F2F]">*</span>
            </label>
            <input
              type="text"
              required
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="مثال: پایش سلامت سازمانی، بیماری‌های شغلی، مشاوره استرس، قراردادهای ملکی..."
              className="w-full p-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] text-[#333333]"
            />
          </div>

          {/* Biography & Professional Background */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#333333]">
              بیوگرافی و سوابق حرفه‌ای متخصص
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="شرح سوابق علمی، تجربی و زمینه‌های مشاوره برای آگاهی پرسنل مپنا..."
              className="w-full p-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] text-[#333333] leading-relaxed"
            />
          </div>

          {/* Consultation Settings: Duration & Daily Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8F8F8] border border-[#E5E5E5]">
            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">
                مدت زمان استاندارد هر نوبت (دقیقه)
              </label>
              <select
                value={consultationDurationMinutes}
                onChange={(e) => setConsultationDurationMinutes(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#E5E5E5] bg-white text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#CF2F2F]"
              >
                <option value={15}>۱۵ دقیقه</option>
                <option value={20}>۲۰ دقیقه</option>
                <option value={30}>۳۰ دقیقه (پیش‌فرض)</option>
                <option value={45}>۴۵ دقیقه</option>
                <option value={60}>۶۰ دقیقه (۱ ساعت)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">
                حداکثر ظرفیت پذیرش روزانه (نفر)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={dailyCapacity}
                onChange={(e) => setDailyCapacity(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#E5E5E5] bg-white text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] font-mono"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E5E5E5] text-[#6D6E70] hover:bg-[#F8F8F8] hover:text-[#333333] font-semibold transition-colors cursor-pointer"
            >
              انصراف
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-white" />
              <span>ذخیره تغییرات و به‌روزرسانی پروفایل</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
