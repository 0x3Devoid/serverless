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
    origin: ["https://chakra-livid.vercel.app", "http://localhost:3000"],
    methods: ["POST", "GET"],
    credentials: true,
}));

router.use(express.json());
router.use(cookie());

router.get('/v1/:email', verifyJWT, UserController.app); //
router.post('/login', userAuthentication.login);
router.post('/register', userAuthentication.register);
router.get('/logout/:email', userAuthentication.logout);
router.get('/user/:email', verifyJWT, currentUserController.getUser); //
router.post('/user/referal',  currentUserController.getReferals);
router.post('/user/claim',  Claiming.dailyClaiming);
router.post('/user/referal/claim', Claiming.referalClaim);
router.get('/user/:username/verify/:token', userAuthentication.verifyUser);
router.get('/leaderboard',leaderBoard);

module.exports = router