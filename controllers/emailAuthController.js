const dbClient = require("../storage/db");
const createToken = require("../utils/generateJWT");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");



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
        }else{
          const accessToken = createToken(user);
          res.cookie('access-token', accessToken, {
            maxAge: 60 * 60 * 24 * 30 * 1000,
            httpOnly: true,
          });
        }
        
        return res.status(200).json({ message: "User logged in successfully" });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
      }
      
  }

  static async logout(req, res) {
    const refreshToken = req.cookies.jwt;
  
    if (!refreshToken) {
      // If the JWT cookie is not found, the user is not logged in
      return res.status(204).json({ message: "User is already logged out" });
    }
  
    const collection = await dbClient.db.collection('Users');
  
    try {
      const user = await collection.findOne({ "local.refreshToken": refreshToken });
  
      if (!user) {
        // If the user with the provided refreshToken is not found, it's safe to assume the user is already logged out
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.status(204).json({ message: "User is already logged out" });
      }
  
      // Clear the refreshToken
      user.local.refreshToken = '';
      await collection.updateOne({ _id: user._id }, { $set: user });
  
      // Clear the JWT cookie
      res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
      return res.status(204).json({ message: "User logged out successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
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
