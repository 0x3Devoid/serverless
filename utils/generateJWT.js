const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


dotenv.config();

const generateJWT = (user) => {
    const payload = {
        sub: user._id,
        email: user.email,
        username: user.username
    }
    return jwt.sign(
        payload,
        process.env.TOKEN_SECRETE,
        { expiresIn: user.duration }
    );
}

module.exports = generateJWT;
