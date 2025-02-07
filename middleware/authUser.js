const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protector = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401);
      throw new Error('Unauthorized user, please log in.');
    }

    // Verify the token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID from the token payload
    const user = await User.findById(verified.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('User not found.');
    }

    // Attach the user object to the request for later use
    req.user = user;

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not an authorized user.');
  }
});

module.exports = protector;
