require("dotenv").config();
const express = require("express");
const connectDB = require("./utils/db");
const auth = require("./Routers/auth");
const post = require("./Routers/post.route")
const app = express();
PORT = 4000;
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/post",post)

connectDB().then(() => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error, "database error");
  }
});
