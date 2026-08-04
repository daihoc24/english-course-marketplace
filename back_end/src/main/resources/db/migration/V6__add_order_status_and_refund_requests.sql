ALTER TABLE orders
  ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'PAID',
  ADD COLUMN price_paid DOUBLE NULL,
  ADD COLUMN refund_eligible_until DATE NULL;

UPDATE orders o
JOIN course c ON c.courseid = o.id_course
SET o.price_paid = c.price,
    o.refund_eligible_until = DATE_ADD(o.date_order, INTERVAL 7 DAY)
WHERE o.price_paid IS NULL;

CREATE TABLE refund_requests (
  id BIGINT NOT NULL AUTO_INCREMENT,
  order_id INT NOT NULL,
  requester_id INT NOT NULL,
  reason VARCHAR(500) NOT NULL,
  status VARCHAR(30) NOT NULL,
  admin_note VARCHAR(500) NULL,
  requested_at DATETIME(6) NOT NULL,
  reviewed_at DATETIME(6) NULL,
  reviewer_id INT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_refund_requests_order UNIQUE (order_id),
  CONSTRAINT fk_refund_requests_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_refund_requests_requester FOREIGN KEY (requester_id) REFERENCES users(id),
  CONSTRAINT fk_refund_requests_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id)
);
