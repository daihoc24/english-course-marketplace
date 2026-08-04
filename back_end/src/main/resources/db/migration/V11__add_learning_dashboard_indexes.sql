CREATE INDEX idx_orders_user_status_date ON orders (id_user, status, date_order);

CREATE INDEX idx_orders_user_date ON orders (id_user, date_order);

CREATE INDEX idx_lesson_progress_user_course_completed ON lesson_progress (user_id, course_id, completed);

CREATE INDEX idx_course_name ON course (name);
