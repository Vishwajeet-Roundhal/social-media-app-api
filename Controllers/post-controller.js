const Post = require("../Models/Post");

const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    if (!content || !image)
      return res.status(400).json({ msg: "Please fill all fields" });
    console.log(content, image);
    const newPost = await Post.create({
      content,
      image,
      user: req.user._id,
    });
    console.log(newPost);
    if (!newPost) {
      res.status(500).send("Server error");
    }
    res.status(200).json({ post: newPost });
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const getAllPost = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query; // Default to page 1 and limit 10 posts per page
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res
      .status(200)
      .json({
        posts,
        currentPage: parseInt(page),
        totalPages: Math.ceil(posts.length / limit),
      });

    // const posts = await Post.find();
    // res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

module.exports = { createPost, getAllPost };
