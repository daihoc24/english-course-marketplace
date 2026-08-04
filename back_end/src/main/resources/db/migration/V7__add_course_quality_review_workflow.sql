CREATE TABLE course_review_requests (
  id BIGINT NOT NULL AUTO_INCREMENT,
  course_id INT NOT NULL,
  seller_id INT NOT NULL,
  status VARCHAR(30) NOT NULL,
  checklist_note VARCHAR(1000) NULL,
  rejection_reason VARCHAR(500) NULL,
  submitted_at DATETIME(6) NOT NULL,
  reviewed_at DATETIME(6) NULL,
  reviewer_id INT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_course_review_course FOREIGN KEY (course_id) REFERENCES course(courseid),
  CONSTRAINT fk_course_review_seller FOREIGN KEY (seller_id) REFERENCES users(id),
  CONSTRAINT fk_course_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id)
);
