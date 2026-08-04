ALTER TABLE payment_transactions
  ADD COLUMN credit_applied_vnd BIGINT NULL DEFAULT 0;

CREATE TABLE learner_wallet_transactions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(30) NOT NULL,
  amount_vnd BIGINT NOT NULL,
  status VARCHAR(30) NOT NULL,
  provider VARCHAR(30) NOT NULL,
  reference VARCHAR(100) NOT NULL,
  description VARCHAR(500) NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_learner_wallet_transactions_reference UNIQUE (reference),
  CONSTRAINT fk_learner_wallet_transactions_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_learner_wallet_transactions_user_status
  ON learner_wallet_transactions (user_id, status, type);

CREATE INDEX idx_learner_wallet_transactions_created_at
  ON learner_wallet_transactions (created_at);
