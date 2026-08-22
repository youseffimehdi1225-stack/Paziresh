CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  personnel_code VARCHAR(64) NULL UNIQUE,
  department VARCHAR(255) NULL,
  role ENUM('employee','doctor','counselor','lawyer','barber','nutritionist','admin') NOT NULL DEFAULT 'employee',
  password_hash VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_username (username)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL;

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(128) PRIMARY KEY,
  setting_value JSON NOT NULL,
  updated_by VARCHAR(64) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  action VARCHAR(128) NOT NULL,
  resource VARCHAR(128) NOT NULL,
  ip_address VARCHAR(64) NULL,
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_created_at (created_at),
  INDEX idx_audit_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS specialists (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category ENUM('medical','counseling','legal','barber','nutrition') NOT NULL,
  specialty VARCHAR(500) NOT NULL,
  room_number VARCHAR(255) NOT NULL,
  building VARCHAR(255) NOT NULL,
  bio TEXT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  schedule_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_specialists_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(64) PRIMARY KEY,
  tracking_code VARCHAR(32) NOT NULL UNIQUE,
  user_id VARCHAR(64) NOT NULL,
  specialist_id VARCHAR(64) NOT NULL,
  date_iso DATE NOT NULL,
  time_slot VARCHAR(64) NOT NULL,
  status ENUM('pending','confirmed','in_progress','completed','no_show','cancelled') NOT NULL DEFAULT 'confirmed',
  user_reason VARCHAR(1000) NOT NULL,
  session_result JSON NULL,
  cancellation_reason VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_specialist FOREIGN KEY (specialist_id) REFERENCES specialists(id) ON DELETE RESTRICT,
  INDEX idx_appointments_user (user_id),
  INDEX idx_appointments_specialist_date (specialist_id, date_iso, time_slot, status)
);

INSERT INTO app_settings (setting_key, setting_value, updated_by)
VALUES ('ui', JSON_OBJECT('brandName', 'سامانه رزرواسیون سازمانی مپنا', 'employeeTitle', 'رزرو نوبت و خدمات رفاهی', 'specialistTitle', 'کارتابل متخصص', 'adminTitle', 'پنل مدیریت ارشد', 'policyText', 'قوانین حضور و غیاب نوبت‌ها در این بخش تنظیم می‌شود.'), 'system')
ON DUPLICATE KEY UPDATE setting_key = setting_key;