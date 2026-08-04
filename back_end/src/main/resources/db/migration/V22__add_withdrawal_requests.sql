CREATE TABLE withdrawal_requests (
  id BIGINT NOT NULL AUTO_INCREMENT,
  seller_id INT NOT NULL,
  amount_vnd BIGINT NOT NULL,
  method VARCHAR(30) NOT NULL,
  bank_name VARCHAR(120) NULL,
  account_name VARCHAR(120) NOT NULL,
  account_number VARCHAR(80) NOT NULL,
  note VARCHAR(500) NULL,
  status VARCHAR(30) NOT NULL,
  admin_note VARCHAR(500) NULL,
  requested_at DATETIME(6) NOT NULL,
  reviewed_at DATETIME(6) NULL,
  reviewer_id INT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_withdrawal_requests_seller FOREIGN KEY (seller_id) REFERENCES users(id),
  CONSTRAINT fk_withdrawal_requests_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

CREATE INDEX idx_withdrawal_requests_seller_status ON withdrawal_requests (seller_id, status);
CREATE INDEX idx_withdrawal_requests_requested_at ON withdrawal_requests (requested_at);
