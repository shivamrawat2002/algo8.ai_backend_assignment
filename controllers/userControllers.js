const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");

exports.signup = BigPromise(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required"
        });
    }

    const user = await User.create({
        name,
        email,
        password
    });

    const token = user.getJwtToken();

    res.cookie("token", token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true
    });

    res.status(201).json({
        success: true,
        token,
        user
    });
});

exports.login = BigPromise(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide email and password"
        });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Email or password does not match or exist"
        });
    }

    const isPasswordCorrect = await user.validatePassword(password);

    if (!isPasswordCorrect) {
        return res.status(400).json({
            success: false,
            message: "Email or password does not match or exist"
        });
    }

    const token = user.getJwtToken();

    res.cookie("token", token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        token,
        user
    });
});

exports.logout = BigPromise(async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "Logout success"
    });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("There is no user with that email", 404));
  }

  const forgotToken = user.getForgotPasswordToken();
  await user.save({ validateBeforeSave: false });

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${forgotToken}`;

  const message = `Your password reset token is as follow: \n\n ${myUrl} \n\n If you have not requested this email, then ignore it.`;

  try {
    await mailHelper({
      email: email,
      subject: "TSHIRT STORE Password Reset Token",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new CustomError(error.message, 500));
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    encryptedToken,
    forgotPasswordExpire: { $gt: Date.now() },
  });
  console.log("user", user);

  if (!user) {
    return next(new CustomError("Invalid token or Expired", 400));
  }

  if (!req.body.password) {
    return next(new CustomError("Password does not match", 400));
  }
  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpire = undefined;

  await user.save();

  cookieToken(user, res);
  console.log("user", user);
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  console.log("user", user, req.params.id);

  res.status(200).json({
    status: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.body.id;
  const user = await User.findById(userId).select("+password");

  const isCorrectOldPassword = await user.isValidatedPassword(
    req.body.oldPassword
  );

  if (!isCorrectOldPassword) {
    return next(new CustomError("Old password is incorrect", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };
  if (req.files?.photo !== "" && req.files?.photo !== undefined) {
    const user = await User.findById(req.user.id);
    const imageId = user.photo.id;

    const resp = await cloudinary.v2.uploader.destroy(imageId);

    const result = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.body.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

exports.getAllUsers = BigPromise(async (req, res) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    });
});

exports.getLoggedInUserDetails = BigPromise(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    res.status(200).json({
        success: true,
        user
    });
});

exports.updateUserDetails = BigPromise(async (req, res) => {
    const newData = {
        name: req.body.name,
        email: req.body.email
    };

    if (req.body.mobile) {
        newData.mobile = {
            countryCode: req.body.mobile.countryCode,
            phone: req.body.mobile.phone
        };
    }

    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        user
    });
});

exports.deleteUser = BigPromise(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    await user.remove();
    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
});
