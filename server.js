require("dotenv").config();
const express = require("express");
const authRoutes = require("./auth");

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use(express.static("public"));

const transcriptRoutes = require("./routes/transcript");
app.use("/transcript", transcriptRoutes);

const connectDB = require("./config/db");
connectDB();

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});

const requestRoutes = require("./routes/request");
app.use("/request", requestRoutes);
