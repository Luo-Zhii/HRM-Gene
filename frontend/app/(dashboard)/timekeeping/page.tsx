"use client";
import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast"; // Đảm bảo bạn có hook này

// --- TẠO COMPONENT CON ĐỂ SỬA LỖI RACE CONDITION ---
// Component này sẽ tự quản lý camera
const QrScannerDisplay = ({
  onScanSuccess,
  onScanFailure,
}: {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure: (error: string) => void;
}) => {
  // useEffect này chỉ chạy MỘT LẦN khi component được mount (hiển thị)
  useEffect(() => {
    // ID của div mà scanner sẽ gắn vào
    const scannerRegionId = "qr-scanner-region";

    // Khởi tạo scanner
    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerRegionId,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false // verbose
    );

    // Bắt đầu render camera
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    // Hàm dọn dẹp: Sẽ chạy khi component bị unmount (modal đóng)
    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear scanner.", error);
      });
    };
  }, [onScanSuccess, onScanFailure]); // Chỉ chạy 1 lần

  // Trả về cái div mà scanner cần
  return <div id="qr-scanner-region" className="w-full"></div>;
};
// --- KẾT THÚC COMPONENT CON ---

export default function TimekeepingPage() {
  const [loadingIp, setLoadingIp] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrPayload, setQrPayload] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const { toast } = useToast();

  // XÓA: html5QrScannerRef (Không cần nữa)
  // XÓA: useEffect (Vì đã chuyển vào component con)

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
    // ... (Giữ nguyên logic handleIpCheckIn của bạn)
    setLoadingIp(true);
    try {
      const res = await fetch("/api/timekeeping/check-in/ip", {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok) {
        showStatus("success", json?.message || "IP check-in successful!");
      } else {
        showStatus("error", json?.message || "IP check-in failed");
      }
    } catch (err) {
      showStatus("error", "IP check-in failed");
    } finally {
      setLoadingIp(false);
    }
  };

  const submitQr = async (payload?: string) => {
    // ... (Giữ nguyên logic submitQr của bạn)
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
        setQrModalOpen(false); // Tự động đóng modal
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

  const attemptOpenScanner = async () => {
    // ... (Giữ nguyên logic attemptOpenScanner của bạn)
    setCameraError(null);
    setFallbackMode(false);
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setCameraError("Camera not supported in this browser");
      setFallbackMode(true);
      setQrModalOpen(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      stream.getTracks().forEach((t) => t.stop());
      setFallbackMode(false);
      setCameraError(null);
      setQrModalOpen(true);
    } catch (err: any) {
      setCameraError(err?.message || "Camera access denied or unavailable");
      setFallbackMode(true);
      setQrModalOpen(true);
    }
  };

  // --- TẠO CÁC HÀM CALLBACK CHO COMPONENT CON ---
  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    console.log(`Scan result: ${decodedText}`);
    submitQr(decodedText);
    setQrModalOpen(false); // Tự động đóng modal khi quét thành công
  };

  const onScanFailure = (error: string) => {
    // Thường có thể bỏ qua, vì nó báo lỗi liên tục khi không tìm thấy QR
    // console.warn(`QR Scan Error: ${error}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Timekeeping</h1>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Check-in Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-x-3">
            <Button onClick={handleIpCheckIn} disabled={loadingIp}>
              {loadingIp ? "Checking in..." : "Check-in (IP)"}
            </Button>

            <Button onClick={attemptOpenScanner} variant="secondary">
              Check-in (QR)
            </Button>

            <Button
              onClick={() => {
                setFallbackMode(true);
                setCameraError(null);
                setQrModalOpen(true);
              }}
              variant="outline"
            >
              Paste QR (fallback)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Check-in</DialogTitle>
          </DialogHeader>
          {cameraError && (
            <div className="mb-3 text-sm text-red-600">
              Camera error: {cameraError}
            </div>
          )}

          {!fallbackMode ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Point your camera at the QR code.
              </p>

              {/* --- THAY ĐỔI LỚN Ở ĐÂY --- */}
              {/* Dùng component con để render camera */}
              <QrScannerDisplay
                onScanSuccess={onScanSuccess}
                onScanFailure={onScanFailure}
              />

              <div className="flex justify-between gap-2 mt-4">
                <Button
                  onClick={() => {
                    setFallbackMode(true);
                    setCameraError(null);
                  }}
                  variant="outline"
                >
                  Use paste fallback
                </Button>
                {/* Nút Close không cần thiết vì onOpenChange đã xử lý */}
              </div>
            </>
          ) : (
            <>
              {/* ... (Giữ nguyên code fallback của bạn) ... */}
              <p className="text-sm text-gray-600 mb-4">
                Camera unavailable — paste the QR token below as a fallback.
              </p>
              <textarea
                value={qrPayload}
                onChange={(e) => setQrPayload(e.target.value)}
                className="w-full border rounded p-2 mb-4"
                rows={4}
              />
              <div className="flex justify-between gap-2">
                <Button
                  onClick={() => {
                    attemptOpenScanner(); // Thử lại camera
                  }}
                  variant="outline"
                >
                  Try camera again
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setQrModalOpen(false)}
                    variant="outline"
                    disabled={loadingQr}
                  >
                    Close
                  </Button>
                  <Button onClick={() => submitQr()} disabled={loadingQr}>
                    {loadingQr ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
