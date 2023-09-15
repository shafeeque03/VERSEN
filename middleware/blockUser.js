const User = require('../models/userModel');

const checkUserBlocking = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.session.user_id });
    if (user && user.is_blocked == 1) {
      // Destroy the session if the user is blocked
      req.session.destroy();
      res.redirect('/login');
    } else {
      next(); // Continue to the next middleware/route
    }
  } catch (error) {
    // Handle any errors that occur during database query or session destroy
    console.error('Error:', error);
    res.status(500).send('Internal Server Error'); // You can customize the error response as needed
  }
};

module.exports = {
  checkUserBlocking
};
