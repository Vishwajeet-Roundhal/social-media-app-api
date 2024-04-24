const express = require('express')
const router = express.Router();
const authController = require("../Controllers/auth-controller");
const { userAuth } = require('../Middlewares/auth-middleware');

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route("/users").get(authController.getUsersData)
router.route("/user/:id").get(authController.getUserById)

router.route("/follow/:followingId").put(userAuth,authController.followUser);
router.route("/report/:reportedId").put(userAuth,authController.reportUser)
router.route("/search").get(userAuth,authController.searchUser)

module.exports = router