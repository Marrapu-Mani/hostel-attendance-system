import express from "express";

import {
  markAttendance,
  getAllAttendance,
  filterAttendance,
  exportAttendanceCSV,
  exportAttendancePDF,
  scanQrAttendance,
  getMyAttendance,
} from "../controllers/attendanceController.js";

import protect from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post("/mark", protect, markAttendance);

router.get("/my", protect, getMyAttendance);

router.get("/all", protect, isAdmin, getAllAttendance);

router.get("/filter", protect, isAdmin, filterAttendance);

router.get("/export/csv", protect, isAdmin, exportAttendanceCSV);

router.get("/export/pdf", protect, isAdmin, exportAttendancePDF);

router.post("/scan", scanQrAttendance);

export default router;
