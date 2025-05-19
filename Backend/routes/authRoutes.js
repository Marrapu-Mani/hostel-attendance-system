import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (student or admin)
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    Login a user and return token
// @access  Public
router.post("/login", loginUser);

export default router;
