--\connect petition;

DROP TABLE IF EXISTS signers CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE signers(
      id SERIAL PRIMARY KEY,
      signature TEXT NOT NULL,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );



-- CREATE TABLE users(
--       id SERIAL PRIMARY KEY,
--       first VARCHAR(255) NOT NULL CHECK (first != ''),
--       last VARCHAR(255) NOT NULL CHECK (last != ''),
--       email VARCHAR(255) NOT NULL UNIQUE, CHECK (email != ''),
--       password VARCHAR(255) NOT NULL CHECK (password != ''),
--       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--       );


-- CREATE TABLE user_profiles(
--       id SERIAL PRIMARY KEY,
--       age INT,
--       city VARCHAR(255),
--       url VARCHAR(255),
--       user_id INT NOT NULL UNIQUE REFERENCES users(id)
--       );