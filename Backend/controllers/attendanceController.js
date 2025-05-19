import moment from "moment";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

export const markAttendance = async (req, res) => {
  const userId = req.user._id;
  const today = moment().startOf("day").toDate();

  try {
    let attendance = await Attendance.findOne({ user: userId, date: today });

    if (!attendance) {
      attendance = new Attendance({
        user: userId,
        date: today,
        checkInTime: new Date(),
        method: "Manual",
      });
      await attendance.save();
      return res.status(200).json({ message: "Checked in successfully." });
    }

    if (!attendance.checkOutTime) {
      attendance.checkOutTime = new Date();
      await attendance.save();
      return res.status(200).json({ message: "Checked out successfully." });
    }

    return res
      .status(400)
      .json({ message: "Already checked in and out for today." });
  } catch (error) {
    console.error("Attendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all attendance records for the current user
    const records = await Attendance.find({ user: userId }).sort({
      createdAt: -1,
    });

    // Format response
    const formattedRecords = records.flatMap((record) => {
      const result = [];
      if (record.checkIn) {
        result.push({
          _id: `${record._id}-in`,
          type: "check-in",
          timestamp: record.checkIn,
        });
      }
      if (record.checkOut) {
        result.push({
          _id: `${record._id}-out`,
          type: "check-out",
          timestamp: record.checkOut,
        });
      }
      return result;
    });

    res.json(formattedRecords);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ message: "Failed to fetch attendance logs." });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("user", "name email roomNumber")
      .sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve attendance records" });
  }
};

export const filterAttendance = async (req, res) => {
  const { date, roomNumber, userId } = req.query;
  const filter = {};

  if (date) filter.date = moment(date).startOf("day").toDate();
  if (userId) filter.user = userId;

  try {
    let records = await Attendance.find(filter).populate(
      "user",
      "name email roomNumber"
    );

    if (roomNumber) {
      records = records.filter(
        (record) => record.user.roomNumber === roomNumber
      );
    }

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to filter attendance" });
  }
};

export const exportAttendanceCSV = async (req, res) => {
  try {
    const records = await Attendance.find().populate(
      "user",
      "name email roomNumber"
    );

    const data = records.map((r) => ({
      Name: r.user.name,
      Email: r.user.email,
      Room: r.user.roomNumber,
      Date: moment(r.date).format("YYYY-MM-DD"),
      CheckIn: r.checkInTime ? moment(r.checkInTime).format("HH:mm:ss") : "",
      CheckOut: r.checkOutTime ? moment(r.checkOutTime).format("HH:mm:ss") : "",
      Method: r.method,
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment("attendance.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Failed to export CSV" });
  }
};

export const exportAttendancePDF = async (req, res) => {
  try {
    const records = await Attendance.find().populate(
      "user",
      "name email roomNumber"
    );

    const doc = new PDFDocument();
    const stream = new Readable().wrap(doc);

    doc.fontSize(18).text("Attendance Report", { align: "center" });
    doc.moveDown();

    records.forEach((r) => {
      doc
        .fontSize(12)
        .text(
          `Name: ${r.user.name} | Email: ${r.user.email} | Room: ${
            r.user.roomNumber
          } | Date: ${moment(r.date).format("YYYY-MM-DD")} | CheckIn: ${
            r.checkInTime ? moment(r.checkInTime).format("HH:mm:ss") : "-"
          } | CheckOut: ${
            r.checkOutTime ? moment(r.checkOutTime).format("HH:mm:ss") : "-"
          } | Method: ${r.method}`
        );
      doc.moveDown();
    });

    doc.end();
    res.setHeader("Content-Disposition", "attachment; filename=attendance.pdf");
    res.setHeader("Content-Type", "application/pdf");
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Failed to export PDF" });
  }
};

export const scanQrAttendance = async (req, res) => {
  try {
    console.log("Incoming scan with ID:", req.body.studentId);
    const { studentId } = req.body;

    const user = await User.findOne({ studentId });
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let attendance = await Attendance.findOne({
      user: user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!attendance) {
      attendance = new Attendance({
        user: user._id,
        studentId,
        checkIn: new Date(),
        date: new Date(), // Save full date
      });
      await attendance.save();
      return res.json({ status: "Checked In" });
    } else if (!attendance.checkOut) {
      attendance.checkOut = new Date();
      await attendance.save();
      return res.json({ status: "Checked Out" });
    } else {
      return res.json({ status: "Already Checked In & Out" });
    }
  } catch (err) {
    console.error("QR Scan Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
