const userModel = require("../models/userModel");

const islogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      const User = await userModel.findOne({
        _id: req.session.user_id,
      });
      if (User.is_admin === 0) {
        req.user = User;
        next(); // Allow access to the admin route
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const islogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect("/home");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  islogin,
  islogout,
};
