const spicedPg = require("spiced-pg");
// const { dbUser, dbPass } = require("./secrets");
// const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);

let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    const { dbUser, dbPass } = require("./secrets");
    db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);
}

exports.addSigner = (userId, signature) => {
    return db.query(
        `INSERT INTO signers (user_id, signature) VALUES ($1, $2) RETURNING ID`,
        [userId, signature]
    );
};

exports.getSigners = () => {
    return db.query(`
    SELECT signers.user_id, users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url
    FROM signers
    JOIN users
    ON signers.user_id = users.id
    JOIN user_profiles 
    ON signers.user_id = user_profiles.user_id`);
};

exports.getSignersId = (id) => {
    return db.query(`SELECT signature FROM signers WHERE id = $1`, [id]);
};

exports.addUser = (firstname, lastname, email, password) => {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING *`,
        [firstname, lastname, email, password]
    );
};

exports.getPassword = (email) => {
    return db.query(`SELECT password, id FROM users WHERE email = $1`, [email]);
};

exports.hasSigned = (userId) => {
    return db.query(`SELECT signature FROM signers WHERE user_id = $1`, [
        userId,
    ]);
};

exports.insertInfo = (age, city, url, userId) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        [age || null, city, url, userId]
    );
};

exports.getSignersByCity = (city) => {
    return db.query(
        `
    SELECT signers.user_id, users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url
    FROM signers
    JOIN users
    ON signers.user_id = users.id
    JOIN user_profiles
    ON signers.user_id = user_profiles.user_id WHERE LOWER(user_profiles.city) = LOWER($1);
    `,
        [city]
    );
};

exports.getDataToEdit = () => {
    return db.query(
        `SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url
        FROM users
        JOIN user_profiles
        ON users.id = user_profiles.user_id`
    );
};
