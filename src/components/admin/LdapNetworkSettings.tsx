import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LdapConfig, LdapLogEntry, User } from '../../types';
import { DEFAULT_LDAP_CONFIG, INITIAL_LDAP_LOGS } from '../../data/mockData';
import { toPersianDigits } from '../../utils/dateUtils';
import { LdapNetworkMonitor } from './LdapNetworkMonitor';
import { LdapExportReportModal } from './LdapExportReportModal';
import { LdapDisasterRecoveryModal } from './LdapDisasterRecoveryModal';
import { LdapDisasterRecoveryPanel } from './LdapDisasterRecoveryPanel';
import {
  generateLdapDisasterRecoveryBackup,
  downloadLdapDisasterRecoveryBackup,
} from '../../utils/ldapBackupManager';
import {
  Server,
  Network,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Database,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Eye,
  EyeOff,
  Sliders,
  Terminal,
  Layers,
  Globe,
  Lock,
  Unlock,
  Cpu,
  UserCheck,
  UserX,
  FileText,
  Save,
  RotateCcw,
  Activity,
  ArrowRightLeft,
  ChevronDown,
  Info,
  Check,
  Sparkles,
  Zap,
  Trash2,
  BarChart2,
  Download,
  Upload,
  FileJson
} from 'lucide-react';

const LDAP_STORAGE_KEY = 'mapna_res_ldap_config_v1';
const LDAP_LOGS_STORAGE_KEY = 'mapna_res_ldap_logs_v1';

export const LdapNetworkSettings: React.FC = () => {
  const { users, showToast, adminTheme } = useApp();
  const isDark = adminTheme === 'dark';

  // LDAP Configuration state
  const [config, setConfig] = useState<LdapConfig>(() => {
    const saved = localStorage.getItem(LDAP_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_LDAP_CONFIG;
  });

  // LDAP Logs state
  const [logs, setLogs] = useState<LdapLogEntry[]>(() => {
    const saved = localStorage.getItem(LDAP_LOGS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_LDAP_LOGS;
  });

  // UI state
  const [activeSubTab, setActiveSubTab] = useState<'server' | 'network' | 'mapping' | 'diagnostics' | 'monitor' | 'logs' | 'dr'>('server');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDrModalOpen, setIsDrModalOpen] = useState(false);

  // Diagnostic Test Steps State
  const [testSteps, setTestSteps] = useState<Array<{ name: string; status: 'pending' | 'loading' | 'success' | 'failed'; message?: string }>>([]);

  // User Lookup Diagnostic state
  const [lookupQuery, setLookupQuery] = useState('10042');
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    user?: User;
    rawLdap?: Record<string, string>;
    error?: string;
  } | null>(null);

  // Password Verification Test State
  const [testUsername, setTestUsername] = useState('r.shahbazi');
  const [testPassword, setTestPassword] = useState('Mapna@2026');
  const [authTestResult, setAuthTestResult] = useState<{ success: boolean; message: string; timestamp: string } | null>(null);
  const [isTestingAuth, setIsTestingAuth] = useState(false);

  // Restore config handler from Disaster Recovery
  const handleRestoreConfig = (restoredConfig: LdapConfig) => {
    setConfig(restoredConfig);
    localStorage.setItem(LDAP_STORAGE_KEY, JSON.stringify(restoredConfig));

    const newLog: LdapLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'config_update',
      username: 'مدیر ارشد سامانه (Disaster Recovery)',
      ipAddress: '192.168.10.15',
      message: 'پیکربندی سرور LDAP و شبکه با موفقیت از فایل پشتیبان JSON بازیابی و جایگزین گردید.',
      details: `Restored DC: ${restoredConfig.serverHost}:${restoredConfig.port}, Protocol: ${restoredConfig.protocol.toUpperCase()}, Base DN: ${restoredConfig.baseDn}`,
      status: 'ok',
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem(LDAP_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));

    showToast('تنظیمات LDAP و معماری شبکه با موفقیت از فایل پشتیبان بازیابی گردید.', 'success');
  };

  // Direct Backup Download
  const handleQuickJsonExport = () => {
    const backup = generateLdapDisasterRecoveryBackup(config, {
      notes: 'پشتیبان‌گیری مستقیم سریع از پنل مدیریت سرور LDAP',
    });
    downloadLdapDisasterRecoveryBackup(backup);
    showToast('فایل پشتیبان JSON برای بازیابی در شرایط بحران (Disaster Recovery) دانلود گردید.', 'success');
  };

  // Filter for Logs
  const [logTypeFilter, setLogTypeFilter] = useState<'all' | 'auth' | 'sync' | 'test' | 'config'>('all');

  // Save config to LocalStorage
  const handleSaveConfig = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(LDAP_STORAGE_KEY, JSON.stringify(config));
      
      // Add log
      const newLog: LdapLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'config_update',
        username: 'مدیر ارشد سامانه (Admin)',
        ipAddress: '192.168.10.15',
        message: 'پیکربندی سرور LDAP و تنظیمات شبکه با موفقیت به‌روزرسانی و ذخیره گردید.',
        details: `Server: ${config.serverHost}:${config.port}, Protocol: ${config.protocol.toUpperCase()}, Timeout: ${config.connectionTimeoutMs}ms`,
        status: 'ok',
      };
      
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      localStorage.setItem(LDAP_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));

      setIsSaving(false);
      showToast('پیکربندی سرور LDAP و تنظیمات شبکه با موفقیت ذخیره شد.', 'success');
    }, 400);
  };

  // Reset to default
  const handleResetConfig = () => {
    if (window.confirm('آیا از بازنشانی کلیه تنظیمات احراز هویت LDAP به حالت پیش‌فرض سازمانی مپنا اطمینان دارید؟')) {
      setConfig(DEFAULT_LDAP_CONFIG);
      localStorage.setItem(LDAP_STORAGE_KEY, JSON.stringify(DEFAULT_LDAP_CONFIG));
      showToast('تنظیمات LDAP به مقادیر پیش‌فرض بازنشانی شد.', 'info');
    }
  };

  // Run comprehensive live connection test
  const handleRunConnectionTest = () => {
    setIsTesting(true);
    setTestSteps([
      { name: 'تفکیک نام دامنه و DNS Resolution', status: 'loading', message: `بررسی ${config.serverHost} از طریق ${config.dnsServers[0] || '10.10.1.10'}...` },
      { name: 'برقراری سوکت شبکه TCP', status: 'pending' },
      { name: 'هندشیک امنیتی TLS / SSL', status: 'pending' },
      { name: 'احراز هویت حساب کاربری سرویس (Bind DN)', status: 'pending' },
      { name: 'استعلام آزمایشی آبجکت‌های سازمانی Base DN', status: 'pending' },
    ]);

    setTimeout(() => {
      setTestSteps(prev => [
        { ...prev[0], status: 'success', message: `آدرس IP با موفقیت به 192.168.10.25 ترجمه شد (پاسخ: ۱.۲ms)` },
        { ...prev[1], status: 'loading', message: `اتصال به پورت ${config.port}...` },
        prev[2],
        prev[3],
        prev[4]
      ]);

      setTimeout(() => {
        setTestSteps(prev => [
          prev[0],
          { ...prev[1], status: 'success', message: `سوکت TCP پورت ${config.port} باز و در دسترس است (RTT: ۱۴ms)` },
          { ...prev[2], status: 'loading', message: `بررسی گواهی TLS 1.3 (${config.sslValidation === 'corporate_ca' ? 'MAPNA Root CA' : 'Strict'})...` },
          prev[3],
          prev[4]
        ]);

        setTimeout(() => {
          setTestSteps(prev => [
            prev[0],
            prev[1],
            { ...prev[2], status: 'success', message: `گواهی دیجیتال سرور تایید گردید (اعتبار تا ۲۰۲۸/۱۲/۳۱)` },
            { ...prev[3], status: 'loading', message: `ارسال درخواست Simple Bind با ${config.bindDn}...` },
            prev[4]
          ]);

          setTimeout(() => {
            setTestSteps(prev => [
              prev[0],
              prev[1],
              prev[2],
              { ...prev[3], status: 'success', message: `احراز هویت حساب سرویس موفقیت‌آمیز بود (Bind Successful)` },
              { ...prev[4], status: 'loading', message: `اجرای کوئری جستجو در ${config.userSearchBase}...` },
            ]);

            setTimeout(() => {
              setTestSteps(prev => [
                prev[0],
                prev[1],
                prev[2],
                prev[3],
                { ...prev[4], status: 'success', message: `تعداد ۱,۰۰۰ شیء پرسنلی (User Objects) با موفقیت بازیابی شد.` },
              ]);

              const latency = Math.floor(25 + Math.random() * 25);
              const updatedConfig: LdapConfig = {
                ...config,
                lastTestStatus: 'success',
                lastTestLatency: latency,
                lastTestMessage: `اتصال با موفقیت برقرار شد (${latency}ms)`,
              };
              setConfig(updatedConfig);
              localStorage.setItem(LDAP_STORAGE_KEY, JSON.stringify(updatedConfig));

              // Add Log
              const newLog: LdapLogEntry = {
                id: `log-${Date.now()}`,
                timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                type: 'test',
                username: 'admin.hr (مدیر سیستم)',
                ipAddress: '192.168.10.15',
                message: `تست جامع ارتباط LDAP با سرور ${config.serverHost}:${config.port} موفقیت‌آمیز بود.`,
                details: `Latency: ${latency}ms, Protocol: ${config.protocol.toUpperCase()}, 1000 Active Directory entries detected.`,
                status: 'ok',
              };
              const updatedLogs = [newLog, ...logs];
              setLogs(updatedLogs);
              localStorage.setItem(LDAP_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));

              setIsTesting(false);
              showToast(`تست اتصال با موفقیت انجام شد (زمان پاسخ: ${latency} میلی‌ثانیه)`, 'success');
            }, 500);
          }, 500);
        }, 500);
      }, 500);
    }, 600);
  };

  // Live User Lookup Diagnostic
  const handlePerformUserLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = lookupQuery.trim();
    if (!q) return;

    const matched = users.find(u => 
      u.personnelCode === q || 
      u.personnelCode === `MP-${q}` ||
      u.nationalId === q || 
      u.email.toLowerCase().includes(q.toLowerCase()) ||
      u.fullName.includes(q)
    );

    if (matched) {
      const sAMAccountName = matched.email.split('@')[0] || `user_${matched.personnelCode}`;
      setLookupResult({
        found: true,
        user: matched,
        rawLdap: {
          'distinguishedName': `CN=${matched.fullName},OU=Personnel,OU=${matched.department.split(' ')[0]},${config.baseDn}`,
          'sAMAccountName': sAMAccountName,
          'userPrincipalName': matched.email,
          'displayName': matched.fullName,
          'employeeID': matched.personnelCode,
          'extensionAttribute1 (کد ملی)': matched.nationalId,
          'department': matched.department,
          'company': 'گروه مپنا (MAPNA Group)',
          'mail': matched.email,
          'telephoneNumber': matched.phone,
          'userAccountControl': '512 (NORMAL_ACCOUNT_ACTIVE)',
          'pwdLastSet': '133678912000000000 (Active)',
          'whenCreated': '2022-04-10 08:30:00 UTC',
          'memberOf': 'CN=All_Mapna_Employees,OU=Groups,DC=mapnagroup,DC=ir; CN=Reservation_Access,OU=Groups,DC=mapnagroup,DC=ir'
        }
      });
    } else {
      setLookupResult({
        found: false,
        error: `کاربری با مشخصه «${q}» در پایگاه اکتیودایرکتوری مپنا و شاخه ${config.userSearchBase} یافت نشد.`
      });
    }
  };

  // Password Authentication Simulation
  const handleTestUserAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingAuth(true);

    setTimeout(() => {
      setIsTestingAuth(false);
      if (testPassword.length >= 4) {
        setAuthTestResult({
          success: true,
          message: `احراز هویت کاربر «${testUsername}» در اکتیودایرکتوری مپنا با موفقیت انجام شد (Kerberos Ticket Granted).`,
          timestamp: new Date().toLocaleTimeString('fa-IR')
        });

        // Add Log
        const newLog: LdapLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'auth_success',
          username: testUsername,
          ipAddress: '192.168.12.44',
          message: `احراز هویت موفق کاربر ${testUsername} از طریق سرور LDAP`,
          details: 'Simple Bind Authentication: Success (Code 0)',
          status: 'ok',
        };
        const updatedLogs = [newLog, ...logs];
        setLogs(updatedLogs);
        localStorage.setItem(LDAP_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
      } else {
        setAuthTestResult({
          success: false,
          message: 'خطای کد ۴۹: اطلاعات کاربری نامعتبر است (رمز عبور نادرست).',
          timestamp: new Date().toLocaleTimeString('fa-IR')
        });
      }
    }, 800);
  };

  // Synchronize 1000 Users Bulk Sync
  const handleSyncAllUsers = () => {
    setIsSyncing(true);
    setSyncProgress(10);

    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);

          const timeStr = 'امروز ساعت ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
          const updatedConfig: LdapConfig = {
            ...config,
            lastSyncTime: timeStr,
          };
          setConfig(updatedConfig);
          localStorage.setItem(LDAP_STORAGE_KEY, JSON.stringify(updatedConfig));

          // Add Sync Log
          const newLog: LdapLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: 'sync',
            username: 'مدیریت منابع انسانی (Admin)',
            ipAddress: '192.168.10.15',
            message: `همگام‌سازی کامل پایگاه ۱,۰۰۰ پرسنل مپنا با اکتیودایرکتوری پایان یافت.`,
            details: `1000 accounts analyzed, 0 conflicts, 1,000 synchronized records validated.`,
            status: 'ok',
          };
          const updatedLogs = [newLog, ...logs];
          setLogs(updatedLogs);
          localStorage.setItem(LDAP_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));

          showToast('همگام‌سازی پایگاه ۱۰۰۰ کاربر سازمانی با اکتیودایرکتوری مپنا با موفقیت انجام شد.', 'success');
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const handleClearLogs = () => {
    if (window.confirm('آیا از پاکسازی تاریخچه لاگ‌های احراز هویت LDAP اطمینان دارید؟')) {
      setLogs([]);
      localStorage.removeItem(LDAP_LOGS_STORAGE_KEY);
      showToast('تاریخچه لاگ‌ها پاکسازی شد.', 'info');
    }
  };

  // Filtered Logs
  const filteredLogs = logs.filter(l => {
    if (logTypeFilter === 'all') return true;
    if (logTypeFilter === 'auth') return l.type === 'auth_success' || l.type === 'auth_failed';
    if (logTypeFilter === 'sync') return l.type === 'sync';
    if (logTypeFilter === 'test') return l.type === 'test';
    if (logTypeFilter === 'config') return l.type === 'config_update';
    return true;
  });

  return (
    <div id="ldap-network-management-panel" className="space-y-5">
      
      {/* Top Hero Status Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E5E5] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-[#E5E5E5]">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#CF2F2F] shrink-0 shadow-xs">
              <Server className="w-6 h-6 text-[#CF2F2F]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#CF2F2F] text-white">
                  مدیریت سرویس احراز هویت سازمانی
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>سرویس اکتیودایرکتوری مپنا متصل است</span>
                </span>
                <span className="text-xs text-[#6D6E70] font-mono">
                  {config.protocol.toUpperCase()}://{config.serverHost}:{toPersianDigits(config.port)}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mt-1.5 text-[#333333]">
                پیکربندی سرور LDAP / Active Directory و شبکه داخلی
              </h2>
              <p className="text-xs text-[#6D6E70] mt-0.5">
                مدیریت احراز هویت متمرکز (SSO)، اتصال به دومین کنترلرهای مپنا، نگاشت فیلدهای هویتی و همگام‌سازی خودکار پرسنل
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="btn-ldap-test-ping"
              type="button"
              disabled={isTesting}
              onClick={handleRunConnectionTest}
              className="px-4 py-2.5 rounded-xl bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#333333] text-xs font-bold border border-[#E5E5E5] transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
            >
              <Activity className={`w-4 h-4 text-[#CF2F2F] ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'در حال پایش و تست...' : 'تست اتصال و پینگ سرور'}</span>
            </button>

            <button
              id="btn-ldap-sync-users"
              type="button"
              disabled={isSyncing}
              onClick={handleSyncAllUsers}
              className="px-4 py-2.5 rounded-xl bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#333333] text-xs font-bold border border-[#E5E5E5] transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? `همگام‌سازی (${toPersianDigits(syncProgress)}٪)...` : 'همگام‌سازی فوری ۱۰۰۰ کاربر'}</span>
            </button>

            <button
              id="btn-ldap-dr-backup-action"
              type="button"
              onClick={() => setIsDrModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <ShieldAlert className="w-4 h-4 text-amber-200" />
              <span>پشتیبان اضطراری JSON</span>
            </button>

            <button
              id="btn-ldap-export-report"
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#333333] hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-rose-400" />
              <span>خروجی گزارش</span>
            </button>

            <button
              id="btn-ldap-save-config"
              type="button"
              disabled={isSaving}
              onClick={handleSaveConfig}
              className="px-5 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}</span>
            </button>
          </div>

        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5]">
            <span className="text-[#6D6E70] text-[11px] block">پروتکل ارتباطی</span>
            <strong className="text-[#333333] font-mono text-sm block mt-0.5">
              {config.protocol === 'ldaps' ? 'LDAPS (SSL/TLS v1.3)' : config.protocol === 'starttls' ? 'StartTLS' : 'LDAP (Plain)'}
            </strong>
          </div>

          <div className="p-3 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5]">
            <span className="text-[#6D6E70] text-[11px] block">زمان پاسخ سرور (Latency)</span>
            <strong className="text-emerald-700 font-mono text-sm block mt-0.5">
              {toPersianDigits(config.lastTestLatency || 42)} ms (عالی)
            </strong>
          </div>

          <div className="p-3 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5]">
            <span className="text-[#6D6E70] text-[11px] block">آخرین همگام‌سازی سراسری</span>
            <strong className="text-[#333333] text-sm block mt-0.5">
              {config.lastSyncTime || 'امروز ۰۲:۳۰'}
            </strong>
          </div>

          <div className="p-3 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5]">
            <span className="text-[#6D6E70] text-[11px] block">پایگاه پرسنل فعال مپنا</span>
            <strong className="text-[#CF2F2F] font-mono text-sm block mt-0.5">
              {toPersianDigits(users.length)} حساب متصل
            </strong>
          </div>
        </div>

        {/* Sync Progress Bar (if syncing) */}
        {isSyncing && (
          <div className="mt-4 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1.5">
              <span>در حال برقراری ارتباط با Active Directory مپنا و دریافت تغییرات ۱,۰۰۰ پرسنل...</span>
              <span className="font-mono">{toPersianDigits(syncProgress)}٪</span>
            </div>
            <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}

      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-2xl border border-[#E5E5E5] shadow-xs overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          id="tab-ldap-server"
          type="button"
          onClick={() => setActiveSubTab('server')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'server' ? 'bg-[#CF2F2F] text-white shadow-xs font-bold' : 'text-[#6D6E70] hover:bg-[#F8F8F8]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>تنظیمات سرور LDAP و دامنه</span>
        </button>

        <button
          id="tab-ldap-network"
          type="button"
          onClick={() => setActiveSubTab('network')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'network' ? 'bg-[#CF2F2F] text-white shadow-xs font-bold' : 'text-[#6D6E70] hover:bg-[#F8F8F8]'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>پیکربندی شبکه، پروکسی و امنیت</span>
        </button>

        <button
          id="tab-ldap-mapping"
          type="button"
          onClick={() => setActiveSubTab('mapping')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'mapping' ? 'bg-[#CF2F2F] text-white shadow-xs font-bold' : 'text-[#6D6E70] hover:bg-[#F8F8F8]'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>نگاشت فیلدهای پرسنلی</span>
        </button>

        <button
          id="tab-ldap-diagnostics"
          type="button"
          onClick={() => setActiveSubTab('diagnostics')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'diagnostics' ? 'bg-[#CF2F2F] text-white shadow-xs font-bold' : 'text-[#6D6E70] hover:bg-[#F8F8F8]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>استعلام زنده و عیب‌یابی (Diagnostics)</span>
        </button>

        <button
          id="tab-ldap-monitor"
          type="button"
          onClick={() => setActiveSubTab('monitor')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'monitor' ? 'bg-[#CF2F2F] text-white shadow-xs font-bold' : 'text-[#6D6E70] hover:bg-[#F8F8F8]'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>مانیتورینگ بلادرنگ و نمودارها (Live Recharts)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        <button
          id="tab-ldap-logs"
          type="button"
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'logs' ? 'bg-[#CF2F2F] text-white shadow-xs font-bold' : 'text-[#6D6E70] hover:bg-[#F8F8F8]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>لاگ رویدادها ({toPersianDigits(logs.length)})</span>
        </button>

        <button
          id="tab-ldap-dr"
          type="button"
          onClick={() => setActiveSubTab('dr')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'dr' ? 'bg-[#CF2F2F] text-white shadow-xs font-bold' : 'text-[#6D6E70] hover:bg-[#F8F8F8]'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>پشتیبان‌گیری اضطراری و DR (JSON Backup)</span>
        </button>
      </div>

      {/* TAB 1: LDAP SERVER & DOMAIN CONFIGURATION */}
      {activeSubTab === 'server' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Main Form (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-xs space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
              <div>
                <h3 className="font-bold text-base text-[#333333]">
                  مشخصات اتصال به Domain Controller مپنا
                </h3>
                <p className="text-xs text-[#6D6E70] mt-0.5">
                  تنظیمات پایه‌ای هاست، پورت، Base DN و حساب کاربری سرویس بایندر (Bind Service Account)
                </p>
              </div>

              {/* Enable / Disable toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer bg-[#F8F8F8] px-3.5 py-2 rounded-xl border border-[#E5E5E5]">
                <span className="text-xs font-bold text-[#333333]">سرویس احراز هویت LDAP:</span>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="w-4 h-4 text-[#CF2F2F] rounded focus:ring-[#CF2F2F] cursor-pointer"
                />
                <span className={`text-xs font-bold ${config.enabled ? 'text-emerald-700' : 'text-[#6D6E70]'}`}>
                  {config.enabled ? 'فعال' : 'غیرفعال'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              
              {/* Server Host */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-bold text-[#333333]">
                  آدرس سرور یا نام هاست اکتیودایرکتوری (Server Host / IP): *
                </label>
                <div className="relative">
                  <Server className="w-4 h-4 text-[#6D6E70] absolute right-3.5 top-3" />
                  <input
                    type="text"
                    value={config.serverHost}
                    onChange={(e) => setConfig({ ...config, serverHost: e.target.value })}
                    placeholder="ldap.mapnagroup.com یا 192.168.10.25"
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] focus:bg-white text-[#333333] font-mono text-xs focus:outline-none focus:border-[#CF2F2F]"
                  />
                </div>
              </div>

              {/* Protocol */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#333333]">پروتکل ارتباطی (Protocol):</label>
                <select
                  value={config.protocol}
                  onChange={(e) => {
                    const proto = e.target.value as 'ldap' | 'ldaps' | 'starttls';
                    setConfig({
                      ...config,
                      protocol: proto,
                      port: proto === 'ldaps' ? 636 : 389,
                    });
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white text-[#333333] text-xs font-medium focus:outline-none focus:border-[#CF2F2F]"
                >
                  <option value="ldaps">LDAPS (امن با SSL/TLS - پورت پیش‌فرض ۶۳۶)</option>
                  <option value="ldap">LDAP استاندارد (پورت پیش‌فرض ۳۸۹)</option>
                  <option value="starttls">StartTLS (ارتقای امن پورت ۳۸۹)</option>
                </select>
              </div>

              {/* Port */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#333333]">پورت سرور (Port):</label>
                <input
                  type="number"
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 389 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white text-[#333333] font-mono text-xs focus:outline-none focus:border-[#CF2F2F]"
                />
              </div>

              {/* Base DN */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-bold text-[#333333]">نام ریشه دامنه (Base DN): *</label>
                <input
                  type="text"
                  value={config.baseDn}
                  onChange={(e) => setConfig({ ...config, baseDn: e.target.value })}
                  placeholder="DC=mapnagroup,DC=ir"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white text-[#333333] font-mono text-xs focus:outline-none focus:border-[#CF2F2F]"
                />
              </div>

              {/* User Search Base (OU) */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-bold text-[#333333]">
                  مسیر جستجوی کاربران و واحدها (User Search Base / OU): *
                </label>
                <input
                  type="text"
                  value={config.userSearchBase}
                  onChange={(e) => setConfig({ ...config, userSearchBase: e.target.value })}
                  placeholder="OU=Personnel,OU=MAPNA_HQ,DC=mapnagroup,DC=ir"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white text-[#333333] font-mono text-xs focus:outline-none focus:border-[#CF2F2F]"
                />
                <span className="text-[11px] text-[#6D6E70] block">
                  تمام کاربران ۱,۰۰۰ پرسنل مپنا تحت این ساختار درختی جستجو و احراز هویت می‌گردند.
                </span>
              </div>

              {/* Bind DN (Service Account) */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-bold text-[#333333]">
                  شناسه حساب کاربری سرویس بایندر (Bind DN / Service Account): *
                </label>
                <input
                  type="text"
                  value={config.bindDn}
                  onChange={(e) => setConfig({ ...config, bindDn: e.target.value })}
                  placeholder="CN=svc_res_auth,OU=ServiceAccounts,DC=mapnagroup,DC=ir"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white text-[#333333] font-mono text-xs focus:outline-none focus:border-[#CF2F2F]"
                />
              </div>

              {/* Bind Password */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-bold text-[#333333]">
                  کلمه عبور حساب سرویس (Bind Password): *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={config.bindPassword}
                    onChange={(e) => setConfig({ ...config, bindPassword: e.target.value })}
                    className="w-full pr-4 pl-10 py-2.5 rounded-xl border border-[#E5E5E5] bg-white text-[#333333] font-mono text-xs focus:outline-none focus:border-[#CF2F2F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2.5 text-[#6D6E70] hover:text-[#333333] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* User Search Filter */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-bold text-[#333333]">
                  فیلتر جستجوی کاربر در اکتیودایرکتوری (User Search Filter):
                </label>
                <input
                  type="text"
                  value={config.userFilter}
                  onChange={(e) => setConfig({ ...config, userFilter: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] text-[#333333] font-mono text-xs focus:outline-none focus:border-[#CF2F2F]"
                />
                <span className="text-[11px] text-[#6D6E70] block">
                  متغیر <code className="font-mono text-[#CF2F2F]">{'{username}'}</code> با کد پرسنلی، نام کاربری یا ایمیل وارد شده جایگزین خواهد شد.
                </span>
              </div>

            </div>

            <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetConfig}
                className="px-3.5 py-2 rounded-xl text-[#6D6E70] hover:text-[#333333] hover:bg-[#F8F8F8] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-transparent hover:border-[#E5E5E5] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بازنشانی به پیش‌فرض</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-6 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره تغییرات سرور</span>
              </button>
            </div>

          </div>

          {/* Side Info & Diagnostic Steps Box (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Live Connection Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#333333]">وضعیت زنده سرور</h4>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    آنلاین و پاسخگو
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6D6E70]">دامین کنترلر فعال:</span>
                  <span className="font-mono font-bold text-[#333333]">DC01.mapnagroup.ir</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6D6E70]">پروتکل رمزشده:</span>
                  <span className="font-mono text-emerald-700 font-bold">TLS 1.3 / AES-256</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6D6E70]">زمان احراز هویت:</span>
                  <span className="font-mono font-bold text-[#333333]">~ ۳۵ میلی‌ثانیه</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6D6E70]">پشتیبانی از SSO:</span>
                  <span className="text-emerald-700 font-bold">فعال (Kerberos)</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isTesting}
                onClick={handleRunConnectionTest}
                className="w-full py-2.5 rounded-xl bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#333333] font-bold text-xs border border-[#E5E5E5] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Activity className={`w-4 h-4 text-[#CF2F2F] ${isTesting ? 'animate-spin' : ''}`} />
                <span>اجرای تست عیب‌یابی ۵ مرحله‌ای</span>
              </button>
            </div>

            {/* Test Steps Output (if testing/tested) */}
            {testSteps.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-xs space-y-3 animate-fade-in">
                <h4 className="font-bold text-xs text-[#333333] flex items-center justify-between">
                  <span>مراحل تست اتصال زنده:</span>
                  <span className="text-[10px] text-[#6D6E70] font-mono">LDAPS Diagnostic</span>
                </h4>

                <div className="space-y-2 text-xs">
                  {testSteps.map((step, idx) => (
                    <div key={idx} className="p-2.5 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5] flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {step.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {step.status === 'loading' && <RefreshCw className="w-4 h-4 text-[#CF2F2F] animate-spin" />}
                        {step.status === 'pending' && <Clock className="w-4 h-4 text-[#6D6E70]" />}
                        {step.status === 'failed' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-[#333333] block text-[11px]">{step.name}</span>
                        {step.message && (
                          <span className="text-[10px] text-[#6D6E70] block font-mono mt-0.5 truncate">
                            {step.message}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Architecture Guidelines note */}
            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 text-xs text-[#333333] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#CF2F2F]">
                <Info className="w-4 h-4 text-[#CF2F2F]" />
                <span>نکته امنیتی سازمانی مپنا:</span>
              </div>
              <p className="text-[11px] text-[#6D6E70] leading-relaxed">
                سامانه به طور پیش‌فرض برای امنیت ارتباطات شبکه از پورت امن ۶۳۶ و اعتبارسنجی گواهی CA داخلی مپنا استفاده می‌نماید. در صورت قطعی ارتباط موقت، ورود با حساب کاربری محلی فعال است.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: NETWORK, PROXY & SECURITY */}
      {activeSubTab === 'network' && (
        <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-xs space-y-6">
          
          <div className="pb-4 border-b border-[#E5E5E5]">
            <h3 className="font-bold text-base text-[#333333]">
              پیکربندی شبکه، پروکسی داخلی مپنا و تایم‌اوت ارتباط
            </h3>
            <p className="text-xs text-[#6D6E70] mt-0.5">
              تنظیمات مربوط به سرورهای DNS، بازه مجاز IPها، مسیر پروکسی سازمانی و پروتکل‌های امنیتی
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
            
            {/* DNS Servers */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">سرورهای DNS سازمانی مپنا:</label>
              <input
                type="text"
                value={config.dnsServers.join(', ')}
                onChange={(e) => setConfig({ ...config, dnsServers: e.target.value.split(',').map(s => s.trim()) })}
                placeholder="10.10.1.10, 10.10.1.11"
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white font-mono text-xs text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
              />
              <span className="text-[11px] text-[#6D6E70] block">
                جهت تفکیک آدرس‌های داخلی مپنا نظیر dc01.mapnagroup.ir
              </span>
            </div>

            {/* Connection Timeout */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">مهلت زمانی پاسخ شبکه (Timeout ms):</label>
              <input
                type="number"
                value={config.connectionTimeoutMs}
                onChange={(e) => setConfig({ ...config, connectionTimeoutMs: parseInt(e.target.value) || 5000 })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white font-mono text-xs text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
              />
              <span className="text-[11px] text-[#6D6E70] block">
                تایم‌اوت پیشنهادی شبکه اینترانت: ۴۵۰۰ میلی‌ثانیه
              </span>
            </div>

            {/* Corporate Proxy URL */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">آدرس پروکسی شبکه سازمانی (اختیاری):</label>
              <input
                type="text"
                value={config.proxyUrl || ''}
                onChange={(e) => setConfig({ ...config, proxyUrl: e.target.value })}
                placeholder="http://proxy.mapnagroup.com:8080"
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white font-mono text-xs text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
              />
            </div>

            {/* SSL/TLS Certificate Validation */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">اعتبارسنجی گواهی امنیتی SSL/TLS:</label>
              <select
                value={config.sslValidation}
                onChange={(e) => setConfig({ ...config, sslValidation: e.target.value as any })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white text-xs font-medium text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
              >
                <option value="corporate_ca">گواهی CA معتمد سازمانی مپنا (MAPNA Internal Root CA)</option>
                <option value="strict">Strict - بررسی کامل زنجیره گواهی عمومی</option>
                <option value="skip">صرف‌نظر از اعتبارسنجی گواهی (حالت توسعه و تست)</option>
              </select>
            </div>

            {/* Allowed IP Ranges */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block font-bold text-[#333333]">محدوده IP‌های مجاز اینترانت مپنا (Allowed Subnets):</label>
              <input
                type="text"
                value={config.allowedIpRanges || '10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16'}
                onChange={(e) => setConfig({ ...config, allowedIpRanges: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white font-mono text-xs text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
              />
              <span className="text-[11px] text-[#6D6E70] block">
                فقط درخواست‌های احراز هویت از این ساب‌نت‌های اینترانت مجاز به دسترسی به سرویس نوبت‌دهی هستند.
              </span>
            </div>

            {/* Checkbox Options */}
            <div className="sm:col-span-2 p-4 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5] space-y-3">
              <span className="font-bold text-xs text-[#333333] block">سیاست‌های تکمیلی احراز هویت و دسترسی:</span>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableSso}
                  onChange={(e) => setConfig({ ...config, enableSso: e.target.checked })}
                  className="w-4 h-4 text-[#CF2F2F] rounded focus:ring-[#CF2F2F] cursor-pointer"
                />
                <span className="text-xs text-[#333333]">
                  <strong>فعال‌سازی یکپارچگی ورود یکتا (Single Sign-On / Kerberos SSO):</strong> ورود خودکار پرسنل متصل به دامین ویندوز سازمانی
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.fallbackLocalAuth}
                  onChange={(e) => setConfig({ ...config, fallbackLocalAuth: e.target.checked })}
                  className="w-4 h-4 text-[#CF2F2F] rounded focus:ring-[#CF2F2F] cursor-pointer"
                />
                <span className="text-xs text-[#333333]">
                  <strong>پشتیبانی از ورود محلی (Fallback Auth):</strong> در صورت عدم دسترسی به شبکه یا قطعی LDAP، ادمین بتواند با رمز محلی وارد شود.
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoCreateUsers}
                  onChange={(e) => setConfig({ ...config, autoCreateUsers: e.target.checked })}
                  className="w-4 h-4 text-[#CF2F2F] rounded focus:ring-[#CF2F2F] cursor-pointer"
                />
                <span className="text-xs text-[#333333]">
                  <strong>ایجاد خودکار حساب پرسنلی جدید:</strong> در صورت اولین ورود پرسنل جدید مپنا، پروفایل او به صورت خودکار ایجاد شود.
                </span>
              </label>
            </div>

          </div>

          <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-end">
            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-6 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تنظیمات شبکه و امنیت</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: ATTRIBUTE MAPPING */}
      {activeSubTab === 'mapping' && (
        <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-xs space-y-6">
          
          <div className="pb-4 border-b border-[#E5E5E5]">
            <h3 className="font-bold text-base text-[#333333]">
              نگاشت ویژگی‌ها و فیلدهای هویتی (Attribute Mapping)
            </h3>
            <p className="text-xs text-[#6D6E70] mt-0.5">
              تطبیق ویژگی‌های Active Directory Schema با فیلدهای پروفایل پرسنل در سامانه رزرواسیون مپنا
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            
            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">نام و نام خانوادگی:</label>
              <input
                type="text"
                value={config.fullNameAttribute}
                onChange={(e) => setConfig({ ...config, fullNameAttribute: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white font-mono text-xs text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
              />
              <span className="text-[11px] text-[#6D6E70]">ویژگی LDAP: <code className="font-mono text-[#CF2F2F]">displayName</code> یا <code className="font-mono text-[#CF2F2F]">cn</code></span>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">کد پرسنلی مپنا:</label>
              <input
                type="text"
                value={config.personnelCodeAttribute}
                onChange={(e) => setConfig({ ...config, personnelCodeAttribute: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white font-mono text-xs text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
              />
              <span className="text-[11px] text-[#6D6E70]">ویژگی LDAP: <code className="font-mono text-[#CF2F2F]">employeeID</code> یا <code className="font-mono text-[#CF2F2F]">sAMAccountName</code></span>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">پست الکترونیکی سازمانی:</label>
              <input
                type="text"
                value={config.mailAttribute}
                onChange={(e) => setConfig({ ...config, mailAttribute: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white font-mono text-xs text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
              />
              <span className="text-[11px] text-[#6D6E70]">ویژگی LDAP: <code className="font-mono text-[#CF2F2F]">mail</code> یا <code className="font-mono text-[#CF2F2F]">userPrincipalName</code></span>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">کد ملی:</label>
              <input
                type="text"
                value={config.nationalIdAttribute}
                onChange={(e) => setConfig({ ...config, nationalIdAttribute: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white font-mono text-xs text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
              />
              <span className="text-[11px] text-[#6D6E70]">ویژگی LDAP: <code className="font-mono text-[#CF2F2F]">extensionAttribute1</code> یا <code className="font-mono text-[#CF2F2F]">nationalID</code></span>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">شرکت تابعه / بخش سازمانی:</label>
              <input
                type="text"
                value={config.departmentAttribute}
                onChange={(e) => setConfig({ ...config, departmentAttribute: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white font-mono text-xs text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
              />
              <span className="text-[11px] text-[#6D6E70]">ویژگی LDAP: <code className="font-mono text-[#CF2F2F]">department</code> یا <code className="font-mono text-[#CF2F2F]">company</code></span>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-[#333333]">شماره تلفن همراه / داخلی:</label>
              <input
                type="text"
                value={config.phoneAttribute}
                onChange={(e) => setConfig({ ...config, phoneAttribute: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white font-mono text-xs text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
              />
              <span className="text-[11px] text-[#6D6E70]">ویژگی LDAP: <code className="font-mono text-[#CF2F2F]">telephoneNumber</code> یا <code className="font-mono text-[#CF2F2F]">mobile</code></span>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="block font-bold text-[#333333]">نقش پیش‌فرض کاربران همگام‌شده جدید:</label>
              <select
                value={config.defaultRole}
                onChange={(e) => setConfig({ ...config, defaultRole: e.target.value as any })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white text-xs font-medium text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
              >
                <option value="employee">کارمند عادی (دسترسی به رزرو نوبت)</option>
                <option value="doctor">پزشک معتمد</option>
                <option value="counselor">مشاور</option>
                <option value="lawyer">مشاور حقوقی</option>
                <option value="barber">پیرایشگر</option>
                <option value="nutritionist">کارشناس تغذیه</option>
                <option value="admin">مدیر سیستم</option>
              </select>
            </div>

          </div>

          <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-end">
            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-6 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره جدول نگاشت ویژگی‌ها</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 4: LIVE DIAGNOSTICS & USER LOOKUP */}
      {activeSubTab === 'diagnostics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Lookup Box (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-base text-[#333333]">
                استعلام زنده کاربر از Active Directory مپنا
              </h3>
              <p className="text-xs text-[#6D6E70] mt-0.5">
                کد پرسنلی، نام کاربری یا کد ملی پرسنل را وارد کنید تا اطلاعات استخراجی از دامین کنترلر نمایش داده شود.
              </p>
            </div>

            <form onSubmit={handlePerformUserLookup} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#6D6E70] absolute right-3.5 top-3" />
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="مثال: 10042 یا r.shahbazi یا 0019283746..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] focus:bg-white text-xs text-[#333333] font-mono focus:outline-none focus:border-[#CF2F2F]"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                استعلام LDAP
              </button>
            </form>

            {/* Lookup Result Display */}
            {lookupResult && (
              <div className="space-y-3 animate-fade-in">
                {lookupResult.found && lookupResult.user && lookupResult.rawLdap ? (
                  <div className="p-4 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5] space-y-3 text-xs">
                    
                    <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5E5]">
                      <img
                        src={lookupResult.user.avatarUrl}
                        alt={lookupResult.user.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-[#E5E5E5]"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#333333]">{lookupResult.user.fullName}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                            فعال در دامین
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6D6E70] font-mono">{lookupResult.user.email}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 font-mono text-[11px]">
                      <span className="text-[#333333] font-sans font-bold block">ویژگی‌های بازگردانده شده از سرور (LDAP Attributes):</span>
                      <div className="bg-white p-3 rounded-lg border border-[#E5E5E5] space-y-1.5 max-h-56 overflow-y-auto text-[#333333]">
                        {Object.entries(lookupResult.rawLdap).map(([key, value]) => (
                          <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 pb-1 border-b border-gray-100 last:border-0">
                            <span className="text-[#CF2F2F] font-bold shrink-0">{key}:</span>
                            <span className="text-[#333333] break-all">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{lookupResult.error}</span>
                  </div>
                )}
              </div>
            )}

            {!lookupResult && (
              <div className="p-4 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5] text-xs text-[#6D6E70] text-center py-8">
                جهت آزمایش واکشی اطلاعات پرسنل، کد پرسنلی را وارد نمایید.
              </div>
            )}

          </div>

          {/* Test Password Authentication Box (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-base text-[#333333]">
                تست احراز هویت کلمه عبور کاربر (Simple Bind Test)
              </h3>
              <p className="text-xs text-[#6D6E70] mt-0.5">
                بررسی صحت کلمه عبور وارد شده توسط پرسنل در سرور اکتیودایرکتوری مپنا
              </p>
            </div>

            <form onSubmit={handleTestUserAuth} className="space-y-3.5 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="block font-bold text-[#333333]">نام کاربری یا کد پرسنلی:</label>
                <input
                  type="text"
                  value={testUsername}
                  onChange={(e) => setTestUsername(e.target.value)}
                  placeholder="r.shahbazi"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white font-mono text-xs text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#333333]">کلمه عبور کاربری:</label>
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-white font-mono text-xs text-[#333333] focus:outline-none focus:border-[#CF2F2F]"
                />
              </div>

              <button
                type="submit"
                disabled={isTestingAuth}
                className="w-full py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isTestingAuth ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>{isTestingAuth ? 'در حال بررسی با Domain Controller...' : 'بررسی اعتبار رمز عبور در اکتیودایرکتوری'}</span>
              </button>
            </form>

            {authTestResult && (
              <div className={`p-4 rounded-xl border text-xs animate-fade-in ${
                authTestResult.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {authTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{authTestResult.success ? 'احراز هویت موفقیت‌آمیز بود' : 'احراز هویت ناموفق'}</span>
                  <span className="text-[10px] text-[#6D6E70] font-mono mr-auto">{authTestResult.timestamp}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{authTestResult.message}</p>
              </div>
            )}

            <div className="p-3.5 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5] text-[11px] text-[#6D6E70] space-y-1">
              <span className="font-bold text-[#333333] block">نکته حریم خصوصی:</span>
              <p>هیچ‌یک از کلمات عبور کاربران در دیتابیس سامانه ذخیره نمی‌گردند و اعتبارسنجی مستقیماً از طریق پروتکل LDAPS و رمزنگاری TLS صورت می‌پذیرد.</p>
            </div>

          </div>

        </div>
      )}

      {/* TAB 5: AUDIT & EVENT LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
            <div>
              <h3 className="font-bold text-base text-[#333333]">
                گزارش رویدادها و لاگ‌های احراز هویت LDAP
              </h3>
              <p className="text-xs text-[#6D6E70] mt-0.5">
                ثبت ورودهای موفق، خطاهای احراز هویت، نشست‌های همگام‌سازی و تغییرات پیکربندی
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logTypeFilter}
                onChange={(e) => setLogTypeFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] text-xs font-medium text-[#333333] focus:outline-none"
              >
                <option value="all">همه رویدادها</option>
                <option value="auth">ورود و احراز هویت</option>
                <option value="sync">همگام‌سازی کاربران</option>
                <option value="test">تست و عیب‌یابی</option>
                <option value="config">تغییرات پیکربندی</option>
              </select>

              <button
                type="button"
                onClick={handleClearLogs}
                className="px-3 py-1.5 rounded-xl border border-[#E5E5E5] hover:bg-[#F8F8F8] text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>پاکسازی لاگ‌ها</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 transition-colors ${
                    log.status === 'ok'
                      ? 'bg-white border-[#E5E5E5] hover:bg-[#F8F8F8]'
                      : log.status === 'warn'
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {log.status === 'ok' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : log.status === 'warn' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span className="font-bold text-[#333333]">{log.message}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.type === 'auth_success' ? 'bg-emerald-100 text-emerald-800' :
                        log.type === 'auth_failed' ? 'bg-rose-100 text-rose-800' :
                        log.type === 'sync' ? 'bg-blue-100 text-blue-800' :
                        log.type === 'config_update' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.type === 'auth_success' ? 'ورود موفق' :
                         log.type === 'auth_failed' ? 'خطای رمز' :
                         log.type === 'sync' ? 'همگام‌سازی' :
                         log.type === 'config_update' ? 'تغییر تنظیمات' : 'تست پینگ'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#6D6E70] font-mono">
                      <span>IP: {log.ipAddress}</span>
                      <span>•</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>

                  {log.details && (
                    <p className="text-[11px] text-[#6D6E70] font-mono pr-5 mt-0.5">
                      {log.details}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#6D6E70] bg-[#F8F8F8] rounded-xl border border-[#E5E5E5]">
                هیچ رویدادی با فیلتر انتخاب شده یافت نشد.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 6: REAL-TIME MONITORING & RECHARTS */}
      {activeSubTab === 'monitor' && (
        <LdapNetworkMonitor />
      )}

      {/* TAB 7: DISASTER RECOVERY & JSON BACKUP */}
      {activeSubTab === 'dr' && (
        <LdapDisasterRecoveryPanel
          config={config}
          onRestoreConfig={handleRestoreConfig}
        />
      )}

      {/* Export Report Modal */}
      <LdapExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={config}
        logs={logs}
        currentLatency={config.lastTestLatency || 38}
        activePool={18}
        totalAuth={3205}
      />

      {/* Disaster Recovery JSON Modal */}
      <LdapDisasterRecoveryModal
        isOpen={isDrModalOpen}
        onClose={() => setIsDrModalOpen(false)}
        config={config}
        onRestoreConfig={handleRestoreConfig}
      />

    </div>
  );
};
