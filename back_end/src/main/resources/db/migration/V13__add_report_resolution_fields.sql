ALTER TABLE report
    ADD COLUMN admin_response VARCHAR(700) NULL,
    ADD COLUMN resolved_at DATETIME(6) NULL,
    ADD COLUMN resolved_by INT NULL;

ALTER TABLE report
    ADD CONSTRAINT fk_report_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id);

CREATE INDEX idx_report_status_date ON report(status, date);
