CREATE TABLE payment_transactions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  provider VARCHAR(20) NOT NULL,
  transaction_ref VARCHAR(100) NOT NULL,
  course_id INT NOT NULL,
  user_id INT NOT NULL,
  amount_vnd BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  completed_at DATETIME(6) NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_payment_transactions_ref UNIQUE (transaction_ref),
  CONSTRAINT fk_payment_transactions_course FOREIGN KEY (course_id) REFERENCES course(courseid),
  CONSTRAINT fk_payment_transactions_user FOREIGN KEY (user_id) REFERENCES users(id)
);
