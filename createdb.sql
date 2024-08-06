-- CREATE DATABASE resume_parser_db;

-- USE resume_parser_db;

-- CREATE TABLE jobs (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     bucketkey TEXT NOT NULL
-- );

-- CREATE TABLE resumes (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     bucketkey TEXT NOT NULL
-- );

CREATE DATABASE resume_parser_db;

USE resume_parser_db;

DROP TABLE users;
DROP TABLE resumes;

CREATE TABLE users (
	id INT NOT NULL AUTO_INCREMENT,
    username TEXT,
    password TEXT,
    refreshToken TEXT,
    PRIMARY KEY (id)
);

CREATE TABLE resumes (
    id INT AUTO_INCREMENT,
    userid INT NOT NULL,
    bucketkey TEXT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(userid) REFERENCES users(id)
);