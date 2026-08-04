CREATE TABLE IF NOT EXISTS lesson_questions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  course_id INT NOT NULL,
  lesson_id BIGINT NOT NULL,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  resolved_at DATETIME(6) NULL,
  PRIMARY KEY (id),
  INDEX idx_lesson_questions_lesson_status (lesson_id, status, created_at),
  INDEX idx_lesson_questions_course_status (course_id, status, created_at),
  CONSTRAINT fk_lesson_questions_course FOREIGN KEY (course_id) REFERENCES course(courseid),
  CONSTRAINT fk_lesson_questions_lesson FOREIGN KEY (lesson_id) REFERENCES coursedetail(id) ON DELETE CASCADE,
  CONSTRAINT fk_lesson_questions_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS lesson_question_replies (
  id BIGINT NOT NULL AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_lesson_question_replies_question_created (question_id, created_at),
  CONSTRAINT fk_lesson_question_replies_question FOREIGN KEY (question_id) REFERENCES lesson_questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_lesson_question_replies_user FOREIGN KEY (user_id) REFERENCES users(id)
);
