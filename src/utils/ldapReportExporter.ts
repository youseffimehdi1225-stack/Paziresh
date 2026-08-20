import { jsPDF } from 'jspdf';
import { toPersianDigits } from './dateUtils';
import { LdapConfig, LdapLogEntry } from '../types';

export interface LdapReportData {
  config: LdapConfig;
  logs: LdapLogEntry[];
  summary: {
    currentLatency: number;
    activePool: number;
    totalAuth: number;
    uptime: number;
    generatedAtShamsi: string;
    generatedAtIso: string;
    generatedBy: string;
  };
  nodes: Array<{
    name: string;
    role: string;
    ip: string;
    port: number;
    protocol: string;
    status: string;
    latency: number;
    uptime: number;
    packetLoss: number;
  }>;
  latencyTrend: Array<{
    time: string;
    latencyDc1: number;
    latencyDc2: number;
    dnsLookupTime: number;
  }>;
  hourlyAuth: Array<{
    hour: string;
    success: number;
    sso: number;
    failed: number;
  }>;
}

/**
 * Generates an Excel-compatible XML Spreadsheet (SpreadsheetML) file with multiple worksheets,
 * RTL support, styles, headers, and colored status cells.
 */
export const exportLdapToExcel = (data: LdapReportData, filenamePrefix: string = 'گزارش_مانیتورینگ_LDAP_مپنا') => {
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `${filenamePrefix}_${dateStr}.xls`;

  // XML Spreadsheet 2003 format
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>${data.summary.generatedBy}</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>گروه مپنا (MAPNA Group)</Company>
  <Title>گزارش سلامت و مانیتورینگ سرویس‌های LDAP و شبکه سازمانی مپنا</Title>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
   <Borders/>
   <Font ss:FontName="Tahoma" ss:Size="10" ss:Color="#333333"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderTitle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Tahoma" ss:Size="14" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#CF2F2F" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Tahoma" ss:Size="11" ss:Bold="1" ss:Color="#333333"/>
   <Interior ss:Color="#F0F0F0" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="ColHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Tahoma" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#333333" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
   </Borders>
  </Style>
  <Style ss:ID="DataCell">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
   </Borders>
  </Style>
  <Style ss:ID="DataCellCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
   </Borders>
  </Style>
  <Style ss:ID="SuccessBadge">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Tahoma" ss:Size="9" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#10B981"/>
   </Borders>
  </Style>
 </Styles>

 <!-- WORKSHEET 1: Executive Summary & KPIs -->
 <Worksheet ss:Name="خلاصه وضعیت و شاخص‌ها" ss:RightToLeft="1">
  <Table ss:ExpandedColumnCount="5" ss:DefaultRowHeight="22">
   <Column ss:Width="160"/>
   <Column ss:Width="220"/>
   <Column ss:Width="140"/>
   <Column ss:Width="160"/>
   <Row ss:Height="36">
    <Cell ss:MergeAcross="3" ss:StyleID="HeaderTitle"><Data ss:Type="String">گزارش جامع وضعیت سلامت سرور LDAP و شبکه سازمانی - گروه مپنا</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:MergeAcross="3" ss:StyleID="SubHeader"><Data ss:Type="String">اطلاعات کلی گزارش و مشخصات تولید</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">تاریخ و زمان گزارش:</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${data.summary.generatedAtShamsi} (${data.summary.generatedAtIso})</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">تولیدکننده:</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${data.summary.generatedBy}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">دامنه و سرور اصلی:</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${data.config.serverHost}:${data.config.port} (${data.config.protocol})</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">وضعیت ارتباط:</Data></Cell>
    <Cell ss:StyleID="SuccessBadge"><Data ss:Type="String">متصل و پایدار (Connected)</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>
   <Row ss:Height="24">
    <Cell ss:MergeAcross="3" ss:StyleID="SubHeader"><Data ss:Type="String">شاخص‌های کلیدی عملکرد (KPIs)</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">زمان پاسخ لحظه‌ای (RTT):</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${data.summary.currentLatency} میلی‌ثانیه</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">پایداری کل (Uptime):</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${data.summary.uptime}٪</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">اتصالات فعال در Pool:</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${data.summary.activePool} از ۵۰ سوکت</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">مجموع نشست‌های احراز هویت:</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${data.summary.totalAuth} نشست موفق</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>
   <Row ss:Height="24">
    <Cell ss:MergeAcross="3" ss:StyleID="SubHeader"><Data ss:Type="String">تنظیمات پایه‌ای LDAP سازمانی مپنا</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">Base DN:</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${data.config.baseDn}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">User Search Base:</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${data.config.userSearchBase}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">Bind Service Account:</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${data.config.bindDn}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">سرورهای DNS مپنا:</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${data.config.dnsServers.join(' , ')}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- WORKSHEET 2: Network Nodes -->
 <Worksheet ss:Name="گره‌های شبکه و سرورها" ss:RightToLeft="1">
  <Table ss:ExpandedColumnCount="7" ss:DefaultRowHeight="20">
   <Column ss:Width="160"/>
   <Column ss:Width="240"/>
   <Column ss:Width="120"/>
   <Column ss:Width="80"/>
   <Column ss:Width="120"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">نام سرور / گره</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">نقش در زیرساخت مپنا</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">آدرس IP</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">پورت</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">پروتکل</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">تاخیر (ms)</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">وضعیت سلامت</Data></Cell>
   </Row>
   ${data.nodes.map(n => `
   <Row>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${n.name}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${n.role}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="String">${n.ip}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="Number">${n.port}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="String">${n.protocol}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="Number">${n.latency}</Data></Cell>
    <Cell ss:StyleID="SuccessBadge"><Data ss:Type="String">عملیاتی (Healthy)</Data></Cell>
   </Row>
   `).join('')}
  </Table>
 </Worksheet>

 <!-- WORKSHEET 3: Latency Telemetry -->
 <Worksheet ss:Name="روند تاخیر و RTT" ss:RightToLeft="1">
  <Table ss:ExpandedColumnCount="4" ss:DefaultRowHeight="20">
   <Column ss:Width="120"/>
   <Column ss:Width="160"/>
   <Column ss:Width="160"/>
   <Column ss:Width="160"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">زمان پایش</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">تاخیر DC01 اصلی (ms)</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">تاخیر DC02 رزرو (ms)</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">زمان پاسخ DNS (ms)</Data></Cell>
   </Row>
   ${data.latencyTrend.map(t => `
   <Row>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="String">${t.time}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="Number">${t.latencyDc1}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="Number">${t.latencyDc2}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="Number">${t.dnsLookupTime}</Data></Cell>
   </Row>
   `).join('')}
  </Table>
 </Worksheet>

 <!-- WORKSHEET 4: Hourly Auth Volume -->
 <Worksheet ss:Name="ترافیک احراز هویت ساعتی" ss:RightToLeft="1">
  <Table ss:ExpandedColumnCount="4" ss:DefaultRowHeight="20">
   <Column ss:Width="120"/>
   <Column ss:Width="160"/>
   <Column ss:Width="160"/>
   <Column ss:Width="140"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">ساعت کاری</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">احراز هویت موفق (LDAP)</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">ورود خودکار (SSO Kerberos)</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">خطای ورود / تلاش مجدد</Data></Cell>
   </Row>
   ${data.hourlyAuth.map(h => `
   <Row>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="String">${h.hour}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="Number">${h.success}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="Number">${h.sso}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="Number">${h.failed}</Data></Cell>
   </Row>
   `).join('')}
  </Table>
 </Worksheet>

 <!-- WORKSHEET 5: Security & Audit Logs -->
 <Worksheet ss:Name="لاگ رویدادهای LDAP" ss:RightToLeft="1">
  <Table ss:ExpandedColumnCount="6" ss:DefaultRowHeight="20">
   <Column ss:Width="140"/>
   <Column ss:Width="120"/>
   <Column ss:Width="140"/>
   <Column ss:Width="120"/>
   <Column ss:Width="100"/>
   <Column ss:Width="300"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">زمان رویداد</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">نوع رویداد</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">حساب کاربری</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">آدرس IP</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">وضعیت</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">جزئیات فنی</Data></Cell>
   </Row>
   ${data.logs.map(l => `
   <Row>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="String">${l.timestamp}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="String">${
      l.type === 'auth_success' ? 'ورود موفق' :
      l.type === 'auth_failed' ? 'خطای ورود' :
      l.type === 'sync' ? 'همگام‌سازی پرسنل' :
      l.type === 'config_update' ? 'تغییر تنظیمات' : 'تست اتصال'
    }</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="String">${l.username || 'سیستم'}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="String">${l.ipAddress}</Data></Cell>
    <Cell ss:StyleID="${l.status === 'ok' ? 'SuccessBadge' : 'DataCellCenter'}"><Data ss:Type="String">${l.status === 'ok' ? 'موفق' : 'ناموفق'}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${l.details || ''}</Data></Cell>
   </Row>
   `).join('')}
  </Table>
 </Worksheet>

</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Generates a clean PDF document using jsPDF with formatted layout, executive metadata,
 * KPIs, node table and audit logs.
 */
export const exportLdapToPdf = (data: LdapReportData, filenamePrefix: string = 'گزارش_مانیتورینگ_LDAP_مپنا') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `${filenamePrefix}_${dateStr}.pdf`;

  // Draw Header Banner
  doc.setFillColor(207, 47, 47); // MAPNA Red #CF2F2F
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('MAPNA Group - IT Infrastructure & LDAP Monitoring Report', pageWidth / 2, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Corporate Authentication, Active Directory Health & Telemetry Audit', pageWidth / 2, 20, { align: 'center' });

  // Metadata block
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(9);
  doc.text(`Generated At: ${data.summary.generatedAtIso} (${data.summary.generatedAtShamsi})`, 14, 36);
  doc.text(`Generated By: ${data.summary.generatedBy}`, 14, 42);
  doc.text(`Primary Host: ${data.config.serverHost}:${data.config.port} (${data.config.protocol})`, 14, 48);
  doc.text(`Base DN: ${data.config.baseDn}`, 14, 54);

  // Executive KPI summary box
  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(229, 229, 229);
  doc.roundedRect(14, 60, pageWidth - 28, 24, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(109, 110, 112);
  doc.text('Current RTT (ms)', 24, 68);
  doc.text('Pool Connections', 68, 68);
  doc.text('Total Auths', 118, 68);
  doc.text('System Uptime', 162, 68);

  doc.setFontSize(14);
  doc.setTextColor(207, 47, 47);
  doc.text(`${data.summary.currentLatency} ms`, 24, 76);
  doc.setTextColor(51, 51, 51);
  doc.text(`${data.summary.activePool} / 50`, 68, 76);
  doc.text(`${data.summary.totalAuth}`, 118, 76);
  doc.setTextColor(4, 120, 87);
  doc.text(`${data.summary.uptime}%`, 162, 76);

  // Section 1: Network Nodes
  doc.setFontSize(11);
  doc.setTextColor(51, 51, 51);
  doc.text('1. Infrastructure Nodes & Server Status', 14, 94);

  let y = 100;
  // Node Table Header
  doc.setFillColor(51, 51, 51);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Node / Hostname', 18, y + 5);
  doc.text('Role Description', 60, y + 5);
  doc.text('IP:Port', 115, y + 5);
  doc.text('Protocol', 145, y + 5);
  doc.text('Latency', 170, y + 5);
  doc.text('Status', 188, y + 5);

  y += 7;
  doc.setTextColor(51, 51, 51);
  data.nodes.forEach((node, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 248, 248);
      doc.rect(14, y, pageWidth - 28, 6, 'F');
    }
    doc.setFontSize(7.5);
    doc.text(node.name, 18, y + 4.5);
    doc.text(node.role.slice(0, 32), 60, y + 4.5);
    doc.text(`${node.ip}:${node.port}`, 115, y + 4.5);
    doc.text(node.protocol, 145, y + 4.5);
    doc.text(`${node.latency} ms`, 170, y + 4.5);
    doc.setTextColor(4, 120, 87);
    doc.text('HEALTHY', 188, y + 4.5);
    doc.setTextColor(51, 51, 51);
    y += 6;
  });

  // Section 2: Hourly Authentication Traffic
  y += 6;
  doc.setFontSize(11);
  doc.setTextColor(51, 51, 51);
  doc.text('2. Hourly Authentication Volume & Kerberos SSO Rate', 14, y);

  y += 6;
  doc.setFillColor(51, 51, 51);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Time Window', 18, y + 5);
  doc.text('Successful LDAP Auths', 65, y + 5);
  doc.text('Kerberos SSO Sessions', 120, y + 5);
  doc.text('Failed / Retried', 170, y + 5);

  y += 7;
  doc.setTextColor(51, 51, 51);
  data.hourlyAuth.slice(0, 6).forEach((h, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 248, 248);
      doc.rect(14, y, pageWidth - 28, 6, 'F');
    }
    doc.setFontSize(7.5);
    doc.text(h.hour, 18, y + 4.5);
    doc.text(String(h.success), 65, y + 4.5);
    doc.text(String(h.sso), 120, y + 4.5);
    doc.text(String(h.failed), 170, y + 4.5);
    y += 6;
  });

  // Section 3: Recent Audit Logs
  y += 6;
  doc.setFontSize(11);
  doc.setTextColor(51, 51, 51);
  doc.text('3. Recent Security & LDAP Event Logs', 14, y);

  y += 6;
  doc.setFillColor(51, 51, 51);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Timestamp', 18, y + 5);
  doc.text('Event Type', 50, y + 5);
  doc.text('User / Account', 85, y + 5);
  doc.text('Client IP', 125, y + 5);
  doc.text('Status', 155, y + 5);
  doc.text('Details', 175, y + 5);

  y += 7;
  doc.setTextColor(51, 51, 51);
  data.logs.slice(0, 10).forEach((l, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 248, 248);
      doc.rect(14, y, pageWidth - 28, 5.5, 'F');
    }
    doc.setFontSize(7);
    doc.text(l.timestamp.slice(0, 16), 18, y + 4);
    doc.text(l.type, 50, y + 4);
    doc.text(l.username || 'system', 85, y + 4);
    doc.text(l.ipAddress, 125, y + 4);
    if (l.status === 'ok') {
      doc.setTextColor(4, 120, 87);
      doc.text('OK', 155, y + 4);
    } else {
      doc.setTextColor(207, 47, 47);
      doc.text('FAIL', 155, y + 4);
    }
    doc.setTextColor(51, 51, 51);
    doc.text((l.details || '').slice(0, 22), 175, y + 4);
    y += 5.5;
  });

  // Footer stamp
  doc.setDrawColor(229, 229, 229);
  doc.line(14, 280, pageWidth - 14, 280);
  doc.setFontSize(8);
  doc.setTextColor(109, 110, 112);
  doc.text('MAPNA Group IT Security & Identity Management - Confidential Document', 14, 286);
  doc.text('Page 1 of 1', pageWidth - 28, 286);

  doc.save(fileName);
};
