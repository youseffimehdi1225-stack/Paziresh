CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  personnel_code VARCHAR(64) NULL UNIQUE,
  department VARCHAR(255) NULL,
  role ENUM('employee','doctor','counselor','lawyer','barber','nutritionist','admin') NOT NULL DEFAULT 'employee',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_username (username)
);

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

INSERT INTO app_settings (setting_key, setting_value, updated_by)
VALUES ('ui', JSON_OBJECT('brandName', 'سامانه رزرواسیون سازمانی مپنا', 'employeeTitle', 'رزرو نوبت و خدمات رفاهی', 'specialistTitle', 'کارتابل متخصص', 'adminTitle', 'پنل مدیریت ارشد', 'policyText', 'قوانین حضور و غیاب نوبت‌ها در این بخش تنظیم می‌شود.'), 'system')
ON DUPLICATE KEY UPDATE setting_key = setting_key;