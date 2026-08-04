CREATE TABLE roles (name VARCHAR(255) NOT NULL, description VARCHAR(255), PRIMARY KEY (name));
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL, email VARCHAR(45) NOT NULL, phone VARCHAR(20) NOT NULL,
  avatar VARCHAR(255), introduce VARCHAR(225), gender VARCHAR(45), certificate VARCHAR(255), active BIT NOT NULL,
  PRIMARY KEY (id), CONSTRAINT uk_users_email UNIQUE (email)
);
CREATE TABLE users_roles (user_id INT NOT NULL, roles_name VARCHAR(255) NOT NULL,
  PRIMARY KEY (user_id, roles_name), FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (roles_name) REFERENCES roles(name));
CREATE TABLE category (CategoryID INT NOT NULL AUTO_INCREMENT, Name VARCHAR(50), description VARCHAR(500), PRIMARY KEY (CategoryID));
CREATE TABLE course (
  courseid INT NOT NULL AUTO_INCREMENT, categoryid INT, sellerid INT, name VARCHAR(255) NOT NULL,
  description TEXT, price DOUBLE, rating DOUBLE, status BIT, PRIMARY KEY (courseid),
  FOREIGN KEY (categoryid) REFERENCES category(CategoryID), FOREIGN KEY (sellerid) REFERENCES users(id)
);
CREATE TABLE coursedetail (
  id BIGINT NOT NULL AUTO_INCREMENT, courseid INT, course_id INT, name VARCHAR(255), episode_number INT,
  link VARCHAR(255), duration INT, is_preview BIT, PRIMARY KEY (id), FOREIGN KEY (course_id) REFERENCES course(courseid)
);
CREATE TABLE course_ratings (
  id INT NOT NULL AUTO_INCREMENT, course_id INT, user_id INT, rating INT, created_at DATETIME(6), PRIMARY KEY (id),
  FOREIGN KEY (course_id) REFERENCES course(courseid), FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE course_comments (
  id INT NOT NULL AUTO_INCREMENT, course_id INT NOT NULL, user_id INT NOT NULL, content TEXT NOT NULL,
  created_at DATETIME(6) NOT NULL, PRIMARY KEY (id), FOREIGN KEY (course_id) REFERENCES course(courseid), FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE favorite (
  id INT NOT NULL AUTO_INCREMENT, id_course INT NOT NULL, id_user INT NOT NULL, PRIMARY KEY (id),
  FOREIGN KEY (id_course) REFERENCES course(courseid), FOREIGN KEY (id_user) REFERENCES users(id)
);
CREATE TABLE orders (
  id INT NOT NULL AUTO_INCREMENT, id_course INT NOT NULL, id_user INT NOT NULL, date_order DATE,
  PRIMARY KEY (id), FOREIGN KEY (id_course) REFERENCES course(courseid), FOREIGN KEY (id_user) REFERENCES users(id)
);
CREATE TABLE report (
  id BIGINT NOT NULL AUTO_INCREMENT, user_id INT, course_id INT, subject VARCHAR(255), detail VARCHAR(255),
  category VARCHAR(255), priority VARCHAR(255), status VARCHAR(255), date DATETIME(6), PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (course_id) REFERENCES course(courseid)
);
CREATE TABLE invalidated_token (id VARCHAR(255) NOT NULL, expiry_time DATETIME(6), PRIMARY KEY (id));
