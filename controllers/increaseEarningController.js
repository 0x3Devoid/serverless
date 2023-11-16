const dbClient = require("../storage/db");


class Claiming {
  static async dailyClaiming(req, res) {
    const collection = await dbClient.db.collection("Users");
    try {
      const { email, earning } = req.body;
      if (!email || !earning) {
        return res.status(400).json({ error: "missing email/claim" });
      }
      if (typeof email !== "string" || typeof parseFloat(earning) !== "number") {
        return res
          .status(400)
          .json({ error: "email must be string and claim must be a number" });
      }

      const filter = { "local.email": email };
      const user = await collection.findOne(filter);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const lastLogin = user.local.lastLogin;
      const hoursSinceLastClaim = (new Date() - lastLogin) / (1000 * 60 * 60);
      if (hoursSinceLastClaim < 24) {
        return res.status(400).json({ error: "Cannot claim more than once every 24 hours" });
      }
      const update = {
        $inc: { "local.earning": parseFloat(earning) },
        $set: { "local.lastLogin": new Date()},
      };

      const result = await collection.updateOne(filter, update);

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      const updatedUser = await collection.findOne(filter);
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "an error occured" });
    }
  }

  static async referalClaim(req, res) {
    const collection = await dbClient.db.collection("Users");
    try {
      const { email, earning, username } = req.body;
      if (!email || !earning || !username) {
        return res.status(400).json({ error: "missing email/claim" });
      }
      if (typeof email !== "string" || typeof parseFloat(earning) !== "number") {
        return res
          .status(400)
          .json({ error: "email must be string and claim must be a number" });
      }

      const user = await collection.findOne({ "local.username": username });
      if (!user) {
        return res.status(404).json({ error: "User does not exist" });
      }
      if(user.local.claimedRef === false){
        const filter = { "local.email": email };
        const update = {
            $inc: { "local.earning": parseFloat(earning) },
        };

        const result = await collection.updateOne(filter, update);

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const updatedUser = await collection.findOne(filter);
        const userUpdate = {
            $set: {"local.claimedRef" : true}
        }
        await collection.updateOne(user, userUpdate);
        return res.status(200).json(updatedUser);
      }else{
        return res.status(400).json({error: "Reward already claimed"})
      }
      
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "an error occured" });
    }
  }
}

module.exports = Claiming;
