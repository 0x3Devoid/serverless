const express = require('express');
const cors = require('cors');
const cookie = require('cookie-parser');

const UserController = require('../models/UserController.js')
const userAuthentication = require("../controllers/emailAuthController.js")
const currentUserController = require('../controllers/currentUserController');
const leaderBoard = require('../controllers/leaderBoardController');
const verifyJWT = require('../middlewares/verifyJWT.js')
const Claiming = require('../controllers/increaseEarningController.js');

const router = express.Router();

router.use(cors({
    origin: ["https://chakra-livid.vercel.app"],
    methods: ["POST", "GET"],
    credentials: true,
}));

router.use(express.json());
router.use(cookie());

router.get('/v1', verifyJWT, UserController.app);
router.post('/login', userAuthentication.login);
router.post('/register', userAuthentication.register);
router.get('/logout', userAuthentication.logout);
router.post('/user', verifyJWT, currentUserController.getUser);
router.post('/user/referal', verifyJWT, currentUserController.getReferals);
router.post('/user/claim', verifyJWT, Claiming.dailyClaiming);
router.post('/user/referal/claim', verifyJWT, Claiming.referalClaim);
router.get('/leaderboard', verifyJWT, leaderBoard);

module.exports = router