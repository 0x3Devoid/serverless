const dbClient = require("../storage/db");

class currentUserController {
  static async getUser(req, res) {
    const collection = await dbClient.db.collection("Users");
    try {
      const email = req.body.email;
      if (!email) {
        return res.status(400).json({ error: "missing email" });
      }
      if (typeof email !== "string") {
        return res.status(400).json({ error: "email must be string" });
      }
      const currentUser = await collection.findOne(
        {
          "local.email": email,
        },
        "local.email local.earning local.lastLogin"
      );
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }
      const { local } = currentUser;
      const userObject = {
        email: local.email,
        earning: local.earning,
        lastLogin: local.lastLogin,
        username: local.username,
      };
      return res.status(200).json(userObject);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

  static async getReferals(req, res) {
    const collection = await dbClient.db.collection("Users");
    try {
      const username = req.body.username;
      if (!username) {
        return res.status(400).json({ error: "missing username" });
      }
      if (typeof username !== "string") {
        return res.status(400).json({ error: "username must be string" });
      }

      const referrals = await collection
        .find({ "local.referal": username })
        .toArray();

      const allRef = referrals.map((user) => {
        return {
          username: user.local.username,
          referral: user.local.referal,
          claimedRef: user.local.claimedRef
        };
      });

      return res.status(200).json(allRef);
    } catch (err) {
      res.status(500).json(err);
    }
  }
}
module.exports = currentUserController;
