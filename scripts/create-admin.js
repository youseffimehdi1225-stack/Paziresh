import 'dotenv/config';
import crypto from 'crypto';
import mysql from 'mysql2/promise';

const [username, fullName = 'مدیر سامانه'] = process.argv.slice(2);
const password = process.env.ADMIN_PASSWORD;
if (!username || !password || password.length < 8) {
  console.error('Usage: $env:ADMIN_PASSWORD="..."; node scripts/create-admin.js username "Full Name"');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = `scrypt$${salt}$${crypto.scryptSync(password, salt, 64).toString('hex')}`;
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  database: process.env.MYSQL_DATABASE || 'paziresh',
  user: process.env.MYSQL_USER || 'paziresh_app',
  password: process.env.MYSQL_PASSWORD || '',
});
await pool.execute(`
  INSERT INTO users (id, username, full_name, email, personnel_code, department, role, password_hash, is_active)
  VALUES (?, ?, ?, ?, ?, ?, 'admin', ?, TRUE)
  ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash), role = 'admin', is_active = TRUE
`, [`local-admin-${username}`, username.toLowerCase(), fullName, `${username}@local`, `LOCAL-${username}`, 'فناوری اطلاعات', hash]);
await pool.end();
console.log(`Admin user '${username}' is ready.`);