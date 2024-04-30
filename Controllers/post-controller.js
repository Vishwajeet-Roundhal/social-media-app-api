const Post = require("../Models/Post");
const Comment = require("../Models/Comment");
const User = require("../Models/User");
const Report = require("../Models/Report");
const Like = require("../Models/Like");

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
    const postId = req.params.postId;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (post.likes.includes(userId)) { // Correct method name
      return res.status(409).json({ msg: "User already liked the post" });
    }

    // if (postId.likes.include(userId))
    //   return res.status(409).json({ msg: "user already liked" });

    const updatePost = await Post.updateOne(
      { _id: postId },
      {
        $addToSet: {
          likes: userId,
        },
      }
    );
    console.log(updatePost);

    const newLike = new Like({ user: userId, post: postId });
    await newLike.save();

    res.status(200).json(updatePost);
  } catch (error) {
    res.status(500).json({ msg: "internal server" });
  }
};

const unlikePost = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (!post.likes.includes(id)) { // Check if the user has liked the post
      return res.status(409).json({ msg: "User has not liked the post" });
    }

    const updatePost = await Post.updateOne(
      { _id: id },
      {
        $pull: {
          likes: user,
        },
      }
    );

    await Like.deleteOne({user: user,post: id});

    res.status(200).json(updatePost);
  } catch (error) {
    res.status(500).json({ msg: "internal server" });
  }
};

const addCommentToPost = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user._id;
    const { content } = req.body;

    const ncomment = new Comment({
      content,
      user: user,
      post: id,
    });
    await ncomment.save();

    await Post.findByIdAndUpdate(id, { $push: { comments: ncomment._id } });

    res.status(200).json(ncomment);
  } catch (error) {
    res.status(500).json({ msg: "internal server errror at comment" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const id = req.params.id;
    const commentId = req.params.commentId;
    const user = req.user._id;

    const post = await Post.find(id);
    const comment = post.comments.find((comment) =>
      comment._id.equals(commentId)
    );

    if (!comment.user.equals(user)) {
      res
        .status(403)
        .json({ msg: "you are not authorized to delete this comment" });
    }
    post.comments.pull(commentId);
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const getPopularPost = async (req, res) => {
  try {
    let sortCriteria = {};

    if (sortBy === "likes") {
      sortCriteria = { likes: -1 };
    } else if (sortBy === "comments") {
      sortCriteria = { comments: -1 };
    } else {
      throw new Error("Invalid sorting criteria");
    }
    const popularPosts = await Post.find().sort(sortCriteria);

    res.status(200).json(popularPosts);
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const getLatestPost = async (req, res) => {
  try {
    const latestPost = await Post.findOne().sort("-createdAt");
    !latestPost
      ? res.status(404).json({ msg: "No posts found" })
      : res.status(200).json(latestPost);
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const searchPost = async (req, res) => {
  try {
    const keyword = req.body;
    const posts = await Post.find({
      content: {
        $regex: keyword,
        $options: "i",
      },
    });
    !posts
      ? res.status(404).json({ msg: "no post found" })
      : res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ msg: "internal servere error" });
  }
};

const userFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const userFollowing = await User.find({ _id: userId }).populate(
      "following"
    );

    const following = userFollowing.following.map((item) => item._id);

    const followingPost = await Post.find({ user: { $in: following } });

    const popularPost = await Post.find()
      .sort({ likes: -1 } || { comments: -1 })
      .limit(10);

    const feed = [...popularPost, ...followingPost];

    res.status(200).json(feed);
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const reportPost = async (req, res) => {
  try {
    const reporter = req.user._id;
    const reportedId = req.params.reportedId;
    const { reason, details } = req.body;

    const isReported = new Report({
      reporter: reporter,
      reportedUser: reportedId,
      reason,
      details,
    });
    await isReported.save();

    res.status(200).json({ msg: "Post has been reported" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const savePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedPosts: postId } },
      { new: true }
    );

    res
      .status(200)
      .json({ msg: "Post saved successfully", savedPosts: user.savedPosts });
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("savedPosts");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Extract the saved posts from the user object
    const savedPosts = user.savedPosts;

    res.status(200).json(savedPosts);
  } catch (error) {
    console.error("Error retrieving saved posts:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const getLikes = async (req, res) => {
  try {
    const likes = await Like.find();
    res.status(200).json(likes)
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ error: "Could not get likes for post." });
  }
};

const getLikesByPost = async(req,res) => {
  try {
    const postId = req.params.postId;

    const likes = await Like.find({ post: postId }).populate('user', 'username');

    res.status(200).json(likes);
  } catch (error) {
    console.error("Error fetching likes for post:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
}

const postAnalytics = async(req,res) => {
  try {
    const userId = req.user._id;
    
    const posts = await Post.find({user : userId});

    const analytics = posts.map((post) => ({
      likes : post.likes.length,
      comments: post.comments.length,
    }));

    res.status(200).json(analytics)

  } catch (error) {
    res.status(500).json({msg:"internal server error"})
  }
}

module.exports = {
  createPost,
  getAllPost,
  getPostById,
  deletePostById, //testing
  updatePostById, //testing
  getPostsByUser, //testing
  likePost, //testing
  unlikePost, //testing
  addCommentToPost, //testing
  deleteComment, //testing
  getPopularPost,
  getLatestPost,
  searchPost,
  userFeed,
  reportPost,
  savePost,
  getSavedPosts,
  getLikes,
  getLikesByPost,
  postAnalytics
};
