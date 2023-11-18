const sessions = {};

class UserController {
  static async app(req, res) {
    return res.status(200).json( req.user );
  }

}

module.exports = UserController;
