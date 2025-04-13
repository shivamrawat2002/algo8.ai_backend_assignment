const express = require("express");

require("dotenv").config();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);

  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});

//Morgan middleware
app.use(morgan("tiny"));

//cookie parser middleware
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

const user = require("./routes/user");
const home = require("./routes/home");

//regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//MIDDLEWARE
app.use("/api/v1", user);
app.use("/api/v1", home);

// Add 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

//exporting app js
module.exports = app;
