// import QRDisplay from "../components/QRDisplay";
// import AttendanceLog from "../components/AttendanceLog";

// const Dashboard = () => {
//   return (
//     <div className="max-w-2xl mx-auto mt-10 p-4">
//       <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
//       <QRDisplay />
//       <AttendanceLog />
//     </div>
//   );
// };

// export default Dashboard;

import { useState, useEffect } from "react";
import { LogOut, Calendar, User, Clock, BookOpen } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("qr");

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

  const handleLogout = () => {
    logout();
    // Redirect to login page would happen in your Auth context
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen size={24} />
            <h1 className="text-xl font-bold">Student Portal</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden md:block">
              <p className="text-sm">{user?.name || "Student"}</p>
              <p className="text-xs opacity-75">ID: {user?.studentId}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center bg-indigo-700 hover:bg-indigo-800 px-3 py-2 rounded-md transition-colors"
            >
              <LogOut size={16} className="mr-1" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto mt-8 px-4 pb-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex items-center px-6 py-3 text-sm font-medium ${
                activeTab === "qr"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User size={18} className="mr-2" />
              <span>My QR Code</span>
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`flex items-center px-6 py-3 text-sm font-medium ${
                activeTab === "attendance"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Calendar size={18} className="mr-2" />
              <span>Attendance Log</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "qr" ? (
              <QRCodeDisplay user={user} />
            ) : (
              <AttendanceLogDisplay attendance={attendance} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const QRCodeDisplay = ({ user }) => {
  if (!user?.studentId) return <p>Loading student information...</p>;

  return (
    <div className="flex flex-col items-center py-6">
      <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
        <QRCodeSVG value={user.studentId} size={220} />
      </div>
      <div className="mt-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {user.name || "Student"}
        </h2>
        <p className="text-gray-500">ID: {user.studentId}</p>
        <p className="mt-4 text-sm text-gray-600 max-w-md mx-auto">
          Present this QR code to mark your attendance. Keep it handy for quick
          scanning.
        </p>
      </div>
    </div>
  );
};

const AttendanceLogDisplay = ({ attendance }) => {
  if (attendance.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
        <p className="text-lg text-gray-500">No attendance records found</p>
        <p className="text-sm text-gray-400">
          Your attendance will appear here once you check in
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Attendance History
        </h2>
        <p className="text-sm text-gray-500">
          Your recent check-ins and check-outs
        </p>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {attendance.map((record) => {
            const date = new Date(record.timestamp);
            const formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const formattedTime = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <li key={record._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-full ${
                        record.type.toLowerCase() === "check-in"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      <Clock
                        size={16}
                        className={
                          record.type.toLowerCase() === "check-in"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-800 capitalize">
                        {record.type}
                      </p>
                      <p className="text-sm text-gray-500">
                        {record.course || "General"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formattedTime}
                    </p>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
