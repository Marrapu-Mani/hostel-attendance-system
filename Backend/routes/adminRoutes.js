import express from "express";

import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAttendanceByStudent,
  getAllAttendance,
} from "../controllers/adminController.js";

import protect from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.use(protect, isAdmin);

router.get("/users", getAllUsers);

router.get("/users/:id", getUserById);

router.put("/users/:id", updateUser);

router.delete("/users/:id", deleteUser);

router.get("/attendance", getAllAttendance);

router.get("/attendance/:userId", getAttendanceByStudent);

export default router;
