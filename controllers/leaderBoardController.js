const dbClient = require("../storage/db");

const dashBoardLeaders = async (req, res) => {
  const collection = await dbClient.db.collection('Users');

  try{
    const localLeaders = await collection
      .find({ 'local.earning': { $exists: true } }, { projection: { 'local.username': 1, 'local.earning': 1 } })
      .sort({ 'local.earning': -1 })
      .limit(5)
      .toArray(); 


    const localFormattedLeaders = localLeaders.map(leader => {
      return { username: leader.local.username, earning: leader.local.earning || 0 };
  });

    const formattedLeaders = localFormattedLeaders;

    return res.json(formattedLeaders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

  module.exports = dashBoardLeaders;
  