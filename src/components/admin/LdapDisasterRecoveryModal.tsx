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
  ShieldCheck,
  ShieldAlert,
  Database,
  Download,
  Upload,
  Copy,
  Check,
  X,
  FileCode,
  FileJson,
  Server,
  Network,
  RefreshCw,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  Clock,
  KeyRound,
  FileText
} from 'lucide-react';

interface LdapDisasterRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LdapConfig;
  onRestoreConfig?: (newConfig: LdapConfig) => void;
}

export const LdapDisasterRecoveryModal: React.FC<LdapDisasterRecoveryModalProps> = ({
  isOpen,
  onClose,
  config,
  onRestoreConfig,
}) => {
  const { currentUser, showToast, adminTheme } = useApp();
  const isDark = adminTheme === 'dark';

  const [activeMode, setActiveMode] = useState<'export' | 'import'>('export');
  const [maskPassword, setMaskPassword] = useState(false);
  const [environment, setEnvironment] = useState<'PRODUCTION' | 'STAGING' | 'DISASTER_RECOVERY'>('PRODUCTION');
  const [adminNotes, setAdminNotes] = useState('پشتیبان‌گیری کامل از تنظیمات LDAP، پورت‌ها، نگاشت فیلدها و ساختار شبکه جهت بازیابی در شرایط بحران (Disaster Recovery)');
  const [isCopied, setIsCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<'summary' | 'json' | 'runbook'>('summary');

  // Import state
  const [importedJsonText, setImportedJsonText] = useState('');
  const [importedBackup, setImportedBackup] = useState<LdapDisasterRecoveryBackup | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate current backup object
  const currentBackup = generateLdapDisasterRecoveryBackup(config, {
    maskPassword,
    environment,
    notes: adminNotes,
    exportedByName: currentUser ? currentUser.fullName : 'مدیر ارشد زیرساخت و شبکه مپنا',
    exportedByRole: currentUser ? currentUser.role : 'Admin / Security Officer',
  });

  const jsonString = JSON.stringify(currentBackup, null, 2);

  const handleDownload = () => {
    downloadLdapDisasterRecoveryBackup(currentBackup);
    showToast('فایل پشتیبان JSON برای بازیابی اضطراری با موفقیت دانلود شد.', 'success');
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
      const content = event.target?.result as string;
      setImportedJsonText(content);
      validateAndSetImport(content);
    };
    reader.readAsText(file);
  };

  const validateAndSetImport = (text: string) => {
    setImportError(null);
    setImportSuccessMessage(null);

    const validation = validateLdapDisasterRecoveryJson(text);
    if (!validation.valid || !validation.backup) {
      setImportError(validation.error || 'ساختار فایل پشتیبان نامعتبر است.');
      setImportedBackup(null);
    } else {
      setImportedBackup(validation.backup);
      setImportSuccessMessage(`فایل پشتیبان با شناسه ${validation.backup.metadata.backupId} و نسخه ${validation.backup.metadata.version} با موفقیت تایید و بارگذاری گردید.`);
    }
  };

  const handleApplyRestore = () => {
    if (!importedBackup || !onRestoreConfig) return;

    if (window.confirm('آیا از بازیابی این فایل پشتیبان و جایگزینی کامل تنظیمات سرور LDAP و شبکه اطمینان دارید؟')) {
      onRestoreConfig(importedBackup.ldapConfiguration);
      showToast('تنظیمات LDAP و شبکه با موفقیت از روی فایل پشتیبان بازیابی گردید.', 'success');
      onClose();
    }
  };

  return (
    <div
      id="modal-ldap-disaster-recovery"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-4xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#151921] border-[#252C38] text-slate-100'
            : 'bg-white border-[#E5E5E5] text-[#333333]'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-5 sm:px-6 sm:py-5 border-b flex items-center justify-between ${
            isDark ? 'border-[#252C38] bg-[#1C222D]' : 'border-[#E5E5E5] bg-[#F8F8F8]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-[#CF2F2F] shrink-0">
              <ShieldAlert className="w-6 h-6 text-[#CF2F2F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-extrabold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                  پشتیبان‌گیری و بازیابی اضطراری (Disaster Recovery & JSON Backup)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#CF2F2F] text-white">
                  JSON v1.2
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                صدور و بازیابی نسخه پشتیبان کامل پیکربندی LDAP، دومین کنترلرها، نگاشت فیلدها و معماری شبکه
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-[#2D3542] hover:bg-[#252C38] text-slate-400 hover:text-white'
                : 'border-[#E5E5E5] hover:bg-[#E5E5E5] text-[#6D6E70] hover:text-black'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          className={`px-6 pt-3 border-b flex items-center gap-3 ${
            isDark ? 'border-[#252C38] bg-[#151921]' : 'border-[#E5E5E5] bg-white'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveMode('export')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeMode === 'export'
                ? 'border-[#CF2F2F] text-[#CF2F2F]'
                : isDark
                ? 'border-transparent text-slate-400 hover:text-slate-200'
                : 'border-transparent text-[#6D6E70] hover:text-[#333333]'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>خروجی و دانلود فایل پشتیبان (Export JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('import')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeMode === 'import'
                ? 'border-[#CF2F2F] text-[#CF2F2F]'
                : isDark
                ? 'border-transparent text-slate-400 hover:text-slate-200'
                : 'border-transparent text-[#6D6E70] hover:text-[#333333]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>بارگذاری و بازیابی از فایل (Restore JSON)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeMode === 'export' ? (
            <>
              {/* Configuration Controls Bar */}
              <div
                className={`p-4 rounded-2xl border space-y-4 ${
                  isDark ? 'bg-[#1C222D] border-[#2D3542]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Environment selection */}
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                      محیط هدف استقرار:
                    </label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value as any)}
                      className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                        isDark ? 'bg-[#151921] border-[#2D3542] text-slate-200' : 'bg-white border-[#E5E5E5] text-[#333333]'
                      }`}
                    >
                      <option value="PRODUCTION">محیط عملیاتی اصلی (Production)</option>
                      <option value="DISASTER_RECOVERY">سایت پشتیبان بحران (Disaster Recovery Site)</option>
                      <option value="STAGING">محیط آزمایشی و تست (Staging / Lab)</option>
                    </select>
                  </div>

                  {/* Password Masking Option */}
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                      حفاظت از کلمه عبور Bind:
                    </label>
                    <button
                      type="button"
                      onClick={() => setMaskPassword(!maskPassword)}
                      className={`w-full text-xs px-3 py-2 rounded-xl border flex items-center justify-between transition-colors ${
                        maskPassword
                          ? isDark
                            ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                            : 'bg-amber-50 border-amber-200 text-amber-900'
                          : isDark
                          ? 'bg-[#151921] border-[#2D3542] text-slate-300'
                          : 'bg-white border-[#E5E5E5] text-[#333333]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {maskPassword ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{maskPassword ? 'ماسک کردن با ستاره (امن)' : 'ذخیره کامل رمز عبور'}</span>
                      </span>
                      <span className="text-[10px] font-bold underline">تغییر</span>
                    </button>
                  </div>

                  {/* Integrity Checksum Display */}
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                      چک‌سام اعتبارسنجی امنیتی:
                    </label>
                    <div
                      className={`text-[11px] font-mono px-3 py-2 rounded-xl border truncate ${
                        isDark ? 'bg-[#151921] border-[#2D3542] text-emerald-400' : 'bg-white border-[#E5E5E5] text-emerald-700'
                      }`}
                      title={currentBackup.metadata.checksum}
                    >
                      {currentBackup.metadata.checksum}
                    </div>
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                    توضیحات و شناسه نسخه پشتیبان (Disaster Recovery Notes):
                  </label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                      isDark ? 'bg-[#151921] border-[#2D3542] text-slate-200' : 'bg-white border-[#E5E5E5] text-[#333333]'
                    }`}
                  />
                </div>
              </div>

              {/* Preview Mode Selector Tabs */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPreviewTab('summary')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    previewTab === 'summary'
                      ? 'bg-[#CF2F2F] text-white shadow-xs'
                      : isDark
                      ? 'bg-[#1C222D] text-slate-400 hover:text-white'
                      : 'bg-[#F2F2F2] text-[#6D6E70] hover:text-black'
                  }`}
                >
                  خلاصه محتوای پشتیبان
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('json')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    previewTab === 'json'
                      ? 'bg-[#CF2F2F] text-white shadow-xs'
                      : isDark
                      ? 'bg-[#1C222D] text-slate-400 hover:text-white'
                      : 'bg-[#F2F2F2] text-[#6D6E70] hover:text-black'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>مشاهده کد JSON خام ({jsonString.split('\n').length} خط)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('runbook')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    previewTab === 'runbook'
                      ? 'bg-[#CF2F2F] text-white shadow-xs'
                      : isDark
                      ? 'bg-[#1C222D] text-slate-400 hover:text-white'
                      : 'bg-[#F2F2F2] text-[#6D6E70] hover:text-black'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>دستورالعمل بازیابی اضطراری (Runbook)</span>
                </button>
              </div>

              {/* View 1: Summary Cards */}
              {previewTab === 'summary' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {/* Card 1: Server Config */}
                  <div
                    className={`p-4 rounded-2xl border space-y-2.5 ${
                      isDark ? 'bg-[#1C222D] border-[#2D3542]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-[#CF2F2F]">
                      <Server className="w-4 h-4" />
                      <span>مشخصات سرور و احراز هویت</span>
                    </div>
                    <div className={`space-y-1.5 ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                      <div className="flex justify-between">
                        <span>سرور اصلی (DC01):</span>
                        <span className="font-mono font-bold text-slate-200">{config.serverHost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>پورت و پروتکل:</span>
                        <span className="font-mono font-bold text-slate-200">{config.port} / {config.protocol.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>سرور رزرو (DC02):</span>
                        <span className="font-mono text-slate-200">dc02.mapnagroup.ir</span>
                      </div>
                      <div className="flex justify-between">
                        <span>حساب سرویس (Bind):</span>
                        <span className="font-mono text-[11px] truncate max-w-[150px] text-slate-200">{config.bindDn}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Network Topology */}
                  <div
                    className={`p-4 rounded-2xl border space-y-2.5 ${
                      isDark ? 'bg-[#1C222D] border-[#2D3542]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-emerald-600">
                      <Network className="w-4 h-4" />
                      <span>پیکربندی شبکه و سگمنت</span>
                    </div>
                    <div className={`space-y-1.5 ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                      <div className="flex justify-between">
                        <span>اینترفیس شبکه:</span>
                        <span className="font-mono text-slate-200">eth0 (10GbE)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>شناسه شبکه VLAN:</span>
                        <span className="font-mono font-bold text-slate-200">110</span>
                      </div>
                      <div className="flex justify-between">
                        <span>سرورهای DNS سازمانی:</span>
                        <span className="font-mono text-slate-200">{config.dnsServers?.join(', ') || '10.10.1.10'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>پروتکل امنیتی:</span>
                        <span className="font-mono text-slate-200">{config.sslValidation === 'corporate_ca' ? 'MAPNA CA' : 'Strict TLS'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Directory Structure & Attributes */}
                  <div
                    className={`p-4 rounded-2xl border space-y-2.5 ${
                      isDark ? 'bg-[#1C222D] border-[#2D3542]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-blue-600">
                      <Database className="w-4 h-4" />
                      <span>شاخه Base DN و نگاشت فیلدها</span>
                    </div>
                    <div className={`space-y-1.5 ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                      <div className="flex justify-between">
                        <span>پایگاه ریشه (Base DN):</span>
                        <span className="font-mono text-[11px] truncate max-w-[150px] text-slate-200">{config.baseDn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>شاخه پرسنلی مپنا:</span>
                        <span className="font-mono text-[11px] truncate max-w-[150px] text-slate-200">{config.userSearchBase}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>فیلتر جستجوی کاربر:</span>
                        <span className="font-mono text-[11px] truncate max-w-[150px] text-slate-200">{config.userFilter}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>تعداد فیلدهای نگاشت:</span>
                        <span className="font-bold text-emerald-500">{Object.keys(currentBackup.attributeMappings || {}).length} ویژگی هویتی</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View 2: Raw JSON Preview */}
              {previewTab === 'json' && (
                <div className="relative">
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border shadow-xs ${
                        isCopied
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : isDark
                          ? 'bg-[#151921] text-slate-200 border-[#2D3542] hover:bg-[#252C38]'
                          : 'bg-white text-[#333333] border-[#E5E5E5] hover:bg-[#F8F8F8]'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'کپی شد!' : 'کپی JSON'}</span>
                    </button>
                  </div>

                  <pre
                    dir="ltr"
                    className={`p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72 border leading-relaxed ${
                      isDark
                        ? 'bg-[#0B0F17] text-emerald-400 border-[#252C38]'
                        : 'bg-[#1E1E1E] text-emerald-300 border-[#333333]'
                    }`}
                  >
                    {jsonString}
                  </pre>
                </div>
              )}

              {/* View 3: Disaster Recovery Runbook */}
              {previewTab === 'runbook' && (
                <div
                  className={`p-4 rounded-2xl border space-y-4 text-xs ${
                    isDark ? 'bg-[#1C222D] border-[#2D3542]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-amber-500">
                    <ShieldCheck className="w-4 h-4" />
                    <span>مراحل بازیابی سریع در شرایط بحران (Disaster Recovery Runbook):</span>
                  </div>

                  <div className="space-y-2">
                    {currentBackup.disasterRecoveryRunbook.recoverySteps.map((step, idx) => (
                      <div key={idx} className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#151921] border-[#2D3542]' : 'bg-white border-[#E5E5E5]'}`}>
                        <span className="font-semibold">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Mode: Import & Restore */
            <div className="space-y-4">
              {/* File Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
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
                <FileCode className="w-10 h-10 mx-auto text-[#CF2F2F] mb-2" />
                <h4 className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                  انتخاب یا رها کردن فایل پشتیبان JSON
                </h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                  فایل پشتیبان رسمی مپنا با پسوند <span className="font-mono font-bold text-[#CF2F2F]">.json</span> را انتخاب فرمایید.
                </p>
              </div>

              {/* Paste JSON Manually */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                  یا چسباندن (Paste) مستقیم متن JSON پشتیبان:
                </label>
                <textarea
                  dir="ltr"
                  rows={6}
                  value={importedJsonText}
                  onChange={(e) => {
                    setImportedJsonText(e.target.value);
                    validateAndSetImport(e.target.value);
                  }}
                  placeholder='{"metadata": {"format": "MAPNA_LDAP_DISASTER_RECOVERY_JSON", ...}}'
                  className={`w-full font-mono text-[11px] p-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                    isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-100 placeholder:text-slate-600' : 'bg-white border-[#E5E5E5] text-[#333333]'
                  }`}
                />
              </div>

              {/* Validation Feedback */}
              {importError && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  isDark ? 'bg-rose-950/40 border-rose-800/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccessMessage && importedBackup && (
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{importSuccessMessage}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded-lg bg-black/10">
                      <span className="opacity-75">سرور LDAP:</span>
                      <p className="font-mono font-bold">{importedBackup.ldapConfiguration.serverHost}:{importedBackup.ldapConfiguration.port}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-black/10">
                      <span className="opacity-75">پروتکل:</span>
                      <p className="font-mono font-bold">{importedBackup.ldapConfiguration.protocol.toUpperCase()}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-black/10">
                      <span className="opacity-75">تاریخ تهیه:</span>
                      <p className="font-bold">{importedBackup.metadata.exportedAtShamsi?.split(' - ')[0] || 'معتبر'}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-black/10">
                      <span className="opacity-75">محیط استقرار:</span>
                      <p className="font-bold">{importedBackup.metadata.systemInfo?.environment || 'PROD'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 sm:px-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark ? 'border-[#252C38] bg-[#1C222D]' : 'border-[#E5E5E5] bg-[#F8F8F8]'
          }`}
        >
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
            شناسه یکتای پشتیبان: <strong className="font-mono text-rose-500">{currentBackup.metadata.backupId}</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                isDark
                  ? 'border-[#2D3542] hover:bg-[#252C38] text-slate-300'
                  : 'border-[#E5E5E5] hover:bg-[#E5E5E5] text-[#6D6E70]'
              }`}
            >
              انصراف و بستن
            </button>

            {activeMode === 'export' ? (
              <>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-[#151921] border-[#2D3542] text-slate-200 hover:bg-[#252C38]'
                      : 'bg-white border-[#E5E5E5] text-[#333333] hover:bg-[#F2F2F2]'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-5 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود فایل پشتیبان (.JSON)</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={!importedBackup}
                onClick={handleApplyRestore}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>اعمال و بازیابی فوری در سامانه</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
