ALTER TABLE report
    ADD COLUMN seller_action_request TEXT NULL,
    ADD COLUMN seller_action_requested_at DATETIME NULL,
    ADD COLUMN seller_action_requested_by INT NULL,
    ADD COLUMN seller_response TEXT NULL,
    ADD COLUMN seller_responded_at DATETIME NULL,
    ADD COLUMN seller_fixed_at DATETIME NULL,
    ADD COLUMN refund_recommended_at DATETIME NULL,
    ADD COLUMN refund_recommendation_reason TEXT NULL;

CREATE INDEX idx_report_course_status ON report(course_id, status);
