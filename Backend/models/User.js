import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    studentId: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      unique: true,
      sparse: true, // allows unique but optional for admin
    },
    floor: {
      type: String,
      enum: ["GF", "FF", "SF", "TF"],
      required: function () {
        return this.role === "student";
      },
    },
    roomNumber: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      match: /^[0-9]{3}$/,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
