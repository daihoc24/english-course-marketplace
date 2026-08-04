CREATE INDEX idx_refund_requests_order ON refund_requests (order_id);

ALTER TABLE refund_requests
    DROP INDEX uk_refund_requests_order;
