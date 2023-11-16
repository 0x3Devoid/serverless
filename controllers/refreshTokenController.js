const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const refreshTokenController = async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.jwt) {
        return res.sendStatus(401);
    }
    const refreshToken = cookie.jwt;
    console.log(refreshToken);
    try {
        const user = await User.findOne({ refreshToken });
        if (!user) return res.sendStatus(403);
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN,
            (err, decoded) => {
                if (err || user.email !== decoded.email) {
                    return res.sendStatus(403);
                }
                const accessToken = jwt.sign(
                    { email: decoded.email, _id: decoded._id },
                    process.env.ACCESS_TOKEN,
                    { expiresIn: "5m" }
                );
                return res.json({ accessToken });
            }
        )
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}

module.exports = refreshTokenController;
