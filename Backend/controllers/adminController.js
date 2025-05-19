import User from "../models/User.js";
import Attendance from "../models/Attendance.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, roomNumber } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        roomNumber,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        roomNumber: updatedUser.roomNumber,
      },
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({}).populate(
      "user",
      "name email roomNumber"
    );
    res.status(200).json(records);
  } catch (error) {
    console.error("Get All Attendance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAttendanceByStudent = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.params.userId });
    res.status(200).json(records);
  } catch (error) {
    console.error("Get Student Attendance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
