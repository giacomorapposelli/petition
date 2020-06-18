const bcrypt = require('bcryptjs');
let { genSalt, hash, compare } = bcrypt;
const { promisify } = require('util');

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

module.exports.hash = plainTxtPw => genSalt().then(salt=>hash(plainTxtPw,salt))
module.exports.compare = compare;








genSalt().then(salt => {
    console.log('salt: ',salt);
    return hash('safePassword', salt);
}).then(hashedPw => {
    console.log('hashedPW: ',hashedPw)
    return compare('safePassword', hashedPw)
}).then(matchValueOfCompare => {
    console.log('compare value is: ', matchValueOfCompare);
    console.log('is pw a match?', matchValueOfCompare);
})