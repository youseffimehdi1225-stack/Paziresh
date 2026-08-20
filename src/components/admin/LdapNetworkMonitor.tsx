import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { toPersianDigits } from '../../utils/dateUtils';
import { DEFAULT_LDAP_CONFIG, INITIAL_LDAP_LOGS } from '../../data/mockData';
import { LdapConfig, LdapLogEntry } from '../../types';
import { LdapExportReportModal } from './LdapExportReportModal';
import {
  Activity,
  Server,
  Network,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  RefreshCw,
  Zap,
  Play,
  Pause,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  Wifi,
  WifiOff,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface NetworkNode {
  id: string;
  name: string;
  role: string;
  ip: string;
  port: number;
  protocol: string;
  status: 'healthy' | 'degraded' | 'offline';
  latency: number;
  uptime: number;
  packetLoss: number;
  lastChecked: string;
}

interface LatencyDataPoint {
  time: string;
  latencyDc1: number;
  latencyDc2: number;
  dnsLookupTime: number;
  threshold: number;
}

const INITIAL_LATENCY_DATA: LatencyDataPoint[] = [
  { time: '۰۸:۰۰', latencyDc1: 34, latencyDc2: 38, dnsLookupTime: 4, threshold: 80 },
  { time: '۰۸:۱۵', latencyDc1: 38, latencyDc2: 42, dnsLookupTime: 5, threshold: 80 },
  { time: '۰۸:۳۰', latencyDc1: 45, latencyDc2: 49, dnsLookupTime: 6, threshold: 80 },
  { time: '۰۸:۴۵', latencyDc1: 52, latencyDc2: 56, dnsLookupTime: 7, threshold: 80 },
  { time: '۰۹:۰۰', latencyDc1: 42, latencyDc2: 46, dnsLookupTime: 4, threshold: 80 },
  { time: '۰۹:۱۵', latencyDc1: 39, latencyDc2: 43, dnsLookupTime: 5, threshold: 80 },
  { time: '۰۹:۳۰', latencyDc1: 48, latencyDc2: 51, dnsLookupTime: 6, threshold: 80 },
  { time: '۰۹:۴۵', latencyDc1: 41, latencyDc2: 45, dnsLookupTime: 4, threshold: 80 },
  { time: '۱۰:۰۰', latencyDc1: 36, latencyDc2: 40, dnsLookupTime: 4, threshold: 80 },
  { time: '۱۰:۱۵', latencyDc1: 44, latencyDc2: 47, dnsLookupTime: 5, threshold: 80 },
  { time: '۱۰:۳۰', latencyDc1: 39, latencyDc2: 42, dnsLookupTime: 4, threshold: 80 },
  { time: '۱۰:۴۵', latencyDc1: 42, latencyDc2: 46, dnsLookupTime: 5, threshold: 80 },
];

const HOURLY_AUTH_VOLUME = [
  { hour: '۰۷:۰۰', success: 120, failed: 2, sso: 110 },
  { hour: '۰۸:۰۰', success: 380, failed: 8, sso: 350 },
  { hour: '۰۹:۰۰', success: 540, failed: 12, sso: 500 },
  { hour: '۱۰:۰۰', success: 420, failed: 6, sso: 390 },
  { hour: '۱۱:۰۰', success: 310, failed: 4, sso: 290 },
  { hour: '۱۲:۰۰', success: 280, failed: 3, sso: 260 },
  { hour: '۱۳:۰۰', success: 460, failed: 9, sso: 430 },
  { hour: '۱۴:۰۰', success: 390, failed: 5, sso: 360 },
  { hour: '۱۵:۰۰', success: 210, failed: 2, sso: 195 },
  { hour: '۱۶:۰۰', success: 95, failed: 1, sso: 90 },
];

const PROTOCOL_DISTRIBUTION = [
  { name: 'LDAPS (SSL/TLS 636)', value: 68, color: '#CF2F2F' },
  { name: 'Kerberos SSO', value: 24, color: '#10B981' },
  { name: 'StartTLS (389)', value: 6, color: '#3B82F6' },
  { name: 'Local Auth Fallback', value: 2, color: '#F59E0B' },
];

export const LdapNetworkMonitor: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(3);
  const [latencyData, setLatencyData] = useState<LatencyDataPoint[]>(INITIAL_LATENCY_DATA);
  const [activePoolConnections, setActivePoolConnections] = useState(18);
  const [totalAuthCount, setTotalAuthCount] = useState(3205);
  const [currentLatency, setCurrentLatency] = useState(38);
  const [isInjectingSpike, setIsInjectingSpike] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Network Nodes Status
  const [nodes, setNodes] = useState<NetworkNode[]>([
    {
      id: 'node-dc01',
      name: 'DC01.mapnagroup.ir',
      role: 'دومین کنترلر اصلی (Primary LDAP / KDC)',
      ip: '192.168.10.25',
      port: 636,
      protocol: 'LDAPS (TLS 1.3)',
      status: 'healthy',
      latency: 38,
      uptime: 99.98,
      packetLoss: 0,
      lastChecked: 'هم‌اکنون',
    },
    {
      id: 'node-dc02',
      name: 'DC02.mapnagroup.ir',
      role: 'دومین کنترلر رزرو (Secondary LDAP / Backup)',
      ip: '192.168.10.26',
      port: 636,
      protocol: 'LDAPS (TLS 1.3)',
      status: 'healthy',
      latency: 42,
      uptime: 99.95,
      packetLoss: 0,
      lastChecked: 'هم‌اکنون',
    },
    {
      id: 'node-dns01',
      name: 'DNS-Core-01',
      role: 'سرور نام دامنه داخلی مپنا',
      ip: '10.10.1.10',
      port: 53,
      protocol: 'DNS / UDP',
      status: 'healthy',
      latency: 4,
      uptime: 100,
      packetLoss: 0,
      lastChecked: 'هم‌اکنون',
    },
    {
      id: 'node-proxy',
      name: 'Proxy-GW.mapna',
      role: 'دروازه شبکه و پروکسی اینترانت',
      ip: '192.168.10.1',
      port: 8080,
      protocol: 'HTTP Proxy',
      status: 'healthy',
      latency: 2,
      uptime: 99.99,
      packetLoss: 0,
      lastChecked: 'هم‌اکنون',
    },
  ]);

  // Real-time ticking effect
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Generate realistic jitter
      const jitter1 = Math.floor((Math.random() - 0.5) * 8);
      const newLat1 = Math.max(25, Math.min(85, 38 + jitter1));
      const newLat2 = Math.max(28, Math.min(90, newLat1 + Math.floor(Math.random() * 6)));
      const newDns = Math.max(2, Math.min(10, 4 + Math.floor(Math.random() * 3)));

      setCurrentLatency(newLat1);
      setActivePoolConnections(prev => Math.max(12, Math.min(45, prev + Math.floor((Math.random() - 0.48) * 3))));
      setTotalAuthCount(prev => prev + Math.floor(1 + Math.random() * 3));

      setLatencyData(prev => {
        const next = [...prev.slice(1), {
          time: timeLabel,
          latencyDc1: newLat1,
          latencyDc2: newLat2,
          dnsLookupTime: newDns,
          threshold: 80,
        }];
        return next;
      });

      // Update node latencies
      setNodes(prev => prev.map(node => {
        if (node.id === 'node-dc01') return { ...node, latency: newLat1 };
        if (node.id === 'node-dc02') return { ...node, latency: newLat2 };
        if (node.id === 'node-dns01') return { ...node, latency: newDns };
        return node;
      }));

    }, refreshIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [isLive, refreshIntervalSec]);

  // Simulate Instant Ping Spike & Measurement
  const handleTriggerTestPing = () => {
    setIsInjectingSpike(true);
    setTimeout(() => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setLatencyData(prev => [
        ...prev.slice(1),
        {
          time: timeLabel,
          latencyDc1: 29,
          latencyDc2: 33,
          dnsLookupTime: 3,
          threshold: 80,
        }
      ]);
      setCurrentLatency(29);
      setIsInjectingSpike(false);
    }, 400);
  };

  return (
    <div id="ldap-network-live-monitor" className="space-y-5 animate-fade-in">
      
      {/* Top Telemetry Control & Metrics Grid */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-xs space-y-4">
        
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#CF2F2F] shrink-0">
              <Activity className="w-5 h-5 text-[#CF2F2F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[#333333]">
                  مرکز مانیتورینگ بلادرنگ سلامت شبکه و سرورهای احراز هویت
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                  isLive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span>{isLive ? 'پایش زنده فعال (Live)' : 'متوقف شده (Paused)'}</span>
                </span>
              </div>
              <p className="text-xs text-[#6D6E70] mt-0.5">
                سنجش بلادرنگ پینگ، زمان پاسخ‌دهی (RTT)، اتصال سوکت‌های LDAPS و بار پردازش احراز هویت ۱,۰۰۰ پرسنل مپنا
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsLive(!isLive)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isLive
                  ? 'bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#333333] border-[#E5E5E5]'
                  : 'bg-[#CF2F2F] hover:bg-[#B72424] text-white border-[#CF2F2F]'
              }`}
            >
              {isLive ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#CF2F2F]" />
                  <span>توقف پایش</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>شروع پایش زنده</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isInjectingSpike}
              onClick={handleTriggerTestPing}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
            >
              <Zap className={`w-3.5 h-3.5 text-emerald-600 ${isInjectingSpike ? 'animate-spin' : ''}`} />
              <span>ارسال پینگ فوری</span>
            </button>

            <button
              id="btn-open-ldap-export-modal"
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#333333] hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>خروجی گزارش (PDF / Excel)</span>
            </button>
          </div>
        </div>

        {/* 4 Live Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="p-3.5 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5]">
            <div className="flex items-center justify-between text-[#6D6E70] text-xs">
              <span>زمان پاسخ لحظه‌ای (RTT)</span>
              <Radio className="w-3.5 h-3.5 text-[#CF2F2F]" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <strong className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">
                {toPersianDigits(currentLatency)}
              </strong>
              <span className="text-xs text-[#6D6E70]">میلی‌ثانیه</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
              وضعیت عالی (زیر ۵۰ms)
            </span>
          </div>

          <div className="p-3.5 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5]">
            <div className="flex items-center justify-between text-[#6D6E70] text-xs">
              <span>اتصالات فعال در Pool</span>
              <Layers className="w-3.5 h-3.5 text-[#6D6E70]" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <strong className="text-xl sm:text-2xl font-bold font-mono text-[#333333]">
                {toPersianDigits(activePoolConnections)}
              </strong>
              <span className="text-xs text-[#6D6E70]">از ۵۰ سوکت</span>
            </div>
            <span className="text-[10px] text-[#6D6E70] mt-1 block">
              ظرفیت مصرفی: ۳۶٪
            </span>
          </div>

          <div className="p-3.5 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5]">
            <div className="flex items-center justify-between text-[#6D6E70] text-xs">
              <span>درخواست‌های موفق احراز هویت</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <strong className="text-xl sm:text-2xl font-bold font-mono text-[#333333]">
                {toPersianDigits(totalAuthCount)}
              </strong>
              <span className="text-xs text-[#6D6E70]">نشست</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
              نرخ موفقیت ۹۹.۸٪
            </span>
          </div>

          <div className="p-3.5 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5]">
            <div className="flex items-center justify-between text-[#6D6E70] text-xs">
              <span>پایداری سرویس (Uptime)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <strong className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">
                {toPersianDigits(99.98)}٪
              </strong>
            </div>
            <span className="text-[10px] text-[#6D6E70] mt-1 block">
              بدون قطعی در ۳۰ روز اخیر
            </span>
          </div>

        </div>

      </div>

      {/* Network Nodes Grid */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-xs space-y-3">
        <h4 className="font-bold text-xs sm:text-sm text-[#333333] flex items-center justify-between">
          <span>وضعیت گره‌ها و سرویس‌های زیرساخت شبکه مپنا:</span>
          <span className="text-[11px] text-[#6D6E70]">۴ گره پایش‌شده</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {nodes.map(node => (
            <div key={node.id} className="p-3.5 bg-[#F8F8F8] rounded-xl border border-[#E5E5E5] space-y-2 hover:border-[#CF2F2F] transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-[#333333]">
                  <Server className="w-3.5 h-3.5 text-[#CF2F2F] shrink-0" />
                  <span className="font-mono text-xs truncate">{node.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  عملیاتی
                </span>
              </div>

              <p className="text-[11px] text-[#6D6E70] truncate">{node.role}</p>

              <div className="pt-2 border-t border-[#E5E5E5] space-y-1 text-[11px] font-mono text-[#6D6E70]">
                <div className="flex justify-between">
                  <span>IP / Port:</span>
                  <span className="text-[#333333]">{node.ip}:{node.port}</span>
                </div>
                <div className="flex justify-between">
                  <span>Latency:</span>
                  <span className="text-emerald-700 font-bold">{toPersianDigits(node.latency)} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Packet Loss:</span>
                  <span className="text-[#333333]">{toPersianDigits(node.packetLoss)}٪</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECHARTS SECTION 1: Real-time Latency & RTT Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Real-time Latency Area/Line Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E5E5E5]">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#333333]">
                روند زنده زمان پاسخ و پینگ سرورهای LDAP (RTT in ms)
              </h4>
              <p className="text-[11px] text-[#6D6E70] mt-0.5">
                مقایسه تاخیر شبکه دامین کنترلر اصلی (DC01)، دامین کنترلر رزرو (DC02) و سرور DNS
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-[#6D6E70]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#CF2F2F]" />
                <span>DC01 (Primary)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                <span>DC02 (Backup)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span>DNS Core</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDc1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CF2F2F" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#CF2F2F" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDc2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 11, fill: '#6D6E70' }} 
                  stroke="#E5E5E5"
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 11, fill: '#6D6E70' }} 
                  stroke="#E5E5E5"
                  unit="ms"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '12px', 
                    border: '1px solid #E5E5E5', 
                    fontSize: '12px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    direction: 'rtl'
                  }}
                  formatter={(value: any, name: any) => {
                    const label = name === 'latencyDc1' ? 'دامین کنترلر DC01' : name === 'latencyDc2' ? 'دامین کنترلر DC02' : 'سرور DNS';
                    return [`${value} میلی‌ثانیه`, label];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="latencyDc1" 
                  stroke="#CF2F2F" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorDc1)" 
                  name="latencyDc1"
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="latencyDc2" 
                  stroke="#3B82F6" 
                  strokeWidth={1.8} 
                  strokeDasharray="4 4" 
                  dot={false}
                  name="latencyDc2"
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="dnsLookupTime" 
                  stroke="#10B981" 
                  strokeWidth={1.5} 
                  dot={false}
                  name="dnsLookupTime"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocol Distribution Donut Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-xs space-y-3">
          <div className="pb-2 border-b border-[#E5E5E5]">
            <h4 className="font-bold text-xs sm:text-sm text-[#333333]">
              توزیع پروتکل‌های احراز هویت
            </h4>
            <p className="text-[11px] text-[#6D6E70] mt-0.5">
              سهم نشست‌های LDAPS، Kerberos SSO و روش‌های جایگزین
            </p>
          </div>

          <div className="h-44 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PROTOCOL_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {PROTOCOL_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '12px', 
                    border: '1px solid #E5E5E5', 
                    fontSize: '12px' 
                  }}
                  formatter={(val: any) => [`${val}٪`, 'سهم پروتکل']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {PROTOCOL_DISTRIBUTION.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[#333333] text-[11px]">{item.name}</span>
                </div>
                <strong className="font-mono text-[11px] text-[#333333]">{toPersianDigits(item.value)}٪</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RECHARTS SECTION 2: Hourly Authentication Volume Bar Chart */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E5E5E5]">
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[#333333]">
              حجم درخواست‌های احراز هویت در ساعات کاری سازمان (Traffic Volume)
            </h4>
            <p className="text-[11px] text-[#6D6E70] mt-0.5">
              تعداد ورود موفق پرسنل، نشست‌های SSO خودکار و موارد ناموفق در طول روز
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-[#6D6E70]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CF2F2F]" />
              <span>احراز هویت موفق (LDAP/AD)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span>ورود یکتا (SSO Kerberos)</span>
            </span>
          </div>
        </div>

        <div className="h-56 w-full pt-2" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HOURLY_AUTH_VOLUME} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6D6E70' }} stroke="#E5E5E5" />
              <YAxis tick={{ fontSize: 11, fill: '#6D6E70' }} stroke="#E5E5E5" />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E5E5', 
                  fontSize: '12px',
                  direction: 'rtl'
                }}
                formatter={(value: any, name: any) => {
                  return [`${value} نشست`, name === 'success' ? 'ورود موفق' : 'ورود خودکار SSO'];
                }}
              />
              <Bar dataKey="success" fill="#CF2F2F" radius={[4, 4, 0, 0]} name="success" />
              <Bar dataKey="sso" fill="#10B981" radius={[4, 4, 0, 0]} name="sso" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Report Modal */}
      <LdapExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={DEFAULT_LDAP_CONFIG}
        logs={INITIAL_LDAP_LOGS}
        currentLatency={currentLatency}
        activePool={activePoolConnections}
        totalAuth={totalAuthCount}
      />

    </div>
  );
};
