const spicedPg = require("spiced-pg");
const { hash } = require("./bc.js");
// const { dbUser, dbPass } = require("./secrets");
// const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);

let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    const { dbUser, dbPass } = require("./secrets");
    db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);
}

exports.addSigner = (signature, userId) => {
    return db.query(
        `INSERT INTO signers (signature, user_id) VALUES ($1, $2) RETURNING id`,
        [signature, userId]
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

exports.getSignersId = (userId) => {
    return db.query(`SELECT signature FROM signers WHERE user_id = $1;`, [
        userId,
    ]);
};

exports.addUser = (firstname, lastname, email, password) => {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
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

exports.getDataToEdit = (userId) => {
    return db.query(
        `
        SELECT users.id, users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url
        FROM users
        RIGHT JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE users.id = $1;
    `,
        [userId]
    );
};

exports.editCredentials = (userId, firstname, lastname, email, password) => {
    if (password != "") {
        hash(password).then((hasedPw) => {
            return db.query(
                `UPDATE users SET first = $2, last = $3, email = $4, password = 5$ WHERE users.id = $1;`,
                [userId, firstname, lastname, email, hasedPw]
            );
        });
    } else {
        return db.query(
            `UPDATE users SET first = $2, last = $3, email = $4 WHERE users.id = $1;`,
            [userId, firstname, lastname, email]
        );
    }
};

exports.editProfile = (age, city, url, userId) => {
    return db.query(
        `
        INSERT INTO user_profiles (age, city, url, user_id) 
        VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) 
        DO UPDATE SET age = $1, city = $2, url = $3
        RETURNING *`,
        [age || null, city, url, userId]
    );
};

exports.deleteSignature = (userId) => {
    return db.query(`DELETE FROM signers WHERE user_id = $1;`, [userId]);
};
