const bcrypt = require("bcrypt");
const first_salt = bcrypt.genSaltSync();
const second_salt = bcrypt.genSaltSync();
const secret = bcrypt.hashSync(first_salt + second_salt, 10);

module.exports = secret;