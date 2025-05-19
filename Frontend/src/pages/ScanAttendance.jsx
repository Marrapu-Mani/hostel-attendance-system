import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Camera,
  Check,
  X,
  RefreshCw,
  UserCheck,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const ScanAttendancePage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(true);
  const [status, setStatus] = useState("ready"); // ready, success, error
  const [studentInfo, setStudentInfo] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  const handleScan = async (studentId) => {
    try {
      setStatus("loading");
      console.log("Scanned Student ID:", studentId);
      const res = await api.post("/api/attendance/scan", { studentId });

      // Simulate getting student info (in a real app, this might come from the API)
      const studentName = res.data.studentName || "Student";
      const attendanceType = res.data.type || "Check-in";

      setStudentInfo({
        id: studentId,
        name: studentName,
        timestamp: new Date(),
        type: attendanceType,
      });

      // Add to scan history
      setScanHistory((prev) => [
        {
          id: studentId,
          name: studentName,
          timestamp: new Date(),
          type: attendanceType,
          success: true,
        },
        ...prev.slice(0, 4),
      ]);

      setStatus("success");
      setMessage(res.data.status || "Attendance recorded successfully");
      setScanning(false);
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.message || "Scan failed or student not found"
      );
      setScanHistory((prev) => [
        {
          id: studentId,
          timestamp: new Date(),
          success: false,
        },
        ...prev.slice(0, 4),
      ]);
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setStatus("ready");
    setMessage("");
    setStudentInfo(null);
    setScanning(true);
  };

  const goBackToAdmin = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Camera size={24} />
            <h1 className="text-xl font-bold">Attendance Scanner</h1>
          </div>
          <button
            onClick={goBackToAdmin}
            className="flex items-center bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-4 pb-12">
        {/* Mobile Back to Admin Button (visible only on small screens) */}
        <div className="md:hidden mb-4">
          <button
            onClick={goBackToAdmin}
            className="flex items-center justify-center w-full bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 py-3 rounded-md shadow-sm transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Scan Student QR Code
              </h2>
              {!scanning && (
                <button
                  onClick={resetScanner}
                  className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <RefreshCw size={16} className="mr-2" />
                  <span>Scan Again</span>
                </button>
              )}
            </div>

            {/* Scanner or Result */}
            <div className="flex flex-col items-center justify-center">
              {scanning ? (
                <div className="w-full max-w-md mx-auto">
                  <QrScanner onScanSuccess={handleScan} />
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Position the QR code in the scanner frame
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-md mx-auto text-center p-6 border rounded-lg bg-gray-50">
                  {status === "success" ? (
                    <div className="space-y-4">
                      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-2">
                        <Check size={32} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {studentInfo?.name}
                      </h3>
                      <p className="text-gray-500">ID: {studentInfo?.id}</p>
                      <p className="text-green-600 font-medium">{message}</p>
                      <div className="pt-2">
                        <p className="text-sm text-gray-500">
                          {studentInfo?.type} at{" "}
                          {studentInfo?.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-2">
                        <X size={32} className="text-red-600" />
                      </div>
                      <p className="text-red-600 font-medium">{message}</p>
                      <p className="text-sm text-gray-500">
                        Please try scanning again
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Scans */}
            {scanHistory.length > 0 && (
              <div className="mt-10">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Scans
                </h3>
                <div className="space-y-2">
                  {scanHistory.map((scan, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-md ${
                        scan.success ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-full ${
                            scan.success ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {scan.success ? (
                            <UserCheck size={16} className="text-green-600" />
                          ) : (
                            <X size={16} className="text-red-600" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">
                            {scan.name || `ID: ${scan.id}`}
                          </p>
                          {scan.type && (
                            <p className="text-xs text-gray-500 capitalize">
                              {scan.type}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {scan.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={goBackToAdmin}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Return to Admin Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

// Enhanced QR Scanner component
const QrScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [0, 12], // Only QR code and Code-39
        rememberLastUsedCamera: true,
        aspectRatio: 1,
        showTorchButtonIfSupported: true,
        defaultZoomValueIfSupported: 1.5,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        scanner.clear();
      },
      (error) => {
        console.warn(error);
      }
    );

    // Cleanup function
    return () => {
      scanner.clear().catch((err) => console.error(err));
    };
  }, [onScanSuccess]);

  return (
    <div id="reader" className="border rounded-lg overflow-hidden mx-auto" />
  );
};

export default ScanAttendancePage;
