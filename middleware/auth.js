const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticateUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      res.status(401);
      throw new Error("Please login.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
};

exports.admin = async (req, res, next) => {
  try {
    const isAdmin = req.user.isAdmin;
    if (!isAdmin) {
      throw new Error("you are not autherised to perform this action");
    }
    next();
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
};
