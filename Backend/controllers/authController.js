import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, studentId, floor, roomNumber } =
      req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered." });

    // If student, check studentId uniqueness
    if (role === "student") {
      if (!studentId || !floor || !roomNumber) {
        return res.status(400).json({
          message: "StudentId, floor and roomNumber are required for students.",
        });
      }
      const existingStudentId = await User.findOne({ studentId });
      if (existingStudentId)
        return res
          .status(400)
          .json({ message: "Student ID already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user object
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || "student",
      studentId: role === "student" ? studentId : undefined,
      floor: role === "student" ? floor : undefined,
      roomNumber: role === "student" ? roomNumber : undefined,
    };

    const newUser = new User(userData);
    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, studentId: newUser.studentId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        studentId: newUser.studentId || null,
        floor: newUser.floor || null,
        roomNumber: newUser.roomNumber || null,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password." });

    const token = jwt.sign(
      { id: user._id, role: user.role, studentId: user.studentId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId || null,
        floor: user.floor || null,
        roomNumber: user.roomNumber || null,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};
