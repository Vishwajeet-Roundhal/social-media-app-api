const Post = require("../Models/Post");
const Comment  =require("../Models/Comment")

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

    res.status(200).json({
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(posts.length / limit),
    });
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const getPostById = async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Post.find({ _id: id });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const deletePostById = async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Post.deleteOne({ _id: id });
  } catch (error) {
    res.status(500).json({ msg: "internel server error" });
  }
};

const updatePostById = async (req, res) => {
  try {
    const id = req.params.id;
    const newPost = req.body;
    let post = await Post.updateOne({ _id: id }, { $set: newPost });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ msg: "internel server error at update" });
  }
};

const getPostsByUser = async (req, res) => {
  try {
    const id = req.params.id;
    // const id = req.user._id;

    const posts = await Post.find({ user: id });

    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ msg: "internal server error at postsUser" });
  }
};

const likePost = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user._id;

    const updatePost = await Post.updateOne(
      { _id: id },
      {
        $addToSet: {
          likes: user,
        },
      }
    );
    res.status(200).json(updatePost);
  } catch (error) {
    res.status(500).json({ msg: "internal server" });
  }
};

const unlikePost = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user._id;

    const updatePost = await Post.updateOne(
      { _id: id },
      {
        $pull: {
          likes: user,
        },
      }
    );
    res.status(200).json(updatePost);
  } catch (error) {
    res.status(500).json({ msg: "internal server" });
  }
};

const addCommentToPost = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user._id;
    const {content} = req.body;

    const ncomment = new Comment({
      content,
      user:user,
      post:id,
    });
    await ncomment.save();

    await Post.findByIdAndUpdate(id,{ $push : { comments: ncomment._id } });

    res.status(200).json(ncomment)

  } catch (error) {
    res.status(500).json({ msg: "internal server errror at comment" });
  }
};

const deleteComment = async(req,res) => {
  try {
    const id = req.params.id;
    const commentId = req.params.commentId;
    const user =req.user._id;

    const post  = await Post.find(id);
    const comment = post.comments.find(comment => comment._id.equals(commentId))

    if(!comment.user.equals(user)){
      res.status(403).json({msg:"you are not authorized to delete this comment"})
    }
    post.comments.pull(commentId);
    await post.save();

    res.status(200).json(post)

  } catch (error) {
    res.status(500).json({msg:"internal server error"})
  }
} 





module.exports = {
  createPost,
  getAllPost,
  getPostById,
  deletePostById,
  updatePostById,
  getPostsByUser,
  likePost,
  unlikePost,
  addCommentToPost,
  deleteComment,
};
