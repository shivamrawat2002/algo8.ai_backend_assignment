const express = require("express");
const router = express.Router();

const {
    signup,
    login,
    logout,
    getAllUsers,
    getLoggedInUserDetails,
    updateUserDetails,
    deleteUser
} = require("../controllers/userControllers");

const { isLoggedIn } = require("../middlewares/user");

// Public routes
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);

// Protected routes
router.route("/users").get(isLoggedIn, getAllUsers);
router.route("/user/:id")
    .get(isLoggedIn, getLoggedInUserDetails)
    .put(isLoggedIn, updateUserDetails)
    .delete(isLoggedIn, deleteUser);

module.exports = router;
