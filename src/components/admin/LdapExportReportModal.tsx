import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LdapConfig, LdapLogEntry } from '../../types';
import { toPersianDigits } from '../../utils/dateUtils';
import { exportLdapToExcel, exportLdapToPdf, LdapReportData } from '../../utils/ldapReportExporter';
import {
  generateLdapDisasterRecoveryBackup,
  downloadLdapDisasterRecoveryBackup,
} from '../../utils/ldapBackupManager';
import {
  FileSpreadsheet,
  FileText,
  FileJson,
  Printer,
  Download,
  CheckCircle2,
  X,
  ShieldCheck,
  Activity,
  Layers,
  Clock,
  Server,
  Calendar,
  Sparkles,
  Check,
  ShieldAlert
} from 'lucide-react';

interface LdapExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LdapConfig;
  logs: LdapLogEntry[];
  currentLatency?: number;
  activePool?: number;
  totalAuth?: number;
}

export const LdapExportReportModal: React.FC<LdapExportReportModalProps> = ({
  isOpen,
  onClose,
  config,
  logs,
  currentLatency = 38,
  activePool = 18,
  totalAuth = 3205
}) => {
  const { currentUser, showToast, adminTheme } = useApp();
  const isDark = adminTheme === 'dark';

  const [format, setFormat] = useState<'excel' | 'pdf' | 'json'>('excel');
  const [includeLogs, setIncludeLogs] = useState(true);
  const [includeNodes, setIncludeNodes] = useState(true);
  const [includeLatencyTrend, setIncludeLatencyTrend] = useState(true);
  const [includeHourlyAuth, setIncludeHourlyAuth] = useState(true);
  const [reportTitle, setReportTitle] = useState('گزارش وضعیت و مانیتورینگ سلامت سرویس‌های LDAP و شبکه سازمانی مپنا');
  const [adminNotes, setAdminNotes] = useState('کلیه سرویس‌های احراز هویت سازمانی، پروتکل LDAPS و ارتباط با Domain Controller در وضعیت پایدار و نرمال قرار دارند.');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const getReportPayload = (): LdapReportData => {
    const now = new Date();
    const timeShamsi = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const dateShamsi = `چهارشنبه ۲۸ مرداد ۱۴۰۵ - ${timeShamsi}`;

    return {
      config,
      logs: includeLogs ? logs : [],
      summary: {
        currentLatency,
        activePool,
        totalAuth,
        uptime: 99.98,
        generatedAtShamsi: dateShamsi,
        generatedAtIso: now.toISOString().replace('T', ' ').slice(0, 19),
        generatedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'ادمین ارشد سیستم',
      },
      nodes: [
        {
          name: 'DC01.mapnagroup.ir',
          role: 'دومین کنترلر اصلی (Primary LDAP / KDC)',
          ip: '192.168.10.25',
          port: 636,
          protocol: 'LDAPS (TLS 1.3)',
          status: 'healthy',
          latency: currentLatency,
          uptime: 99.98,
          packetLoss: 0,
        },
        {
          name: 'DC02.mapnagroup.ir',
          role: 'دومین کنترلر رزرو (Secondary LDAP / Backup)',
          ip: '192.168.10.26',
          port: 636,
          protocol: 'LDAPS (TLS 1.3)',
          status: 'healthy',
          latency: currentLatency + 4,
          uptime: 99.95,
          packetLoss: 0,
        },
        {
          name: 'DNS-Core-01',
          role: 'سرور نام دامنه داخلی مپنا',
          ip: '10.10.1.10',
          port: 53,
          protocol: 'DNS / UDP',
          status: 'healthy',
          latency: 4,
          uptime: 100,
          packetLoss: 0,
        },
        {
          name: 'Proxy-GW.mapna',
          role: 'دروازه شبکه و پروکسی اینترانت',
          ip: '192.168.10.1',
          port: 8080,
          protocol: 'HTTP Proxy',
          status: 'healthy',
          latency: 2,
          uptime: 99.99,
          packetLoss: 0,
        },
      ],
      latencyTrend: [
        { time: '۰۸:۰۰', latencyDc1: 34, latencyDc2: 38, dnsLookupTime: 4 },
        { time: '۰۸:۱۵', latencyDc1: 38, latencyDc2: 42, dnsLookupTime: 5 },
        { time: '۰۸:۳۰', latencyDc1: 45, latencyDc2: 49, dnsLookupTime: 6 },
        { time: '۰۸:۴۵', latencyDc1: 52, latencyDc2: 56, dnsLookupTime: 7 },
        { time: '۰۹:۰۰', latencyDc1: 42, latencyDc2: 46, dnsLookupTime: 4 },
        { time: '۰۹:۱۵', latencyDc1: 39, latencyDc2: 43, dnsLookupTime: 5 },
        { time: '۰۹:۳۰', latencyDc1: 48, latencyDc2: 51, dnsLookupTime: 6 },
        { time: '۰۹:۴۵', latencyDc1: 41, latencyDc2: 45, dnsLookupTime: 4 },
        { time: '۱۰:۰۰', latencyDc1: 36, latencyDc2: 40, dnsLookupTime: 4 },
        { time: '۱۰:۱۵', latencyDc1: 44, latencyDc2: 47, dnsLookupTime: 5 },
        { time: '۱۰:۳۰', latencyDc1: 39, latencyDc2: 42, dnsLookupTime: 4 },
        { time: '۱۰:۴۵', latencyDc1: 42, latencyDc2: 46, dnsLookupTime: 5 },
      ],
      hourlyAuth: [
        { hour: '۰۷:۰۰', success: 120, sso: 110, failed: 2 },
        { hour: '۰۸:۰۰', success: 380, sso: 350, failed: 8 },
        { hour: '۰۹:۰۰', success: 540, sso: 500, failed: 12 },
        { hour: '۱۰:۰۰', success: 420, sso: 390, failed: 6 },
        { hour: '۱۱:۰۰', success: 310, sso: 290, failed: 4 },
        { hour: '۱۲:۰۰', success: 280, sso: 260, failed: 3 },
        { hour: '۱۳:۰۰', success: 460, sso: 430, failed: 9 },
      ],
    };
  };

  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      try {
        if (format === 'excel') {
          const data = getReportPayload();
          exportLdapToExcel(data);
          showToast('گزارش اکسل (Excel) وضعیت LDAP و مانیتورینگ شبکه با موفقیت دانلود شد.', 'success');
        } else if (format === 'pdf') {
          const data = getReportPayload();
          exportLdapToPdf(data);
          showToast('گزارش پی‌دی‌اف (PDF) مانیتورینگ شبکه با موفقیت ایجاد و دانلود شد.', 'success');
        } else if (format === 'json') {
          const backup = generateLdapDisasterRecoveryBackup(config, {
            notes: adminNotes,
            exportedByName: currentUser ? currentUser.fullName : 'مدیر ارشد زیرساخت مپنا',
            exportedByRole: currentUser ? currentUser.role : 'Admin',
          });
          downloadLdapDisasterRecoveryBackup(backup);
          showToast('فایل پشتیبان کامل JSON برای بازیابی اضطراری (Disaster Recovery) با موفقیت دانلود شد.', 'success');
        }
        setIsExporting(false);
        onClose();
      } catch (err) {
        console.error(err);
        showToast('خطا در صدور خروجی فایل گزارش', 'error');
        setIsExporting(false);
      }
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border text-right animate-scale-up transition-colors ${
        isDark ? 'bg-[#151921] border-[#252C38] text-slate-100' : 'bg-white border-[#E5E5E5] text-[#333333]'
      }`}>
        
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-[#1C222D] border-[#252C38]' : 'bg-linear-to-r from-red-50 to-[#F8F8F8] border-[#E5E5E5]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#CF2F2F] text-white flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                خروجی گزارش وضعیت و فایل پشتیبان LDAP
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                صدور گزارش رسمی سازمانی (Excel / PDF) یا فایل پشتیبان اضطراری (Disaster Recovery JSON)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-200 text-[#6D6E70]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Format Selection Buttons */}
          <div className="space-y-2">
            <label className={`text-xs font-bold block ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
              فرمت خروجی مورد نظر را انتخاب کنید:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Excel Option */}
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col gap-2 text-right cursor-pointer ${
                  format === 'excel'
                    ? 'border-emerald-600 bg-emerald-50/20 shadow-xs'
                    : isDark
                    ? 'border-[#2D3542] hover:border-slate-600 bg-[#1C222D]'
                    : 'border-[#E5E5E5] hover:border-gray-300 bg-[#F8F8F8]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    format === 'excel' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  {format === 'excel' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div>
                  <h4 className={`font-bold text-xs ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>فایل اکسل (.XLS)</h4>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                    ۵ کاربرگ مجزا با استایل رسمی و RTL
                  </p>
                </div>
              </button>

              {/* PDF Option */}
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col gap-2 text-right cursor-pointer ${
                  format === 'pdf'
                    ? 'border-[#CF2F2F] bg-rose-50/20 shadow-xs'
                    : isDark
                    ? 'border-[#2D3542] hover:border-slate-600 bg-[#1C222D]'
                    : 'border-[#E5E5E5] hover:border-gray-300 bg-[#F8F8F8]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    format === 'pdf' ? 'bg-[#CF2F2F] text-white' : 'bg-rose-100 text-rose-800'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  {format === 'pdf' && <CheckCircle2 className="w-4 h-4 text-[#CF2F2F]" />}
                </div>
                <div>
                  <h4 className={`font-bold text-xs ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>سند پی‌دی‌اف (.PDF)</h4>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                    طرح رسمی با سربرگ سازمانی مپنا
                  </p>
                </div>
              </button>

              {/* JSON Disaster Recovery Option */}
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col gap-2 text-right cursor-pointer ${
                  format === 'json'
                    ? 'border-blue-600 bg-blue-50/20 shadow-xs'
                    : isDark
                    ? 'border-[#2D3542] hover:border-slate-600 bg-[#1C222D]'
                    : 'border-[#E5E5E5] hover:border-gray-300 bg-[#F8F8F8]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    format === 'json' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                  }`}>
                    <FileJson className="w-5 h-5" />
                  </div>
                  {format === 'json' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <div>
                  <h4 className={`font-bold text-xs ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>پشتیبان اضطراری (.JSON)</h4>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                    پشتیبان کامل Disaster Recovery
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Report Metadata Configuration */}
          <div className={`p-4 rounded-2xl border space-y-3.5 ${
            isDark ? 'bg-[#1C222D] border-[#2D3542]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
          }`}>
            <div>
              <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                عنوان سند / شناسه پشتیبان:
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:border-[#CF2F2F] focus:outline-hidden ${
                  isDark ? 'bg-[#151921] border-[#2D3542] text-slate-100' : 'bg-white border-[#E5E5E5] text-[#333333]'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                توضیحات و یادداشت ادمین:
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:border-[#CF2F2F] focus:outline-hidden resize-none ${
                  isDark ? 'bg-[#151921] border-[#2D3542] text-slate-100' : 'bg-white border-[#E5E5E5] text-[#333333]'
                }`}
              />
            </div>
          </div>

          {/* Format-specific notes */}
          {format === 'json' ? (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              isDark ? 'bg-blue-950/40 border-blue-800/60 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
              <span>
                این فایل شامل تمامی پارامترهای سرور LDAP، کنترلرهای دامنه، نگاشت صفات هویتی و ساختار شبکه با چک‌سام اعتبارسنجی است و می‌تواند مستقیماً در شرایط اضطراری جهت بازیابی کامل تنظیمات بارگذاری شود.
              </span>
            </div>
          ) : (
            /* Included Sections Checkboxes */
            <div className="space-y-2">
              <label className={`text-xs font-bold block ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                بخش‌های مندرج در گزارش:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                  isDark ? 'border-[#2D3542] bg-[#1C222D] text-slate-200 hover:bg-[#252C38]' : 'border-[#E5E5E5] bg-white text-[#333333] hover:bg-gray-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeNodes}
                    onChange={(e) => setIncludeNodes(e.target.checked)}
                    className="rounded text-[#CF2F2F] focus:ring-[#CF2F2F] w-4 h-4"
                  />
                  <span>وضعیت گره‌ها و سرورهای شبکه</span>
                </label>

                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                  isDark ? 'border-[#2D3542] bg-[#1C222D] text-slate-200 hover:bg-[#252C38]' : 'border-[#E5E5E5] bg-white text-[#333333] hover:bg-gray-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeLatencyTrend}
                    onChange={(e) => setIncludeLatencyTrend(e.target.checked)}
                    className="rounded text-[#CF2F2F] focus:ring-[#CF2F2F] w-4 h-4"
                  />
                  <span>نمودار تاخیر و زمان پاسخ (Latency)</span>
                </label>

                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                  isDark ? 'border-[#2D3542] bg-[#1C222D] text-slate-200 hover:bg-[#252C38]' : 'border-[#E5E5E5] bg-white text-[#333333] hover:bg-gray-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeHourlyAuth}
                    onChange={(e) => setIncludeHourlyAuth(e.target.checked)}
                    className="rounded text-[#CF2F2F] focus:ring-[#CF2F2F] w-4 h-4"
                  />
                  <span>توزیع آماری ورود و ترافیک ساعتی</span>
                </label>

                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                  isDark ? 'border-[#2D3542] bg-[#1C222D] text-slate-200 hover:bg-[#252C38]' : 'border-[#E5E5E5] bg-white text-[#333333] hover:bg-gray-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeLogs}
                    onChange={(e) => setIncludeLogs(e.target.checked)}
                    className="rounded text-[#CF2F2F] focus:ring-[#CF2F2F] w-4 h-4"
                  />
                  <span>تاریخچه رویدادها و لاگ‌های امنیتی</span>
                </label>

              </div>
            </div>
          )}

          {/* Quick Preview Specs */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            isDark ? 'bg-[#1C222D] border-[#2D3542] text-slate-300' : 'bg-gray-50 border-[#E5E5E5] text-[#6D6E70]'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>سرور اصلی: <strong className={`font-mono ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>{config.serverHost}:{config.port}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span>RTT لحظه‌ای: <strong className="text-emerald-500 font-mono">{toPersianDigits(currentLatency)} ms</strong></span>
              <span>•</span>
              <span>پایداری: <strong className="text-emerald-500 font-mono">۹۹.۹۸٪</strong></span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className={`p-5 border-t flex items-center justify-between gap-3 ${
          isDark ? 'bg-[#1C222D] border-[#252C38]' : 'bg-[#F8F8F8] border-[#E5E5E5]'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isDark ? 'border-[#2D3542] text-slate-300 hover:bg-[#252C38]' : 'border-[#E5E5E5] bg-white hover:bg-gray-100 text-[#6D6E70]'
            }`}
          >
            انصراف
          </button>

          <div className="flex items-center gap-2">
            {format !== 'json' && (
              <button
                type="button"
                onClick={handlePrint}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs ${
                  isDark ? 'border-[#2D3542] bg-[#151921] text-slate-200 hover:bg-[#252C38]' : 'border-[#E5E5E5] bg-white hover:bg-gray-100 text-[#333333]'
                }`}
              >
                <Printer className="w-4 h-4 text-[#6D6E70]" />
                <span>چاپ مستقیم (Print)</span>
              </button>
            )}

            <button
              id="btn-confirm-export-report"
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60 ${
                format === 'excel'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : format === 'pdf'
                  ? 'bg-[#CF2F2F] hover:bg-[#B72424]'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isExporting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>در حال ایجاد فایل...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>دریافت فایل {format === 'excel' ? 'اکسل (.XLS)' : format === 'pdf' ? 'پی‌دی‌اف (.PDF)' : 'پشتیبان (.JSON)'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
