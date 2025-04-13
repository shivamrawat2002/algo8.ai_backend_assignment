const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxLength: [40, "Name should be under 40 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    validate: [validator.isEmail, "Please enter email in correct format"],
    unique: true,
  },
  userType: {
    type: String,
    enum: ["GUEST", "HOST"],
    default: "GUEST",
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [6, "Password should be at least 6 characters"],
    select: false,
  },
  mobile: {
    countryCode: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
      maxlength: [10, "Phone number cannot be more than 10 characters"],
      minlength: [10, "Phone number cannot be less than 10 characters"],
    },
  },
});

//Encrypting password before saving
userSchema.pre("save", async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified("password")) return next();
  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//Compare user password with hashed password in database
userSchema.methods.validatePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

//Generate forgot password token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

//Generate forgot password token
userSchema.methods.getForgotPasswordToken = function () {
  //Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  //Hash and set to forgotPasswordToken
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //Set token expiry time
  this.forgotPasswordExpiry = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
