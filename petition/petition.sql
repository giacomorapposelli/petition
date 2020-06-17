DROP TABLE IF EXISTS signers;

CREATE TABLE signers(
  id SERIAL PRIMARY KEY,
  first VARCHAR NOT NULL CHECK (first != ''),
  last VARCHAR NOT NULL CHECK (last != ''),
  signature TEXT NOT NULL CHECK (signature != '')
);

