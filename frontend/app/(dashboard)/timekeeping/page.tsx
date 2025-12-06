"use client";
import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin, QrCode, FileText } from "lucide-react";

// --- Scanner Component (Unchanged) ---
const QrScannerDisplay = ({
  onScanSuccess,
  onScanFailure,
}: {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure: (error: string) => void;
}) => {
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanFailureRef = useRef(onScanFailure);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    onScanFailureRef.current = onScanFailure;
  }, [onScanFailure]);

  useEffect(() => {
    const scannerRegionId = "qr-scanner-region";
    const successWrapper = (decodedText: string, decodedResult: any) => {
      onScanSuccessRef.current(decodedText, decodedResult);
    };
    const failureWrapper = (error: string) => {
      onScanFailureRef.current(error);
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerRegionId,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    html5QrcodeScanner.render(successWrapper, failureWrapper);
    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear scanner.", error);
      });
    };
  }, []);

  return <div id="qr-scanner-region" className="w-full"></div>;
};

// --- Main Page ---
export default function TimekeepingPage() {
  const [loadingIp, setLoadingIp] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [qrPayload, setQrPayload] = useState("");
  const { toast } = useToast();

  // --- UPDATED: Status Helper with English Titles & Variants ---
  const showStatus = (
    type: "success" | "error" | "info" | "warning",
    text: string
  ) => {
    if (type === "success") {
      toast({
        variant: "success", // Green color + Check icon
        title: "Success",
        description: text,
      });
    } else if (type === "error") {
      toast({
        variant: "destructive", // Red color + Alert icon
        title: "Error",
        description: text,
      });
    } else if (type === "warning") {
      toast({
        variant: "warning", // Yellow color + Triangle icon
        title: "Warning",
        description: text,
      });
    } else {
      toast({
        variant: "info", // Blue color + Info icon
        title: "Info",
        description: text,
      });
    }
  };

  const handleIpCheckIn = async () => {
    setLoadingIp(true);
    try {
      const res = await fetch("/api/timekeeping/check-in/ip", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        const employeeName = json.employee?.first_name || "Employee";
        const timeStr = new Date(json.check_in_time).toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }
        );
        showStatus(
          "success",
          `Check-in Successful! Welcome, ${employeeName} at ${timeStr}`
        );
      } else {
        const json = await res.json();
        showStatus("error", json?.message || "IP check-in failed");
      }
    } catch (err) {
      showStatus("error", "IP check-in connection failed");
    } finally {
      setLoadingIp(false);
    }
  };

  const submitQr = async (payload?: string) => {
    const p = payload ?? qrPayload;
    if (!p) {
      showStatus("error", "No QR payload available");
      return;
    }
    setLoadingQr(true);
    try {
      const res = await fetch("/api/timekeeping/check-in/qr", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: p }),
      });
      const json = await res.json();
      if (res.ok) {
        const employeeName =
          (json.employee?.first_name || "") +
          " " +
          (json.employee?.last_name || "");
        const timeStr = new Date(json.check_in_time).toLocaleTimeString(
          "en-US",
          { hour: "2-digit", minute: "2-digit", second: "2-digit" }
        );
        showStatus(
          "success",
          `QR Check-in Successful! Welcome, ${employeeName} at ${timeStr}`
        );
        setIsScanning(false);
        setQrPayload("");
      } else {
        showStatus("error", json?.message || "Invalid QR code or system error");
      }
    } catch (err) {
      showStatus("error", "QR check-in connection failed");
    } finally {
      setLoadingQr(false);
    }
  };

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    console.log(`Scan result: ${decodedText}`);
    // Stop scanning immediately to prevent spam
    setIsScanning(false);
    submitQr(decodedText);
  };

  const onScanFailure = (error: string) => {
    // Only log warning, don't spam toasts
    console.warn(`QR Scan Error: ${error}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Timekeeping
      </h1>

      {!isScanning ? (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Check-in Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* --- CARD 1: IP Check-in --- */}
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 group"
              onClick={handleIpCheckIn}
            >
              <CardContent className="p-8 text-center flex flex-col items-center h-full justify-center">
                <div className="p-4 bg-blue-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">IP Check-in</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Check-in using your current IP address
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={loadingIp}
                  size="lg"
                >
                  {loadingIp ? "Checking in..." : "Check-in"}
                </Button>
              </CardContent>
            </Card>

            {/* --- CARD 2: QR Check-in --- */}
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-green-400 group"
              onClick={() => setIsScanning(true)}
            >
              <CardContent className="p-8 text-center flex flex-col items-center h-full justify-center">
                <div className="p-4 bg-green-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <QrCode className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">QR Check-in</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Scan QR code to check-in
                </p>
                <Button className="w-full" variant="outline" size="lg">
                  Scan QR
                </Button>
              </CardContent>
            </Card>

            {/* --- CARD 3: Paste Code --- */}
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-400 group"
              onClick={() => {
                // Clipboard logic
                navigator.clipboard
                  .readText()
                  .then((text) => {
                    if (text) submitQr(text);
                    else showStatus("info", "Clipboard is empty");
                  })
                  .catch(() => showStatus("error", "Cannot read clipboard"));
              }}
            >
              <CardContent className="p-8 text-center flex flex-col items-center h-full justify-center">
                <div className="p-4 bg-purple-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Paste QR</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Paste QR code text as fallback
                </p>
                <Button className="w-full" variant="outline" size="lg">
                  Paste from Clipboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* --- SCANNING UI --- */
        <div className="mt-8 max-w-lg mx-auto animate-in zoom-in-95 duration-300">
          <div className="bg-white p-4 rounded-xl shadow-lg border">
            <h3 className="text-center font-semibold mb-4 text-lg">
              Scanning QR Code...
            </h3>

            <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
              <QrScannerDisplay
                onScanSuccess={onScanSuccess}
                onScanFailure={onScanFailure}
              />
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={() => setIsScanning(false)}
                variant="destructive"
                className="w-full"
              >
                Cancel Scan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
