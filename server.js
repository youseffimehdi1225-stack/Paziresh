import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  database: process.env.MYSQL_DATABASE || 'paziresh',
  user: process.env.MYSQL_USER || 'paziresh_app',
  password: process.env.MYSQL_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore({}, pool);
const sessionSecret = process.env.SESSION_SECRET;
if (process.env.NODE_ENV === 'production' && (!sessionSecret || sessionSecret.length < 32)) throw new Error('SESSION_SECRET must be at least 32 characters in production');

const trustProxy = process.env.TRUST_PROXY === '1' ? 'loopback' : (process.env.TRUST_PROXY || false);
app.set('trust proxy', trustProxy);
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.socket?.remoteAddress || 'iisnode-client',
}));
app.use(session({
  name: 'paziresh.sid', secret: sessionSecret || crypto.randomBytes(32).toString('hex'), store: sessionStore,
  resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 60 * 60 * 1000 },
}));

const ssoHeader = process.env.SSO_HEADER || 'LOGON_USER';
const normaliseUsername = (value) => String(value || '').replace(/^.*[\\/]/, '').trim().toLowerCase();
async function resolveSsoUser(req) {
  const rawUsername = process.env.NODE_ENV === 'production'
    ? req.headers['x-iisnode-logon-user']
    : req.headers[ssoHeader.toLowerCase()] || req.headers['x-auth-user'] || req.headers['x-iisnode-logon-user'];
  const username = normaliseUsername(rawUsername);
  if (!username) return null;
  const [rows] = await pool.execute(
    'SELECT id, username, full_name AS fullName, email, personnel_code AS personnelCode, department, role, is_active AS isActive FROM users WHERE LOWER(username) IN (?, ?) LIMIT 1',
    [username, String(rawUsername).trim().toLowerCase()],
  );
  return rows[0] || null;
}
async function requireAuth(req, res, next) {
  try {
    if (!req.session.user) req.session.user = await resolveSsoUser(req);
    if (!req.session.user || !req.session.user.isActive) return res.status(401).json({ error: 'AUTH_REQUIRED' });
    return next();
  } catch (error) {
    console.error('Authentication error', error);
    return res.status(503).json({ error: 'AUTH_SERVICE_UNAVAILABLE' });
  }
}
function requireRole(...roles) {
  return (req, res, next) => roles.includes(req.session.user?.role) ? next() : res.status(403).json({ error: 'FORBIDDEN' });
}
async function audit(req, action, resource, details = {}) {
  await pool.execute('INSERT INTO audit_logs (user_id, action, resource, ip_address, details) VALUES (?, ?, ?, ?, ?)', [req.session.user?.id || null, action, resource, req.ip, JSON.stringify(details)]);
}

app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, database: 'mysql' }); }
  catch { res.status(503).json({ ok: false, database: 'unavailable' }); }
});
app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: req.session.user }));
app.post('/api/auth/logout', (req, res) => req.session.destroy(() => res.status(204).end()));
app.get('/api/settings/ui', requireAuth, async (_req, res) => {
  const [rows] = await pool.execute('SELECT setting_value AS value FROM app_settings WHERE setting_key = ? LIMIT 1', ['ui']);
  res.json({ settings: rows[0]?.value || {} });
});
app.put('/api/settings/ui', requireAuth, requireRole('admin'), async (req, res) => {
  const allowed = ['brandName', 'employeeTitle', 'specialistTitle', 'adminTitle', 'policyText'];
  const settings = Object.fromEntries(allowed.filter((key) => typeof req.body?.[key] === 'string').map((key) => [key, req.body[key].slice(0, 500)]));
  if (!Object.keys(settings).length) return res.status(400).json({ error: 'INVALID_SETTINGS' });
  await pool.execute('INSERT INTO app_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)', ['ui', JSON.stringify(settings), req.session.user.id]);
  await audit(req, 'settings.update', 'ui', { keys: Object.keys(settings) });
  res.json({ settings });
});
app.get('/api/admin/audit-logs', requireAuth, requireRole('admin'), async (_req, res) => {
  const [rows] = await pool.query('SELECT id, user_id AS userId, action, resource, ip_address AS ipAddress, details, created_at AS createdAt FROM audit_logs ORDER BY id DESC LIMIT 200');
  res.json({ logs: rows });
});

app.get('/api/specialists', requireAuth, async (_req, res) => {
  const [rows] = await pool.query('SELECT id, user_id AS userId, title, category, specialty, room_number AS roomNumber, building, bio, is_available AS isAvailable, schedule_json AS schedule FROM specialists WHERE is_available = TRUE ORDER BY title');
  res.json({ specialists: rows });
});

app.get('/api/appointments', requireAuth, async (req, res) => {
  const user = req.session.user;
  const query = user.role === 'admin'
    ? ['SELECT * FROM appointments ORDER BY date_iso DESC, time_slot DESC']
    : ['SELECT a.* FROM appointments a LEFT JOIN specialists s ON s.id = a.specialist_id WHERE a.user_id = ? OR s.user_id = ? ORDER BY a.date_iso DESC, a.time_slot DESC', [user.id, user.id]];
  const [rows] = await pool.execute(query[0], query[1]);
  res.json({ appointments: rows });
});

app.post('/api/appointments', requireAuth, async (req, res) => {
  if (req.session.user.role !== 'employee') return res.status(403).json({ error: 'ONLY_EMPLOYEES_CAN_BOOK' });
  const { specialistId, dateISO, timeSlot, userReason } = req.body || {};
  if (!specialistId || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO) || !timeSlot || typeof userReason !== 'string' || userReason.length > 1000) return res.status(400).json({ error: 'INVALID_APPOINTMENT' });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [specialists] = await connection.execute('SELECT id FROM specialists WHERE id = ? AND is_available = TRUE FOR SHARE', [specialistId]);
    if (!specialists.length) return res.status(404).json({ error: 'SPECIALIST_NOT_FOUND' });
    const [conflicts] = await connection.execute("SELECT id FROM appointments WHERE specialist_id = ? AND date_iso = ? AND time_slot = ? AND status NOT IN ('cancelled','no_show') FOR UPDATE", [specialistId, dateISO, timeSlot]);
    if (conflicts.length) return res.status(409).json({ error: 'SLOT_UNAVAILABLE' });
    const id = `apt-${crypto.randomUUID()}`;
    const trackingCode = `MP-${crypto.randomInt(1000, 10000)}`;
    await connection.execute('INSERT INTO appointments (id, tracking_code, user_id, specialist_id, date_iso, time_slot, user_reason) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, trackingCode, req.session.user.id, specialistId, dateISO, timeSlot, userReason]);
    await connection.commit();
    await audit(req, 'appointment.create', id, { specialistId, dateISO, timeSlot });
    return res.status(201).json({ id, trackingCode });
  } catch (error) {
    await connection.rollback();
    console.error('Appointment create error', error);
    return res.status(500).json({ error: 'APPOINTMENT_CREATE_FAILED' });
  } finally { connection.release(); }
});

app.patch('/api/appointments/:id/status', requireAuth, requireRole('admin', 'doctor', 'counselor', 'lawyer', 'barber', 'nutritionist'), async (req, res) => {
  const allowed = ['in_progress', 'completed', 'no_show', 'cancelled'];
  if (!allowed.includes(req.body?.status)) return res.status(400).json({ error: 'INVALID_STATUS' });
  const [result] = await pool.execute('UPDATE appointments a JOIN specialists s ON s.id = a.specialist_id SET a.status = ?, a.session_result = ? WHERE a.id = ? AND (s.user_id = ? OR ? = \'admin\')', [req.body.status, req.body.sessionResult ? JSON.stringify(req.body.sessionResult) : null, req.params.id, req.session.user.id, req.session.user.role]);
  if (!result.affectedRows) return res.status(404).json({ error: 'APPOINTMENT_NOT_FOUND' });
  await audit(req, 'appointment.status.update', req.params.id, { status: req.body.status });
  res.json({ ok: true });
});

app.use(express.static(distPath));

// SPA fallback: any unmatched route serves index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ سامانه مپنا در حال اجراست: http://0.0.0.0:${PORT}`);
});
