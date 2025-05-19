import { useEffect, useState } from "react";
import {
  Calendar,
  User,
  Filter,
  ChevronDown,
  Search,
  Download,
  Clock,
  Users,
  FileText,
  QrCode,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    studentId: "",
    name: "",
    date: "",
  });
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    presentNow: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchAllAttendance = async () => {
      try {
        const res = await api.get("/api/attendance/all");
        setAttendanceLogs(res.data);
        setFilteredLogs(res.data);

        // Calculate stats
        const uniqueStudents = new Set(res.data.map((log) => log.studentId));
        const today = new Date().toLocaleDateString();
        const todayLogs = res.data.filter(
          (log) => new Date(log.date).toLocaleDateString() === today
        );
        const presentNow = res.data.filter(
          (log) =>
            log.checkIn &&
            !log.checkOut &&
            new Date(log.date).toLocaleDateString() === today
        );

        setStats({
          totalStudents: uniqueStudents.size,
          todayAttendance: todayLogs.length,
          presentNow: presentNow.length,
        });
      } catch (err) {
        console.error("Failed to fetch attendance logs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAttendance();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, attendanceLogs]);

  const applyFilters = () => {
    let result = [...attendanceLogs];

    if (filters.studentId) {
      result = result.filter(
        (log) =>
          log.studentId &&
          log.studentId.toLowerCase().includes(filters.studentId.toLowerCase())
      );
    }

    if (filters.name) {
      result = result.filter(
        (log) =>
          log.user?.name &&
          log.user.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.date) {
      const filterDate = new Date(filters.date).toLocaleDateString();
      result = result.filter(
        (log) => new Date(log.date).toLocaleDateString() === filterDate
      );
    }

    setFilteredLogs(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      studentId: "",
      name: "",
      date: "",
    });
  };

  const exportToCSV = () => {
    // Convert data to CSV
    const headers = ["Student ID", "Name", "Check-In", "Check-Out", "Date"];
    const csvData = filteredLogs.map((log) => [
      log.studentId,
      log.user?.name || "N/A",
      log.checkIn ? new Date(log.checkIn).toLocaleString() : "",
      log.checkOut ? new Date(log.checkOut).toLocaleString() : "",
      new Date(log.date).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `attendance_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    a.click();
  };

  const goToScanPage = () => {
    navigate("/scan");
  };

  const handleLogout = () => {
    logout();
    // Redirect to login page would happen in your Auth context
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-indigo-100">Attendance Management System</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={goToScanPage}
              className="flex items-center bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
            >
              <QrCode size={20} className="mr-2" />
              Scan Attendance
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center bg-indigo-800 text-white hover:bg-indigo-900 px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Calendar size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today's Attendance</p>
              <p className="text-2xl font-bold">{stats.todayAttendance}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <Clock size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Currently Present</p>
              <p className="text-2xl font-bold">{stats.presentNow}</p>
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons (Visible only on small screens) */}
        <div className="md:hidden mb-6 grid grid-cols-2 gap-4">
          <button
            onClick={goToScanPage}
            className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center py-3 rounded-lg font-medium transition-colors shadow-md"
          >
            <QrCode size={20} className="mr-2" />
            Scan Attendance
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white hover:bg-red-700 flex items-center justify-center py-3 rounded-lg font-medium transition-colors shadow-md"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </button>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">Attendance Records</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="ml-4 flex items-center text-sm text-gray-600 hover:text-indigo-600"
              >
                <Filter size={16} className="mr-1" />
                Filters
                <ChevronDown
                  size={16}
                  className={`ml-1 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={exportToCSV}
                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded flex items-center text-sm"
              >
                <Download size={16} className="mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="p-4 bg-gray-50 border-b">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="studentId"
                      value={filters.studentId}
                      onChange={handleFilterChange}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Search by ID"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={filters.name}
                      onChange={handleFilterChange}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Search by name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="date"
                      value={filters.date}
                      onChange={handleFilterChange}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-indigo-500 border-r-transparent mb-4"></div>
                <p className="text-gray-500">Loading attendance records...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-lg text-gray-500">No records found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Student ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Check-In
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Check-Out
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => {
                    // Calculate duration if both check-in and check-out exist
                    let duration = "—";
                    if (log.checkIn && log.checkOut) {
                      const checkInTime = new Date(log.checkIn).getTime();
                      const checkOutTime = new Date(log.checkOut).getTime();
                      const durationMs = checkOutTime - checkInTime;
                      const durationHours = Math.floor(
                        durationMs / (1000 * 60 * 60)
                      );
                      const durationMinutes = Math.floor(
                        (durationMs % (1000 * 60 * 60)) / (1000 * 60)
                      );
                      duration = `${durationHours}h ${durationMinutes}m`;
                    }

                    return (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {log.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.user?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.checkIn ? (
                            <span className="flex items-center text-green-600">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              {new Date(log.checkIn).toLocaleTimeString()}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.checkOut ? (
                            <span className="flex items-center text-red-600">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                              {new Date(log.checkOut).toLocaleTimeString()}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {duration}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination could be added here */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">{filteredLogs.length}</span> of{" "}
                  <span className="font-medium">{filteredLogs.length}</span>{" "}
                  results
                </p>
              </div>
              {/* Actual pagination buttons would go here */}
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons (only visible on medium screens and up) */}
        <div className="hidden md:block fixed right-8 bottom-8 space-y-4">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-colors"
            title="Logout"
          >
            <LogOut size={24} />
          </button>
          <button
            onClick={goToScanPage}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-colors"
            title="Scan Attendance"
          >
            <QrCode size={24} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
