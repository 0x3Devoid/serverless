const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const verifyJWT = (req, res, next) => {
  if (req.cookies && req.cookies["jwt"]) {
    const accessToken = req.cookies["jwt"];
    if (!accessToken) {
      res.status(401).json({ error: "Not authenticated" });
    }
    try {
      jwt.verify(accessToken, process.env.TOKEN_SECRETE, (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ error: "Failed to authenticate token" });
        }
        req.user = { email: decoded.email, id: decoded._id, username: decoded.username };
        next();
      });
    } catch (err) {
      res.status(400).json({ error: err });
    }
  } else {
    // Handle the case where the cookie doesn't exist
    res.status(400).json({ error: "Cookies not found" });
  }
};

module.exports = verifyJWT;
