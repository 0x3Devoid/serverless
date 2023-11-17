const { sign } = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const createToken = (user) => {
    const accessToken = sign({ id: user.id, email: user.local.email, username: user.local.username }, process.env.SECRET);
    return accessToken;
  };

module.exports = createToken;
