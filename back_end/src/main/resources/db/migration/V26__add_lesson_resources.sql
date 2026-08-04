CREATE TABLE IF NOT EXISTS lesson_resources (
  id BIGINT NOT NULL AUTO_INCREMENT,
  lesson_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'LINK',
  url VARCHAR(1000) NULL,
  file_name VARCHAR(255) NULL,
  mime_type VARCHAR(120) NULL,
  file_size BIGINT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_lesson_resources_lesson_sort (lesson_id, sort_order, id),
  CONSTRAINT fk_lesson_resources_lesson FOREIGN KEY (lesson_id) REFERENCES coursedetail(id) ON DELETE CASCADE
);
