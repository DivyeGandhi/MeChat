const express = require('express');
const router = express.Router();
const { registerUser, authUser, allUsers } = require('../Controllers/userControllers');
const { protect } = require('../Middleware/authMiddleware');

// Route for user registration and getting all users
router.route('/')
    .post(registerUser)  // Register new user
    .get(protect, allUsers);  // Get all users (protected route)

// Route for user authentication (login)
router.route('/login')
    .post(authUser);  // Authenticate user

module.exports = router;
