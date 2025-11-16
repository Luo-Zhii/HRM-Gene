"use client";
import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Component con (QrScannerDisplay) - Giữ nguyên
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

export default function TimekeepingPage() {
  const [loadingIp, setLoadingIp] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [qrPayload, setQrPayload] = useState("");
  const { toast } = useToast();

  const showStatus = (type: "success" | "error" | "info", text: string) => {
    if (type === "success") {
      toast({ title: "Success", description: text });
    } else if (type === "error") {
      toast({ title: "Error", description: text, variant: "destructive" });
    } else {
      toast({ title: "Info", description: text });
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
      showStatus("error", "IP check-in failed");
    } finally {
      setLoadingIp(false);
    }
  };

  const submitQr = async (payload?: string) => {
    // (Logic này đã đúng, giữ nguyên)
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
          json.employee?.first_name + " " + json.employee?.last_name;
        const timeStr = new Date(json.check_in_time).toLocaleTimeString(
          "en-US",
          { hour: "2-digit", minute: "2-digit", second: "2-digit" }
        );
        showStatus(
          "success",
          `Check-in Successful! Welcome, ${employeeName} at ${timeStr}`
        );
        setIsScanning(false);
        setQrPayload("");
      } else {
        showStatus("error", json?.message || "QR check-in failed");
      }
    } catch (err) {
      showStatus("error", "QR check-in failed");
    } finally {
      setLoadingQr(false);
    }
  };

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    console.log(`Scan result: ${decodedText}`);
    submitQr(decodedText);
  };

  const onScanFailure = (error: string) => {
    console.warn(`QR Scan Error: ${error}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Timekeeping</h1>

      {!isScanning ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Check-in Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-x-3">
              <Button onClick={handleIpCheckIn} disabled={loadingIp}>
                {loadingIp ? "Checking in..." : "Check-in (IP)"}
              </Button>

              <Button onClick={() => setIsScanning(true)} variant="secondary">
                Check-in (QR)
              </Button>

              <Button
                onClick={() => {
                  setIsScanning(true);
                  // For paste fallback, we can set a flag or handle differently
                }}
                variant="outline"
              >
                Paste QR (fallback)
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-4">
            Point your camera at the QR code.
          </p>

          <QrScannerDisplay
            onScanSuccess={onScanSuccess}
            onScanFailure={onScanFailure}
          />

          <div className="flex justify-between gap-2 mt-4">
            <Button onClick={() => setIsScanning(false)} variant="outline">
              Cancel Scan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
