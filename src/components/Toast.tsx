import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, hideToast } = useApp();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-500 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100',
    error: 'border-rose-500/40 bg-rose-950/90 text-rose-100',
    info: 'border-cyan-500/40 bg-slate-900/95 text-slate-100',
  };

  return (
    <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-bounce-short">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md ${borderColors[toastMessage.type]}`}
      >
        {icons[toastMessage.type]}
        <div className="flex-1 text-sm font-medium leading-relaxed">
          {toastMessage.text}
        </div>
        <button
          onClick={hideToast}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
