const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const User = require("../models/User");
const { sendPasswordResetEmail } = require('../utils/emailService');
const { sendStateChangeEmail } = require('../utils/emailService');

exports.signup = async (req, res) => {
    try {
        const { name, email, password, userType } = req.body;
        const profilePicture = req.file ? req.file.filename : "";

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already in use" });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ name, email, userType, password: hashedPassword, profilePicture });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ error: "Signup failed" });
    }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrecr password" });
    }

    const token = jwt.sign({ userId: user._id }, "yourSecretKey", { expiresIn: "1d" });

    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture } });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
      // Validate inputs
      if (!email || !currentPassword || !newPassword) {
          return res.status(400).json({ error: 'All fields are required' });
      }

      // Log input data (for debugging purposes, remove in production)
      console.log('Change Password Request:', { email, currentPassword, newPassword });

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
          return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash and update new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await user.save();

      res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
      console.error('Error changing password:', error.message);

      // Check for specific errors
      if (error.name === 'ValidationError') {
          return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Server error while changing password' });
  }
};

// Forgot password request
exports.forgotPassword = async (req, res) => {
  try {
    const { email, fullName, userType } = req.body;

    // Input validation
    if (!email || !fullName || !userType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Find user
    const user = await User.findOne({ email, userType });
    if (!user) {
      return res.status(404).json({ error: 'No user found with these details' });
    }

    // Name verification (case insensitive)
    if (user.name.toLowerCase() !== fullName.toLowerCase()) {
      return res.status(400).json({ error: 'User details do not match our records' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();

    // Attempt to send email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      return res.status(200).json({ 
        message: 'Password reset link sent to your email'
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // Clean up the token since email failed
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({ 
        error: 'Failed to send reset email',
        details: emailError.message // Include details for debugging
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ 
      error: 'Server error during password reset',
      details: error.message // Include details for debugging
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Reset token is required' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find user by token and check expiration
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Server error during password reset' });
  }
};

// Update user profile
exports.UserupdateUserProfile = async (req, res) => {
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

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-__v -password') // Explicitly exclude password and version key
      .lean(); // Convert to plain JavaScript objects
    
    res.status(200).json(users); // Send the array directly
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Optional: Get all active users only
exports.getAllActiveUsers = async (req, res) => {
  try {
    const users = await User.find({ state: 'Active' }).select('-__v');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Count users by type
exports.countUsersByType = async (req, res) => {
  try {
    const userCount = await User.countDocuments({ userType: 'User' });
    const managerCount = await User.countDocuments({ userType: 'Manager' });
    const adminCount = await User.countDocuments({ userType: 'Admin' });
    
    res.status(200).json({
      success: true,
      userCount,
      managerCount,
      adminCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateUserState = async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;
    
    if (!state || !['Active', 'Inactive'].includes(state)) {
      return res.status(400).json({ error: "Invalid state value" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Don't allow modifying own account
    if (req.user._id.toString() === id) {
      return res.status(403).json({ error: "Cannot modify your own account status" });
    }

    user.state = state;
    await user.save();

    // Send notification email
    try {
      await sendStateChangeEmail(
        user.email,
        user.name,
        state === 'Active' ? 'activate' : 'deactivate'
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue even if email fails
    }

    return res.status(200).json({ 
      message: "User state updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        state: user.state
      }
    });
  } catch (error) {
    console.error("Update state error:", error);
    return res.status(500).json({ error: "Failed to update user state" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Don't allow deleting own account
    if (req.user._id.toString() === id) {
      return res.status(403).json({ error: "Cannot delete your own account" });
    }

    // Send notification before deletion
    try {
      await sendStateChangeEmail(user.email, user.name, 'delete');
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue with deletion even if email fails
    }
    
    await User.findByIdAndDelete(id);

    return res.status(200).json({ 
      message: "User deleted successfully",
      deletedUserId: id
    });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
};
