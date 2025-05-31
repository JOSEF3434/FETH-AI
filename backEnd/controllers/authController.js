//'./controllers/authController';

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const signup = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : "/uploads/default_avatar.png"; // ✅ Fix the path

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePicture,
      userType,
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "Signup successful!",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePicture: `http://localhost:4000${newUser.profilePicture}`, // ✅ Return correct image URL
        userType: newUser.userType,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: `http://localhost:4000${user.profilePicture}`, // ✅ Fix image path
      userType: user.userType,
      token,
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all users
const AllUser = async (req, res) => {
  try {
      const users = await User.find({}, "name profilePicture"); // ✅ Fetch correct field
      res.json(users);
  } catch (error) {
      res.status(500).json({ error: "Failed to retrieve users" });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from request params
    const { name, email, password } = req.body;
    let profilePicture = req.file ? `/uploads/${req.file.filename}` : null; // Handle profile picture upload

    // Find the user by ID
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: `http://localhost:4000${user.profilePicture}`,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { signup, login, AllUser,updateUserProfile };
