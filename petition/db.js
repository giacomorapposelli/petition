const spicedPg = require('spiced-pg');

const {dbUser, dbPass} = require('./secrets');

const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/places`);


exports.addCity = (name, country, pop) => {
    return db.query(
        `INSERT INTO cities (city, country, population) VALUES ($1, $2, $3)`,
        [name, country, pop]
    );
};

exports.getCitiesByCityName = name => {
    return db.query(
        `SELECT * FROM cities
        WHERE city = $1`,
        [name]
    );   
};



