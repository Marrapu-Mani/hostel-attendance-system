import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../context/AuthContext";

const QRDisplay = () => {
  const { user } = useAuth();

  if (!user?.studentId) return null;

  return (
    <div className="flex flex-col items-center">
      <p className="text-lg font-semibold mb-2">Your QR Code</p>
      <QRCodeSVG value={user.studentId} size={180} />
      <p className="mt-2 text-sm text-gray-500">Student ID: {user.studentId}</p>
    </div>
  );
};

export default QRDisplay;
