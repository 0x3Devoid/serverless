const dbClient = require("../storage/db");
// const createToken = require("../utils/generateJWT");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const uuidv4 = require("uuid").v4

const sessions = {}
dotenv.config();
const salt = bcrypt.genSaltSync(10);

class userAuthentication {
  static async login(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ error: "email not found" });
    }
    if (!password) {
      res.status(400).json({ error: "password not found" });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "invalid username/password" });
    }
    const collection = await dbClient.db.collection('Users');

    try {
        const user = await collection.findOne({ "local.email": email });
        if (!user) {
          return res.status(404).json({ error: "User does not exist" });
        }
        const validPwd = await bcrypt.compareSync(password, user.local.password);
        if (!validPwd) {
          return res.status(401).json({ error: "Invalid password" });
        }
        // const sessionId = uuidv4();
        //   sessions[sessionId] = { };
        //   res.set('Set-Cookie', `session=${sessionId}`);
        const sessionId = uuidv4();
        res.cookie('session', sessionId, { httpOnly: true });
        res.cookie('user', JSON.stringify({
          email: user.local.email,
          username: user.local.username,
         
        }));
        
        
        return res.status(200).json({ message: "User logged in successfully" });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
      }
      
  }

  static async logout(req, res) {
    try {
      res.clearCookie('session');
      res.clearCookie('user');
  
      return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
  

  //DONE
  static async register(req, res) {
    const { username, email, password, earning, referal } = req.body;
    if (!email) {
      return res.status(400).json({ error: "email cant be empty" });
    }
    if (!password) {
      return res.status(400).json({ error: "missing password" });
    }
    if (!username) {
      return res.status(400).json({ error: "missing username" });
    }
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof username !== "string"
    ) {
      return res.status(400).json({ error: "invalid username/password/email" });
    }
    const collection = await dbClient.db.collection("Users");
    try {
      const duplicate = await collection.findOne({ "local.email": email });
      const dup_username = await collection.findOne({ "local.username": username });
      const validRef = await collection.findOne({"local.username": referal});
      
 
      if (duplicate) {
        return res.status(409).json({ error: "Account Already Exist" });
      }
      if(dup_username){
        return res.status(409).json({ error: "Username Already Exist" });

      }
     

      const password_hash = await bcrypt.hashSync(password, salt);
      const newUser ={
        method: "local",
        local: {
          username: username,
          email: email,
          password: password_hash,
          lastLogin: new Date(),
          earning: earning || 0,
          referal: validRef ? referal : null,
          claimedRef: false
        },
      };
      await collection.insertOne(newUser);
      return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
}

module.exports = userAuthentication;
