const dbClient = require("../storage/db");
const generateJWT = require("../utils/generateJWT");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const sendVerificationMail = require("../utils/MailgunMailer")
const crypto = require("crypto");
const sendPasswordCode = require("../utils/ForgetPasswordMailer");
require("dotenv").config();

dotenv.config();
const salt = bcrypt.genSaltSync(10);
class userAuthentication {
  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email not found" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password not found" });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Invalid email/password format" });
    }

    const collection = await dbClient.db.collection("Users");
    const TokenCollection = await dbClient.db.collection("token");

    try {
      const user = await collection.findOne({ "local.email": email });

      if (!user) {
        return res.status(404).json({ error: "User does not exist" });
      }

      const validPwd = await bcrypt.compareSync(password, user.local.password);

      if (!validPwd) {
        return res.status(401).json({ error: "Invalid password" });
      }

      if (!user.local.verified) {
        let token = await TokenCollection.findOne({
          username: user.local.username,
        });

        if (!token) {
          token = {
            username: user.local.username,
            token: crypto.randomBytes(32).toString("hex"),
            createdAt: new Date(),
          };

          const url = `${process.env.BASE_URL}/user/${user.local.username}/verify/${token.token}`;
         await sendVerificationMail(email, url);
          await TokenCollection.insertOne(token);
          const message =
            "An email has been sent to your account, please verify";
          return res.status(200).json({ message });
        } else {
        const oldToken = await TokenCollection.findOne({ username: user.local.username });
          const url = `${process.env.BASE_URL}/user/${user.local.username}/verify/${oldToken.token}`;
          await sendVerificationMail(email, url);
          const message =
            "A new email has been sent to your account, please verify";
          return res.status(200).json({ message });
        }
      }

      const refreshToken = generateJWT({
        email: user.email,
        username: user.username,
        id: user._id,
        duration: "1d",
      });
      user.lastLogin = new Date();
      user.refreshToken = refreshToken;

      await collection.updateOne(
        { "local.email": email },
        {
          $set: {
            refreshToken: refreshToken,
            lastLogin: new Date(),
          },
        }
      );

      return res.status(200).json({ message: "User logged in successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async logout(req, res) {
    const email = req.params.email;

    if (!email) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const collection = await dbClient.db.collection("Users");

    try {
      await collection.updateOne(
        { "local.email": email },
        { $unset: { refreshToken: 1 } }
      );

      return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
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
    const TokenCollection = await dbClient.db.collection("token");

    try {
      const duplicate = await collection.findOne({ "local.email": email });
      const dup_username = await collection.findOne({
        "local.username": username,
      });
      const validRef = await collection.findOne({ "local.username": referal });

      if (duplicate) {
        return res.status(409).json({ error: "Account Already Exist" });
      }
      if (dup_username) {
        return res.status(409).json({ error: "Username Already Exist" });
      }
      const password_hash = await bcrypt.hashSync(password, salt);
      let newUser = {
        method: "local",
        local: {
          username: username,
          email: email,
          password: password_hash,
          lastLogin: new Date(),
          earning: earning || 0,
          referal: validRef ? referal : null,
          claimedRef: false,
          verified: false,
          code: 0,
        },
      };
      await collection.insertOne(newUser);
      const token = {
        username: newUser.local.username,
        token: crypto.randomBytes(32).toString("hex"),
        createdAt: new Date(),
      };
      await TokenCollection.insertOne(token);
      const url = `${process.env.BASE_URL}/user/${newUser.local.username}/verify/${token.token}`;
      await sendVerificationMail(email, url);
      return res
        .status(201)
        .json({
          message: "An Email has been sent to your account, please verify",
        });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async verifyUser(req, res) {
    const { username, token } = req.params;
    const collection = await dbClient.db.collection("Users");
    const TokenCollection = await dbClient.db.collection("token");
    try {
      const user = await collection.findOne({ "local.username": username });
      const validToken = await TokenCollection.findOne({
        token: token,
        username: username,
      });
      if (!user) {
        return res.status(400).json({ error: "Invalid Link" });
      }
      if (!validToken) {
        return res.status(400).json({ error: "Invalid Link" });
      }
      await collection.findOneAndUpdate(
        { "local.username": username, "local.verified": false },
        { $set: { "local.verified": true } },
        { returnDocument: "after" }
      );
      await TokenCollection.deleteOne({ username: username });
      res.status(200).json({ message: "Email verification was successfull" });
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async forgetPassword(req, res) {
    const { email } = req.body;
    const collection = dbClient.db.collection("Users");

    if (!email) {
        return res.status(400).json({ error: 'Email cannot be empty' });
    }

    try {
        const user = await collection.findOne({ "local.email": email });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const newCode = Math.floor(100000 + Math.random() * 900000);

        await collection.updateOne(
            { "local.email": email },
            {
                $set: {
                    "local.code": newCode,
                },
            }
        );

        await sendPasswordCode(email, newCode);
        return res.status(200).json({ message: `A one-time code has been sent to ${email}` });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}


  static async verifyPasswordCode(req, res) {
    const { code, email, password } = req.body;
    const collection = dbClient.db.collection("Users");

    if (!email) {
        return res.status(400).json({ error: "Email can't be empty" });
    }
    if (!code) {
        return res.status(400).json({ error: "Code can't be empty" });
    }
    if (!password) {
        return res.status(400).json({ error: "Password can't be empty" });
    }

    try {
        const user = await collection.findOne({ "local.email": email });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        if (parseInt(user.local.code) !== parseInt(code)) {
          return res.status(400).json({ error: "Invalid Code" });
      }
      
        const password_hash = await bcrypt.hashSync(password, salt);
        await collection.updateOne(
            { "local.email": email },
            {
                $set: {
                    "local.code": 0,
                    "local.password": password_hash,
                },
            }
        );

        return res.status(200).json({ message: "Password reset successfully." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

}
module.exports = userAuthentication;
