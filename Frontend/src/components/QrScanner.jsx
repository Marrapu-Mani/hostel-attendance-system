import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

const QrScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
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

    return () => {
      scanner.clear().catch((err) => console.error(err));
    };
  }, [onScanSuccess]);

  return <div id="reader" />;
};

export default QrScanner;
