const spicedPg = require("spiced-pg");
const { dbUser, dbPass } = require("./secrets");
const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);

exports.addSigner = (signature, userId) => {
    return db.query(
        `INSERT INTO signers (signature, user_id) VALUES ($1, $2) RETURNING *`,
        [signature, userId]
    );
};

exports.getSigners = () => {
    return db.query(`SELECT first, last FROM signers`);
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
    return db.query(`SELECT password FROM users WHERE id = $1`, [email]);
};
