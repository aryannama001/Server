const User = require("../models/User");
const sendToken = require("../utils/token");
const cloudinary = require("cloudinary");

//create user
exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const alreadyRegistered = await User.findOne({ email });
    if (alreadyRegistered) {
      throw new Error("User Already registered");
    }
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "ecommerce/avatars",
      width: 150,
      crop: "scale",
    });

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });
    sendToken(user, res, 201);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

//login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(401);
      throw new Error("Please enter email and password");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isCorrectPassword = await user.comparePassword(password);

    if (!isCorrectPassword) {
      res.status(401);
      throw new Error("Invalid email or password");
    }
    sendToken(user, res, 200);
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
};

//logout user

exports.logoutUser = async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

//get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

//update user password

exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  try {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
      throw new Error("Password is incorrect");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("Confirm password does not match");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updatd successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

//update profile
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  let userInfo = {
    name,
    email,
  };

  try {
    if (req.body.avatar !== "") {
      const user = await User.findById(req.user.id);

      await cloudinary.v2.uploader.destroy(user.avatar.public_id);

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "ecommerce/avatars",
        width: 150,
        crop: "scale",
      });

      userInfo.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    const user = await User.findByIdAndUpdate(req.user.id, userInfo, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

//get all users -- Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

//get a user -- Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};

//update user role --admin
exports.updateUserRole = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin: req.body.isAdmin },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};

//delete user -- Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    await user.remove();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
};
