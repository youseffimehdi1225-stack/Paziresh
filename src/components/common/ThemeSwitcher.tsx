import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeSwitcherProps {
  variant?: 'pill' | 'compact' | 'toggle-button';
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { theme, setTheme, toggleTheme, isDark } = useApp();

  if (variant === 'compact') {
    return (
      <button
        id="btn-toggle-theme-compact"
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'تغییر به تم روشن (روز)' : 'تغییر به تم تاریک و شیشه‌ای (شب)'}
        title={isDark ? 'تغییر به تم روشن (روز)' : 'تغییر به تم تاریک و شیشه‌ای (کاهش خستگی چشم)'}
        className={`p-2 sm:px-2.5 sm:py-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer border ${
          isDark
            ? 'bg-[#151B26]/80 hover:bg-[#1E2638] text-amber-400 border-slate-700/60 backdrop-blur-md shadow-md shadow-black/20'
            : 'bg-[#F8F8F8] hover:bg-[#EAEAEA] text-[#6D6E70] hover:text-[#333333] border-[#E5E5E5]'
        } ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="hidden xl:inline text-xs font-bold text-amber-300">تم شب (فعال)</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-[#333333]" />
            <span className="hidden xl:inline text-xs font-medium text-[#6D6E70]">حالت تاریک</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'toggle-button') {
    return (
      <button
        id="btn-toggle-theme"
        type="button"
        onClick={toggleTheme}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-xs ${
          isDark
            ? 'bg-[#151B26]/80 hover:bg-[#1E2638] text-slate-100 border-slate-700/60 backdrop-blur-md'
            : 'bg-white hover:bg-[#F8F8F8] text-[#333333] border-[#E5E5E5]'
        } ${className}`}
      >
        <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
          isDark ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-100 text-slate-700'
        }`}>
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </div>
        <span>{isDark ? 'حالت روز (Light Mode)' : 'حالت تاریک و شیشه‌ای (Dark Mode)'}</span>
      </button>
    );
  }

  // Segmented dual pill
  return (
    <div
      id="theme-segmented-switcher"
      className={`inline-flex items-center p-1 rounded-2xl border transition-all ${
        isDark
          ? 'bg-[#10141D]/90 border-slate-700/60 backdrop-blur-md'
          : 'bg-[#F1F3F5] border-[#E5E5E5]'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
          !isDark
            ? 'bg-white text-[#333333] shadow-xs border border-[#E5E5E5]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }`}
      >
        <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500' : 'text-slate-400'}`} />
        <span>تم روز</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
          isDark
            ? 'bg-[#1C2433] text-white shadow-xs border border-slate-700/60 font-extrabold'
            : 'text-[#6D6E70] hover:text-[#333333] hover:bg-white/50'
        }`}
      >
        <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-[#6D6E70]'}`} />
        <span>تم شب (شیشه‌ای)</span>
        {isDark && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        )}
      </button>
    </div>
  );
};
