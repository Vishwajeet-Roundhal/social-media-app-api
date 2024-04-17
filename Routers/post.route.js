const express = require('express')
const router = express.Router();
const postController = require("../Controllers/post-controller")
const {userAuth} = require("../Middlewares/auth-middleware")

router.route("/create").post(userAuth,postController.createPost)
router.route("/feed").get(postController.getAllPost)

module.exports = router