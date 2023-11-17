const sessions = {};

class UserController {
  static async app(req, res) {
    const cookies = req.headers.cookie;

    if (!cookies) {
      return res.status(401).json({ error: "No cookies found" });
    }
    const sessionId = cookies.split("=")[1];
    if (!sessionId) {
      return res.status(401).json({ error: "User not Authorized" });
    }
    try {
      const userCookie = JSON.parse(req.cookies.user);
      const { email, username } = userCookie;
      return res.status(200).json( { email, username } );
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

module.exports = UserController;
