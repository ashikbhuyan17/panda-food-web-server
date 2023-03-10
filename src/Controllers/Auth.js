const User = require("../Model/Auth");
const shortid = require("shortid");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: "Already registered!" });
    } else {
      const hash_password = await bcrypt.hash(password, 10);
      const _newUser = new User({
        ...req.body,
        password: hash_password,
        role: "user",
      });
      _newUser.save((error, user) => {
        if (error)
          res.status(400).json({ error: "Something went wrong!", error });
        if (user) {
          res.status(201).json({ message: "User create successful!" });
        }
      });
    }
  } catch (error) {
    res.status(400).json({ message: "something went wrong!", error });
  }
};
exports.signing = async (req, res) => {
  const { email, password } = req.body;
  await User.findOne({ email: email }).exec(async (error, user) => {
    if (error) res.status(400).json({ error });
    else if (!user) {
      res.status(400).json({ error: "User not found" });
    } else if (user) {
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        );
        const { _id, firstName, lastName, role, email } = user;
        if (token) {
          res.status(200).json({
            token,
            user: {
              _id,
              firstName,
              lastName,
              role,
              email,
            },
          });
        }
      } else {
        res.status(400).json({ error: "Invalid password!" });
      }
    }
  });
};
