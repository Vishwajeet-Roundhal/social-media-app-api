const express = require('express')
const router = express.Router();
const authController = require("../Controllers/auth-controller");

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route("/users").get(authController.getUsersData)
router.route("/user/:id").get(authController.getUserById)

module.exports = router