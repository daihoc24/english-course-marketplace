ALTER TABLE refund_requests
    ADD COLUMN attachment_url TEXT NULL,
    ADD COLUMN attachment_public_id VARCHAR(255) NULL;
