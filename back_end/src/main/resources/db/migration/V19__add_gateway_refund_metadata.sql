ALTER TABLE payment_transactions
  ADD COLUMN order_id INT NULL,
  ADD COLUMN gateway_transaction_id VARCHAR(100) NULL,
  ADD COLUMN gateway_transaction_date VARCHAR(20) NULL,
  ADD COLUMN refund_ref VARCHAR(100) NULL,
  ADD COLUMN refunded_at DATETIME(6) NULL,
  ADD CONSTRAINT fk_payment_transactions_order FOREIGN KEY (order_id) REFERENCES orders(id);

CREATE INDEX idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_user_course_status ON payment_transactions(user_id, course_id, status);

ALTER TABLE refund_requests
  ADD COLUMN gateway_provider VARCHAR(20) NULL,
  ADD COLUMN gateway_refund_id VARCHAR(100) NULL,
  ADD COLUMN gateway_refund_status VARCHAR(30) NULL,
  ADD COLUMN gateway_refund_message VARCHAR(500) NULL,
  ADD COLUMN refund_processed_at DATETIME(6) NULL;
