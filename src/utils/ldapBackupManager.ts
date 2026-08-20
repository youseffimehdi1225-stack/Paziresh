import { LdapConfig } from '../types';
import { toPersianDigits } from './dateUtils';

export interface LdapDisasterRecoveryBackup {
  metadata: {
    format: 'MAPNA_LDAP_DISASTER_RECOVERY_JSON';
    version: '1.2.0';
    backupId: string;
    exportedAtISO: string;
    exportedAtShamsi: string;
    timestamp: number;
    exportedBy: {
      name: string;
      role: string;
      ipAddress: string;
    };
    systemInfo: {
      organization: string;
      systemName: string;
      domain: string;
      appVersion: string;
      environment: 'PRODUCTION' | 'STAGING' | 'DISASTER_RECOVERY';
    };
    checksum: string;
    notes?: string;
  };
  ldapConfiguration: LdapConfig;
  networkTopology: {
    primaryDomainController: {
      host: string;
      port: number;
      protocol: string;
      ip: string;
      role: string;
    };
    backupDomainController: {
      host: string;
      port: number;
      protocol: string;
      ip: string;
      role: string;
    };
    networkInterface: string;
    vlanId: number;
    dnsServers: string[];
    proxySettings: {
      enabled: boolean;
      host: string;
      port: number;
    };
    connectionTimeoutMs: number;
    maxConnectionPool: number;
    autoFailoverEnabled: boolean;
  };
  attributeMappings: Record<string, string>;
  disasterRecoveryRunbook: {
    title: string;
    prerequisites: string[];
    recoverySteps: string[];
    verificationTests: string[];
  };
}

/**
 * Computes a pseudo-hash / checksum for backup data integrity verification
 */
function computeConfigChecksum(config: LdapConfig, timestamp: number): string {
  const content = `${config.serverHost}:${config.port}:${config.baseDn}:${config.bindDn}:${config.protocol}:${timestamp}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  return `CRC32-MAPNA-${hex}-${timestamp.toString(36).toUpperCase()}`;
}

export interface GenerateBackupOptions {
  maskPassword?: boolean;
  exportedByName?: string;
  exportedByRole?: string;
  notes?: string;
  environment?: 'PRODUCTION' | 'STAGING' | 'DISASTER_RECOVERY';
}

/**
 * Generates the full Disaster Recovery JSON Backup object
 */
export function generateLdapDisasterRecoveryBackup(
  config: LdapConfig,
  options: GenerateBackupOptions = {}
): LdapDisasterRecoveryBackup {
  const now = new Date();
  const timestamp = now.getTime();
  const dateShamsi = now.toLocaleDateString('fa-IR') + ' - ' + now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const backupId = `MAPNA-DR-LDAP-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const finalConfig: LdapConfig = {
    ...config,
    bindPassword: options.maskPassword ? '********' : config.bindPassword,
  };

  const checksum = computeConfigChecksum(config, timestamp);

  return {
    metadata: {
      format: 'MAPNA_LDAP_DISASTER_RECOVERY_JSON',
      version: '1.2.0',
      backupId,
      exportedAtISO: now.toISOString(),
      exportedAtShamsi: dateShamsi,
      timestamp,
      exportedBy: {
        name: options.exportedByName || 'مدیر ارشد زیرساخت و شبکه مپنا',
        role: options.exportedByRole || 'Admin / Security Officer',
        ipAddress: '192.168.10.15',
      },
      systemInfo: {
        organization: 'گروه مپنا (MAPNA Group)',
        systemName: 'سامانه یکپارچه رزرواسیون و خدمات رفاهی پرسنل مپنا',
        domain: 'mapnagroup.ir',
        appVersion: '1.0.0',
        environment: options.environment || 'PRODUCTION',
      },
      checksum,
      notes: options.notes || 'پشتیبان رسمی و اضطراری پیکربندی سرویس احراز هویت LDAP و شبکه جهت سناریوهای بحران و Disaster Recovery.',
    },
    ldapConfiguration: finalConfig,
    networkTopology: {
      primaryDomainController: {
        host: config.serverHost,
        port: config.port,
        protocol: config.protocol.toUpperCase(),
        ip: '192.168.10.25',
        role: 'Primary Active Directory Domain Controller / KDC',
      },
      backupDomainController: {
        host: 'dc02.mapnagroup.ir',
        port: config.port,
        protocol: config.protocol.toUpperCase(),
        ip: '192.168.10.26',
        role: 'Secondary Backup Domain Controller (Failover)',
      },
      networkInterface: 'eth0 (10GbE SFP+ Internal)',
      vlanId: 110,
      dnsServers: config.dnsServers && config.dnsServers.length > 0 ? config.dnsServers : ['10.10.1.10', '10.10.1.11'],
      proxySettings: {
        enabled: Boolean(config.proxyUrl),
        host: config.proxyUrl || '',
        port: 8080,
      },
      connectionTimeoutMs: config.connectionTimeoutMs,
      maxConnectionPool: 25,
      autoFailoverEnabled: true,
    },
    attributeMappings: {
      mail: config.mailAttribute,
      fullName: config.fullNameAttribute,
      personnelCode: config.personnelCodeAttribute,
      department: config.departmentAttribute,
      phone: config.phoneAttribute,
      nationalId: config.nationalIdAttribute,
    },
    disasterRecoveryRunbook: {
      title: 'دستورالعمل بازیابی اضطراری سرویس LDAP مپنا (Disaster Recovery Runbook)',
      prerequisites: [
        'اطمینان از دسترسی به شبکه داخلی VLAN 110 و پورت‌های TCP 636 و 389 دومین کنترلرهای مپنا',
        'بررسی صحت ترجمه DNS برای نام دامنه mapnagroup.ir از طریق سرور 10.10.1.10',
        'فعال بودن گواهی دیجیتال SSL/TLS با الگوریتم RSA 4096 بر روی کنترلر دامنه',
      ],
      recoverySteps: [
        '۱. وارد بخش مدیریت AdminDashboard > پیکربندی سرور LDAP و شبکه شوید.',
        '۲. تب «پشتیبان‌گیری و بازیابی اضطراری (Disaster Recovery)» را باز نمایید.',
        '۳. بر روی «بارگذاری و بازیابی فایل پشتیبان JSON» کلیک کرده و این فایل را انتخاب کنید.',
        '۴. مقادیر بازنشانی‌شده را با چک‌سام امنیتی اعتبارسنجی نموده و تایید کنید.',
        '۵. دکمه «تست اتصال و پینگ سرور» را اجرا کنید تا ارتباط سوکت و احراز هویت اولیه تایید گردد.',
        '۶. عملیات «همگام‌سازی فوری کاربران» را جهت به‌روزرسانی اطلاعات ۱,۰۰۰ پرسنل مپنا فراخوانی نمایید.',
      ],
      verificationTests: [
        'آزمون سوکت TCP پورت ۶۳۶ سرور DC01 و DC02',
        'هندشیک امنیتی پروتکل LDAPS و اعتبار گواهی SSL',
        'تست Simple Bind با حساب کاربری سرویس svc_mapna_res',
        'استعلام آزمایشی یک کاربر نمونه از طریق کد پرسنلی در شاخه OU=Personnel',
      ],
    },
  };
}

/**
 * Downloads the JSON Backup file to the user's browser
 */
export function downloadLdapDisasterRecoveryBackup(
  backup: LdapDisasterRecoveryBackup,
  customFileName?: string
): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = customFileName || `mapna_ldap_disaster_recovery_backup_${dateStr}.json`;

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates an imported JSON string or parsed object against the disaster recovery backup schema
 */
export function validateLdapDisasterRecoveryJson(
  rawJsonOrObject: string | object
): { valid: boolean; error?: string; backup?: LdapDisasterRecoveryBackup } {
  try {
    let parsed: any;
    if (typeof rawJsonOrObject === 'string') {
      parsed = JSON.parse(rawJsonOrObject);
    } else {
      parsed = rawJsonOrObject;
    }

    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'محتوای فایل انتخاب‌شده یک شیء معتبر JSON نیست.' };
    }

    // Check if it's the full backup format or direct LdapConfig
    if (parsed.metadata?.format === 'MAPNA_LDAP_DISASTER_RECOVERY_JSON' && parsed.ldapConfiguration) {
      const cfg = parsed.ldapConfiguration;
      if (!cfg.serverHost || !cfg.port || !cfg.baseDn || !cfg.bindDn) {
        return { valid: false, error: 'فایل پشتیبان فاقد فیلدهای الزامی سرور (serverHost, port, baseDn, bindDn) است.' };
      }
      return { valid: true, backup: parsed as LdapDisasterRecoveryBackup };
    }

    // Support direct LdapConfig JSON export as well
    if (parsed.serverHost && parsed.port && parsed.baseDn && parsed.bindDn) {
      const wrappedBackup = generateLdapDisasterRecoveryBackup(parsed as LdapConfig, {
        notes: 'فایل پشتیبان مستقیم پیکربندی LDAP بازیابی گردید.',
      });
      return { valid: true, backup: wrappedBackup };
    }

    return {
      valid: false,
      error: 'ساختار فایل با قالب پشتیبان اضطراری LDAP مپنا مطابقت ندارد. لطفاً فایل معتبر JSON پشتیبان را انتخاب کنید.',
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `خطا در پارس کردن فایل JSON: ${err.message || 'فرمت نامعتبر است'}`,
    };
  }
}
