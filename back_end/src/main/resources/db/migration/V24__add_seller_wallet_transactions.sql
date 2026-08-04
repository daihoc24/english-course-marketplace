CREATE TABLE seller_wallet_transactions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  seller_id INT NOT NULL,
  type VARCHAR(30) NOT NULL,
  amount_vnd BIGINT NOT NULL,
  status VARCHAR(30) NOT NULL,
  provider VARCHAR(30) NOT NULL,
  reference VARCHAR(100) NOT NULL,
  description VARCHAR(500) NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_seller_wallet_transactions_reference UNIQUE (reference),
  CONSTRAINT fk_seller_wallet_transactions_seller FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE INDEX idx_seller_wallet_transactions_seller_status
  ON seller_wallet_transactions (seller_id, status, type);

CREATE INDEX idx_seller_wallet_transactions_created_at
  ON seller_wallet_transactions (created_at);
