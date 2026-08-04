CREATE TABLE IF NOT EXISTS lesson_progress (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  lesson_id BIGINT NOT NULL,
  completed BIT NOT NULL DEFAULT 1,
  completed_at DATETIME(6) NULL,
  updated_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_lesson_progress_user_lesson UNIQUE (user_id, lesson_id),
  CONSTRAINT fk_lesson_progress_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_lesson_progress_course FOREIGN KEY (course_id) REFERENCES course(courseid),
  CONSTRAINT fk_lesson_progress_lesson FOREIGN KEY (lesson_id) REFERENCES coursedetail(id)
);
