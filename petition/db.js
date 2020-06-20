const spicedPg = require("spiced-pg");
const { dbUser, dbPass } = require("./secrets");
const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);

exports.addSigner = (userId, signature) => {
    return db.query(
        `INSERT INTO signers (user_id, signature) VALUES ($1, $2) RETURNING ID`,
        [userId, signature]
    );
};

exports.getSigners = () => {
    return db.query(`SELECT first, last FROM users`);
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
