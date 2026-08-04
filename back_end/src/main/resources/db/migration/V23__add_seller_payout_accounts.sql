CREATE TABLE seller_payout_accounts (
  id BIGINT NOT NULL AUTO_INCREMENT,
  seller_id INT NOT NULL,
  method VARCHAR(30) NOT NULL,
  bank_name VARCHAR(120) NULL,
  account_name VARCHAR(120) NOT NULL,
  account_number VARCHAR(80) NOT NULL,
  status VARCHAR(30) NOT NULL,
  demo_mode BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_seller_payout_accounts_seller UNIQUE (seller_id),
  CONSTRAINT fk_seller_payout_accounts_seller FOREIGN KEY (seller_id) REFERENCES users(id)
);

ALTER TABLE withdrawal_requests
  ADD COLUMN source VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN failure_reason VARCHAR(500) NULL,
  MODIFY account_name VARCHAR(120) NULL,
  MODIFY account_number VARCHAR(80) NULL;

CREATE INDEX idx_withdrawal_requests_status_source ON withdrawal_requests (status, source);
