ALTER TABLE course_ratings ADD CONSTRAINT uk_course_ratings_course_user UNIQUE (course_id, user_id);
ALTER TABLE orders ADD CONSTRAINT uk_orders_user_course UNIQUE (id_user, id_course);
