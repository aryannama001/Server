const express = require("express");
const {
  createUser,
  getAllUsers,
  getUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  updatePassword,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");
const { authenticateUser, admin } = require("../middleware/auth");
const router = express.Router();

router.route("/").get(authenticateUser, admin, getAllUsers).post(createUser);
router.route("/login").post(loginUser);
router.route("/logout").get(authenticateUser, logoutUser);

router
  .route("/profile")
  .get(authenticateUser, getProfile)
  .put(authenticateUser, updateProfile);
router.route("/profile/password").put(authenticateUser, updatePassword);

router
  .route("/:id")
  .get(authenticateUser, admin, getUser)
  .put(authenticateUser, admin, updateUserRole)
  .delete(authenticateUser, admin, deleteUser);

module.exports = router;
