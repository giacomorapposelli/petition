const spicedPg = require('spiced-pg');
const {dbUser, dbPass} = require('./secrets');
const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);


exports.addSigner = (firstname, lastname, signature) => {
    console.log('args: ',firstname, lastname, signature);
    return db.query(
        `INSERT INTO signers (first, last, signature) VALUES ($1, $2, $3) RETURNING *`,
        [firstname, lastname, signature]
    );
};



exports.getSigners = () => {
    return db.query(`SELECT first, last FROM signers`);
};

exports.getSignersId = (id) => {
    return db.query(`SELECT signature FROM signers WHERE id = $1`, [id])
}

