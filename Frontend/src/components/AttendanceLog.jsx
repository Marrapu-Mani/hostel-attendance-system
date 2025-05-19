import { useEffect, useState } from "react";
import api from "../utils/api";

const AttendanceLog = () => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get("/attendance/my");
        setAttendance(res.data);
      } catch (err) {
        console.error("Failed to fetch attendance", err);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Your Attendance Log</h2>
      <ul className="space-y-2">
        {attendance.map((record) => (
          <li
            key={record._id}
            className="bg-white shadow p-3 rounded flex justify-between items-center"
          >
            <span className="capitalize">{record.type}</span>
            <span className="text-gray-500 text-sm">
              {new Date(record.timestamp).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttendanceLog;
