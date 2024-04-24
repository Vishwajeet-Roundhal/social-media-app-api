const express = require('express')
const router = express.Router();
const postController = require("../Controllers/post-controller")
const {userAuth} = require("../Middlewares/auth-middleware")

router.route("/create").post(userAuth,postController.createPost)
router.route("/feed").get(postController.getAllPost)
router.route("/:id").get(postController.getPostById)

router.route("/posts/:id").get(userAuth,postController.getPostsByUser);
router.route("/like/:postId").patch(userAuth,postController.likePost);
router.route("/comment/:id").put(userAuth,postController.addCommentToPost)
router.route("/postLikes/:postId").get(userAuth,postController.getLikesByPost)

module.exports = router