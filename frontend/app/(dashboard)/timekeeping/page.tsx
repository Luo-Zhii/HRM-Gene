"use client";
import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/src/hooks/useAuth";
import { MapPin, QrCode, FileText, Sun, Moon, CheckCircle2 } from "lucide-react";
import type { TimekeepingResponse } from "@/src/types/timekeeping";

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

// --- Success Modal Component ---
const TimekeepingSuccessModal = ({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: TimekeepingResponse | null;
}) => {
  if (!data) return null;

  const isCheckIn = data.status === "CHECK_IN";
  const timeStr = new Date(data.time).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            {/* Icon with colored background */}
            <div
              className={`p-6 rounded-full ${
                isCheckIn
                  ? "bg-green-100 dark:bg-green-900/20"
                  : "bg-orange-100 dark:bg-orange-900/20"
              }`}
            >
              {isCheckIn ? (
                <Sun className="w-16 h-16 text-green-600 dark:text-green-400" />
              ) : (
                <Moon className="w-16 h-16 text-orange-600 dark:text-orange-400" />
              )}
            </div>

            {/* Title */}
            <DialogTitle className="text-2xl font-bold">
              {isCheckIn ? "Checked In!" : "Checked Out!"}
            </DialogTitle>

            {/* Message */}
            <DialogDescription className="text-base">
              {data.message}
            </DialogDescription>

            {/* Time Display */}
            <div className="w-full space-y-2 pt-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isCheckIn ? "Check-in Time" : "Check-out Time"}
                </span>
                <span className="text-lg font-semibold">{timeStr}</span>
              </div>

              {/* Duration (only for check-out) */}
              {!isCheckIn && data.duration !== undefined && (
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Total Work Duration
                  </span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {data.duration.toFixed(2)} hrs
                  </span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="w-full" size="lg">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Page ---
export default function TimekeepingPage() {
  const [loadingIp, setLoadingIp] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [qrPayload, setQrPayload] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<TimekeepingResponse | null>(
    null
  );
  const { toast } = useToast();
  const { refresh: refreshAuth } = useAuth();

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
      const json: TimekeepingResponse = await res.json();
      if (res.ok) {
        // Show success modal
        setSuccessData(json);
        setSuccessModalOpen(true);
        // Refresh auth context to update dashboard status
        await refreshAuth();
      } else {
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
      const json: TimekeepingResponse = await res.json();
      if (res.ok) {
        // Show success modal
        setSuccessData(json);
        setSuccessModalOpen(true);
        setIsScanning(false);
        setQrPayload("");
        // Refresh auth context to update dashboard status
        await refreshAuth();
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

  const handleModalClose = () => {
    setSuccessModalOpen(false);
    setSuccessData(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Success Modal */}
      <TimekeepingSuccessModal
        open={successModalOpen}
        onClose={handleModalClose}
        data={successData}
      />

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
