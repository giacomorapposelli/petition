const spicedPg = require('spiced-pg');
const {dbUser, dbPass} = require('./secrets');
const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);


exports.addSigner = (firstname, lastname, signature) => {
    return db.query(
        `INSERT INTO signers (first, last, signature) VALUES ($1, $2, $3)`,
        [firstname, lastname, signature]
    );
};

exports.getSigners = () => {
    return db.query(`SELECT first, last FROM signers`);
};



