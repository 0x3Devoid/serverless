class UserController{
    static async app(req, res){
        return res.status(200).json({user: req.user});
    }
}

module.exports = UserController;
