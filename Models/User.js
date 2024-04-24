const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    savedPosts: [{type: mongoose.Schema.Types.ObjectId , ref: 'Post'}],
    createdAt: { type: Date, default: Date.now },
    bio: { type: String },
    profilePicture: { type: String },
  });

  userSchema.methods.generateToken = async function() {
    try {
      return jwt.sign({
        userId: this._id.toString(),
        email: this.email,
        isAdmin: this.isAdmin,
      },
     process.env.SECRET_KEY,
      { expiresIn: "30d" }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const User = new mongoose.model("User",userSchema);
  module.exports = User