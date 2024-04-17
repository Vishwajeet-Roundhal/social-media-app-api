const User = require("../Models/User")
const bcrypt = require("bcryptjs")

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
  
      res
        .status(200)
        .json({
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
      return  res.status(500).json({ error: "Server error" });
    }
  };


  const getUsersData = async (req,res) => {
    try {
      const user = await User.find();
      if(!user){
        res.send("no user found")
      }

      return res.status(200).json(user)
      
    } catch (error) {
      return res.status(401).json({ msg: 'Auth failed' });
    }
  }

  const getUserById = async(req,res) => {
    try {
        const user = await req.params.id;
        const result = await User.findOne({ _id : user })
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({msg:"internal server error"})
    }
  }

module.exports = {register, login, getUsersData,getUserById}