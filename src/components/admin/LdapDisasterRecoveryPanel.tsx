import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { LdapConfig, LdapLogEntry } from '../../types';
import { toPersianDigits } from '../../utils/dateUtils';
import {
  generateLdapDisasterRecoveryBackup,
  downloadLdapDisasterRecoveryBackup,
  validateLdapDisasterRecoveryJson,
  LdapDisasterRecoveryBackup,
} from '../../utils/ldapBackupManager';
import {
  ShieldAlert,
  ShieldCheck,
  Download,
  Upload,
  Copy,
  Check,
  FileCode,
  FileJson,
  Server,
  Network,
  RefreshCw,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  Database,
  FileText,
  Activity,
  Layers,
  ArrowRightLeft,
  Sliders,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';

interface LdapDisasterRecoveryPanelProps {
  config: LdapConfig;
  onRestoreConfig: (restoredConfig: LdapConfig) => void;
}

export const LdapDisasterRecoveryPanel: React.FC<LdapDisasterRecoveryPanelProps> = ({
  config,
  onRestoreConfig,
}) => {
  const { currentUser, showToast, adminTheme } = useApp();
  const isDark = adminTheme === 'dark';

  const [maskPassword, setMaskPassword] = useState(false);
  const [environment, setEnvironment] = useState<'PRODUCTION' | 'STAGING' | 'DISASTER_RECOVERY'>('PRODUCTION');
  const [adminNotes, setAdminNotes] = useState('پشتیبان جامع تنظیمات LDAP، پورت‌ها، نگاشت صفات و پیکربندی شبکه مپنا');
  const [isCopied, setIsCopied] = useState(false);
  const [showJsonTree, setShowJsonTree] = useState(false);

  // Restore State
  const [uploadedJsonText, setUploadedJsonText] = useState('');
  const [parsedBackup, setParsedBackup] = useState<LdapDisasterRecoveryBackup | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current Backup Object
  const currentBackup = generateLdapDisasterRecoveryBackup(config, {
    maskPassword,
    environment,
    notes: adminNotes,
    exportedByName: currentUser?.fullName || 'مدیر ارشد زیرساخت مپنا',
    exportedByRole: currentUser?.role || 'Admin',
  });

  const jsonString = JSON.stringify(currentBackup, null, 2);

  const handleDownloadBackup = () => {
    downloadLdapDisasterRecoveryBackup(currentBackup);
    showToast('فایل پشتیبان JSON برای بازیابی در شرایط بحران (Disaster Recovery) با موفقیت دانلود شد.', 'success');
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setIsCopied(true);
    showToast('ساختار کامل JSON پشتیبان در کلیپ‌بورد کپی شد.', 'info');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUploadedJsonText(text);
      handleValidate(text);
    };
    reader.readAsText(file);
  };

  const handleValidate = (text: string) => {
    setValidationError(null);
    setParsedBackup(null);

    const result = validateLdapDisasterRecoveryJson(text);
    if (!result.valid || !result.backup) {
      setValidationError(result.error || 'ساختار فایل پشتیبان نامعتبر است.');
    } else {
      setParsedBackup(result.backup);
      showToast('فایل پشتیبان با موفقیت اعتبارسنجی شد.', 'success');
    }
  };

  const handleExecuteRestore = () => {
    if (!parsedBackup) return;

    if (window.confirm('آیا از بازنشانی کامل تنظیمات LDAP و شبکه به مشخصات این فایل پشتیبان اطمینان دارید؟')) {
      setIsApplying(true);
      setTimeout(() => {
        onRestoreConfig(parsedBackup.ldapConfiguration);
        setIsApplying(false);
        setParsedBackup(null);
        setUploadedJsonText('');
        showToast('پیکربندی سرور LDAP و شبکه با موفقیت از فایل پشتیبان بازیابی گردید.', 'success');
      }, 500);
    }
  };

  return (
    <div id="ldap-disaster-recovery-section" className="space-y-6">
      
      {/* Top Banner */}
      <div className={`p-6 rounded-3xl border shadow-xs transition-colors ${
        isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-linear-to-r from-red-50 to-white border-[#E5E5E5]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-[#CF2F2F] text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#CF2F2F] text-white">
                  مدیریت تداوم کسب‌وکار و بازیابی فاجعه (Disaster Recovery)
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${
                  isDark ? 'bg-[#1E2430] border-[#2D3542] text-slate-300' : 'bg-white border-[#E5E5E5] text-[#333333]'
                }`}>
                  پروتکل JSON Schema v1.2
                </span>
              </div>
              <h3 className={`text-lg sm:text-xl font-extrabold mt-1.5 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                پشتیبان‌گیری اضطراری و بازیابی پیکربندی LDAP و شبکه مپنا
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                تهیه نسخه پشتیبان با تمامی تنظیمات هاست، پورت، نگاشت صفات هویتی، توپولوژی شبکه، چک‌سام اعتبارسنجی و قابلیت بازیابی فوری با یک کلیک
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyJson}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                isCopied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : isDark
                  ? 'bg-[#1C222D] border-[#2D3542] text-slate-200 hover:bg-[#252C38]'
                  : 'bg-white border-[#E5E5E5] text-[#333333] hover:bg-[#F8F8F8]'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{isCopied ? 'کپی شد!' : 'کپی ساختار JSON'}</span>
            </button>

            <button
              id="btn-dr-quick-download"
              type="button"
              onClick={handleDownloadBackup}
              className="px-5 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>دانلود فایل پشتیبان JSON</span>
            </button>
          </div>
        </div>

        {/* Live Integrity & Topology Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-800 text-xs">
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#1C222D] border-[#252C38]' : 'bg-white border-[#E5E5E5]'}`}>
            <span className={`text-[11px] block ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>شناسه یکتای پشتیبان (Backup ID)</span>
            <strong className="font-mono text-rose-500 text-xs block mt-0.5 truncate">{currentBackup.metadata.backupId}</strong>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#1C222D] border-[#252C38]' : 'bg-white border-[#E5E5E5]'}`}>
            <span className={`text-[11px] block ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>کد بررسی صحت داده (Checksum)</span>
            <strong className="font-mono text-emerald-500 text-xs block mt-0.5 truncate">{currentBackup.metadata.checksum}</strong>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#1C222D] border-[#252C38]' : 'bg-white border-[#E5E5E5]'}`}>
            <span className={`text-[11px] block ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>گره سرورهای تحت پوشش</span>
            <strong className={`text-xs block mt-0.5 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>DC01 (اصلی) + DC02 (رزرو)</strong>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#1C222D] border-[#252C38]' : 'bg-white border-[#E5E5E5]'}`}>
            <span className={`text-[11px] block ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>شاخص نگاشت صفات هویتی</span>
            <strong className="text-blue-500 text-xs block mt-0.5">{toPersianDigits(Object.keys(currentBackup.attributeMappings || {}).length)} فیلد استاندارد سازمانی</strong>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Export Configurator (Col 1) & Restore Dropzone (Col 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column 1: Export Settings & Options */}
        <div className={`p-6 rounded-3xl border shadow-xs space-y-5 transition-colors ${
          isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2.5 font-bold text-base text-[#CF2F2F]">
              <Download className="w-5 h-5" />
              <h4 className={isDark ? 'text-white' : 'text-[#333333]'}>تنظیمات خروجی فایل پشتیبان اضطراری</h4>
            </div>
            <span className="text-xs text-[#6D6E70]">Disaster Recovery Export</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Target Environment */}
            <div>
              <label className={`block font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                محیط عملیاتی هدف (Target Environment):
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                  isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-100' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
                }`}
              >
                <option value="PRODUCTION">سایت عملیاتی مرکزی مپنا (Production Datacenter)</option>
                <option value="DISASTER_RECOVERY">سایت بحران و دیتاسنتر ثانویه (Disaster Recovery Site)</option>
                <option value="STAGING">محیط تست و لابراتوار ارزیابی (Staging Lab)</option>
              </select>
            </div>

            {/* Password Masking Switch */}
            <div>
              <label className={`block font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                امنیت کلمه عبور حساب سرویس بایند (Bind Password Protection):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMaskPassword(false)}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    !maskPassword
                      ? isDark
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300 font-bold'
                        : 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                      : isDark
                      ? 'bg-[#1C222D] border-[#2D3542] text-slate-400'
                      : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#6D6E70]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-emerald-500" />
                    <span>ذخیره با رمز کامل (بازیابی خودکار)</span>
                  </div>
                  {!maskPassword && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </button>

                <button
                  type="button"
                  onClick={() => setMaskPassword(true)}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    maskPassword
                      ? isDark
                        ? 'bg-amber-950/40 border-amber-600 text-amber-300 font-bold'
                        : 'bg-amber-50 border-amber-600 text-amber-900 font-bold'
                      : isDark
                      ? 'bg-[#1C222D] border-[#2D3542] text-slate-400'
                      : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#6D6E70]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span>ماسک کردن کلمه عبور (امن)</span>
                  </div>
                  {maskPassword && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                </button>
              </div>
            </div>

            {/* Notes Input */}
            <div>
              <label className={`block font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                یادداشت ادمین و شرح تغییرات (Disaster Recovery Notes):
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] resize-none ${
                  isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-100' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
                }`}
              />
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowJsonTree(!showJsonTree)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark ? 'border-[#2D3542] text-slate-300 hover:bg-[#1C222D]' : 'border-[#E5E5E5] text-[#6D6E70] hover:bg-gray-100'
              }`}
            >
              <FileJson className="w-4 h-4 text-rose-500" />
              <span>{showJsonTree ? 'بستن پیش‌نمایش کد' : 'مشاهده ساختار داده JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadBackup}
              className="px-5 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>دریافت فایل پشتیبان اضطراری</span>
            </button>
          </div>
        </div>

        {/* Column 2: Restore from Backup File */}
        <div className={`p-6 rounded-3xl border shadow-xs space-y-5 transition-colors ${
          isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2.5 font-bold text-base text-emerald-600">
              <Upload className="w-5 h-5" />
              <h4 className={isDark ? 'text-white' : 'text-[#333333]'}>بازیابی پیکربندی از فایل پشتیبان (Restore)</h4>
            </div>
            <span className="text-xs text-[#6D6E70]">Disaster Recovery Restore</span>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              isDark
                ? 'border-[#2D3542] hover:border-[#CF2F2F] bg-[#1C222D]'
                : 'border-[#CCCCCC] hover:border-[#CF2F2F] bg-[#F8F8F8]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <FileCode className="w-9 h-9 mx-auto text-[#CF2F2F] mb-1.5" />
            <h5 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
              انتخاب یا رها کردن فایل پشتیبان JSON
            </h5>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
              فرمت پشتیبان مپنا (mapna_ldap_disaster_recovery_backup_*.json)
            </p>
          </div>

          {/* Validation Feedback or Diff Card */}
          {validationError && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              isDark ? 'bg-rose-950/40 border-rose-800/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {parsedBackup && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>فایل پشتیبان با موفقیت شناسایی و تایید شد</span>
                </div>
                <span className="font-mono text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-md">
                  {parsedBackup.metadata.backupId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-black/10">
                  <span className="opacity-75">هاست و پورت سرور:</span>
                  <p className="font-mono font-bold">{parsedBackup.ldapConfiguration.serverHost}:{parsedBackup.ldapConfiguration.port}</p>
                </div>
                <div className="p-2 rounded-lg bg-black/10">
                  <span className="opacity-75">پروتکل و امنیت:</span>
                  <p className="font-mono font-bold">{parsedBackup.ldapConfiguration.protocol.toUpperCase()}</p>
                </div>
                <div className="p-2 rounded-lg bg-black/10">
                  <span className="opacity-75">Base DN ریشه:</span>
                  <p className="font-mono text-[10px] truncate">{parsedBackup.ldapConfiguration.baseDn}</p>
                </div>
                <div className="p-2 rounded-lg bg-black/10">
                  <span className="opacity-75">تعداد نگاشت فیلدها:</span>
                  <p className="font-bold">{Object.keys(parsedBackup.attributeMappings || {}).length} صفت هویتی</p>
                </div>
              </div>

              <button
                id="btn-dr-confirm-restore"
                type="button"
                disabled={isApplying}
                onClick={handleExecuteRestore}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>در حال بازیابی و بازنشانی تنظیمات...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>اعمال و بازنشانی فوری تنظیمات در سامانه</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Paste JSON manually textarea */}
          {!parsedBackup && (
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-[#333333]'}`}>
                یا چسباندن (Paste) مستقیم کدهای JSON پشتیبان:
              </label>
              <textarea
                dir="ltr"
                rows={3}
                value={uploadedJsonText}
                onChange={(e) => {
                  setUploadedJsonText(e.target.value);
                  if (e.target.value.trim().length > 10) {
                    handleValidate(e.target.value);
                  }
                }}
                placeholder='{"metadata": {"format": "MAPNA_LDAP_DISASTER_RECOVERY_JSON", ...}}'
                className={`w-full font-mono text-[11px] p-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                  isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-100 placeholder:text-slate-600' : 'bg-white border-[#E5E5E5] text-[#333333]'
                }`}
              />
            </div>
          )}
        </div>

      </div>

      {/* Collapsible JSON Preview Code Block */}
      {showJsonTree && (
        <div className={`p-6 rounded-3xl border shadow-xs space-y-3 transition-colors ${
          isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-xs">
              <FileCode className="w-4 h-4 text-emerald-500" />
              <span className={isDark ? 'text-white' : 'text-[#333333]'}>نمای ساختار داده خام JSON جهت ممیزی امنیتی</span>
            </div>
            <button
              type="button"
              onClick={handleCopyJson}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                isDark ? 'border-[#2D3542] text-slate-200 hover:bg-[#1C222D]' : 'border-[#E5E5E5] text-[#333333] hover:bg-[#F8F8F8]'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>کپی محتوا</span>
            </button>
          </div>

          <pre
            dir="ltr"
            className={`p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-80 border leading-relaxed ${
              isDark
                ? 'bg-[#0B0F17] text-emerald-400 border-[#252C38]'
                : 'bg-[#1E1E1E] text-emerald-300 border-[#333333]'
            }`}
          >
            {jsonString}
          </pre>
        </div>
      )}

      {/* Disaster Recovery Runbook Checklist Card */}
      <div className={`p-6 rounded-3xl border shadow-xs space-y-4 transition-colors ${
        isDark ? 'bg-[#151921] border-[#252C38]' : 'bg-white border-[#E5E5E5]'
      }`}>
        <div className="flex items-center gap-2.5 font-bold text-sm text-amber-500">
          <ShieldCheck className="w-5 h-5" />
          <h4 className={isDark ? 'text-white' : 'text-[#333333]'}>
            دستورالعمل و چک‌لیست بازیابی اضطراری مپنا (Disaster Recovery Runbook)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {currentBackup.disasterRecoveryRunbook.recoverySteps.map((step, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                isDark ? 'bg-[#1C222D] border-[#252C38] text-slate-200' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
              }`}
            >
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center shrink-0 text-xs">
                {toPersianDigits(idx + 1)}
              </span>
              <p className="font-semibold leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
