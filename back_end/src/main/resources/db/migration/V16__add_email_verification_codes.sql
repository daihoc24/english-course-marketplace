CREATE TABLE IF NOT EXISTS email_verification_codes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  consumed_at DATETIME(6) NULL,
  PRIMARY KEY (id)
);

CREATE INDEX idx_email_verification_codes_email_code
  ON email_verification_codes(email, code, consumed_at, expires_at);
