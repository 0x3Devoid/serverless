const dotenv = require("dotenv");
const dbClient = require("../storage/db");

dotenv.config();

const verifyJWT = async (req, res, next) => {
  const email = req.params.email;
  const collection = await dbClient.db.collection('Users');

  if(!email){
    return res.status(400).json({error: "Email cannot be empty"});
  }

 try{
  const user = await collection.findOne({ "local.email": email });
  if (user.refreshToken) {
    req.user = { email: user.local.email, username: user.local.username };
    next();
  } else {
    res.status(400).json({ error: "User unathourized, Refreshtoken not found" });
  }

 }catch(err){
  return res.status(500).json({error: "Internal server error"});
 }
};

module.exports = verifyJWT;
