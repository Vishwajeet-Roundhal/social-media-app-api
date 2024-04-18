const User = require("../Models/User");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !phone || !password) {
      return res.status(400).json({ msg: "Please fill all fields" });
    }
    const userExists = await User.findOne({ email: email });

    if (await userExists)
      return res.status(409).json({ message: "User already exists" });

    const salt = 10;
    const pass = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      phone,
      password: pass,
    });

    if (!username || !email || !phone || !password) {
      return res.status(400).json({ msg: "Please fill all fields" });
    }

    res.status(200).json({
      newUser,
      token: await newUser.generateToken(),
      userId: newUser._id.toString(),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(email);

    if (!user) return res.status(400).json("user or password wrong");
    console.log(email, password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);

    if (!isMatch) return res.status(400).json("Invalid");
    // Return jsonwebtoken
    if (user) {
      res.json({
        token: await user.generateToken(),
        userId: user._id.toString(),
        username: user.username,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

const getUsersData = async (req, res) => {
  try {
    const user = await User.find();
    if (!user) {
      res.send("no user found");
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(401).json({ msg: "Auth failed" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await req.params.id;
    const result = await User.findOne({ _id: user });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const updateUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const { username, email, phone, password, bio, profilePicture } = req.body;

    if (!id) res.status(404).json({ msg: "no id found" });

    const updateUser = await User.updateOne(
      { _id: id },
      { $set: { username, email, phone, bio, profilePicture } }
    );
    if (updateUser.nModified === 0) {
      return res
        .status(401)
        .json({ msg: "Update field is empty or no document was modified!" });
    }
    res.status(200).json(updateUser);
  } catch (error) {
    res.status(500).json({ msg: "internel server error" });
  }
};

const getUserByUsername = async (req, res) => {
  try {
    const username = req.query.username;
    const user = await User.findOne({ username }).select("-password"); // exclude
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const followUser = async (req, res) => {
  try {
    const followingId = req.params.followingId;
    const user = req.user._id;
    const updateList = await User.updateOne(
      { _id: user },
      {
        $addToSet: {
          following: followingId,
        },
      }
    );
    if (updateList.nModified == 0) {
      return res.status(409).json("You are already following this user!");
    }
    res.status(200).json({ msg: "followed sucessfully" });
  } catch (error) {
    res.status(500).json({ msg: "Error in following" });
  }
};

const followersList = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findOne({ _id: userId }).populate(
      "followers",
      "username"
    );

    const followers = user.followers.map((follower) => follower.username);

    res.status(200).json({
      followers,
    });
  } catch (error) {
    res.status(500).json({ msg: "internel server eror" });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const followingId = req.params.followingId;

    await User.findByIdAndUpdate(userId, { $pull: { following: followingId } });

    res.status(200).json({msg:"unfollowed sucessfully"});
  } catch (error) {
    res.status(500).json({ msg: "server error" });
  }
};

module.exports = {
  register,
  login,
  getUsersData,
  getUserById,
  updateUserById,
  getUserByUsername,
  followUser,
  followersList,
  unfollowUser
};
