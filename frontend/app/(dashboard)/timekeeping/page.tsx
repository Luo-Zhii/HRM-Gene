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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function TimekeepingPage() {
  const [loadingIp, setLoadingIp] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrPayload, setQrPayload] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const { toast } = useToast();

  // Thêm một ref để giữ instance của scanner
  const html5QrScannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Auto-dismiss status message after 4 seconds
  const showStatus = (type: "success" | "error" | "info", text: string) => {
    if (type === "success") {
      toast({
        title: "Success",
        description: text,
      });
    } else if (type === "error") {
      toast({
        title: "Error",
        description: text,
        variant: "destructive",
      });
    } else {
      toast({
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
        showStatus("success", json?.message || "QR check-in successful!");
        setQrModalOpen(false); // Tự động đóng modal khi thành công
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

  // <-- THÊM LOGIC MỚI TẠI ĐÂY -->
  // Hook này sẽ quản lý vòng đời của camera scanner
  useEffect(() => {
    // Chỉ chạy khi modal mở và không ở chế độ dự phòng
    if (qrModalOpen && !fallbackMode) {
      // Hàm callback khi quét thành công
      const onScanSuccess = (decodedText: string, decodedResult: any) => {
        console.log(`Scan result: ${decodedText}`);
        // Tắt scanner (nếu không nó sẽ quét liên tục)
        if (html5QrScannerRef.current) {
          html5QrScannerRef.current.clear().catch(console.error);
          html5QrScannerRef.current = null;
        }
        // Gửi kết quả
        submitQr(decodedText);
      };

      // Hàm callback khi quét lỗi (thường có thể bỏ qua)
      const onScanFailure = (error: string) => {
        // console.warn(`QR Scan Error: ${error}`);
      };

      // Chỉ khởi tạo nếu chưa có
      if (!html5QrScannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          "qr-scanner-region", // ID của div
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false // verbose
        );
        scanner.render(onScanSuccess, onScanFailure);
        html5QrScannerRef.current = scanner;
      }
    } else {
      // Nếu modal đóng (hoặc chuyển sang fallback), hãy dọn dẹp
      if (html5QrScannerRef.current) {
        html5QrScannerRef.current.clear().catch(console.error);
        html5QrScannerRef.current = null;
      }
    }

    // Hàm cleanup (chạy khi component unmount hoặc state thay đổi)
    return () => {
      if (html5QrScannerRef.current) {
        html5QrScannerRef.current.clear().catch(console.error);
        html5QrScannerRef.current = null;
      }
    };
  }, [qrModalOpen, fallbackMode]); // Phụ thuộc vào 2 state này

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

              {/* Div này là nơi camera sẽ được gắn vào */}
              <div id="qr-scanner-region" className="w-full"></div>

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
                <Button
                  onClick={() => setQrModalOpen(false)}
                  variant="outline"
                  disabled={loadingQr}
                >
                  Close
                </Button>
              </div>
            </>
          ) : (
            <>
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
