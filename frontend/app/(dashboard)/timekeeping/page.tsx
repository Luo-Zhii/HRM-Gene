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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  if (!data || !open) return null;

  const isCheckIn = data.status === "CHECK_IN";
  const timeStr = new Date(data.time).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className={`p-6 rounded-full ${isCheckIn ? "bg-green-100" : "bg-orange-100"}`}>
            {isCheckIn ? (
              <Sun className="w-16 h-16 text-green-600" />
            ) : (
              <Moon className="w-16 h-16 text-orange-600" />
            )}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isCheckIn ? t("timekeeping.checkedIn") : t("timekeeping.checkedOut")}
          </h2>

          <p className="text-base text-gray-600 dark:text-gray-300">
            {data.message}
          </p>

          <div className="w-full space-y-3 pt-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isCheckIn ? t("timekeeping.checkInTime") : t("timekeeping.checkOutTime")}
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {timeStr}
              </span>
            </div>

            {!isCheckIn && data.duration !== undefined && (
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                <span className="text-sm font-bold text-orange-700">
                  {t("timekeeping.totalWorkDuration")}
                </span>
                <span className="text-xl font-black text-orange-600">
                  {data.duration.toFixed(2)} hrs
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-md font-bold transition-colors shadow-md"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {t("timekeeping.awesomeClose")}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---
export default function TimekeepingPage() {
  const [loadingIp, setLoadingIp] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [qrPayload, setQrPayload] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<TimekeepingResponse | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const { toast } = useToast();
  const { refresh: refreshAuth } = useAuth();
  const { t } = useTranslation();

  const showStatus = (
    type: "success" | "error" | "info" | "warning",
    text: string
  ) => {
    if (type === "success") {
      toast({
        variant: "success",
        title: t("common.success"),
        description: text,
      });
    } else if (type === "error") {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: text,
      });
    } else if (type === "warning") {
      toast({
        variant: "warning",
        title: t("common.warning"),
        description: text,
      });
    } else {
      toast({
        variant: "info",
        title: t("common.info"),
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
        setSuccessData(json);
        setSuccessModalOpen(true);
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
    if (isProcessing || successModalOpen) return;

    const p = payload ?? qrPayload;
    if (!p) {
      showStatus("error", "No QR payload available");
      return;
    }

    setIsProcessing(true);
    setLoadingQr(true);

    try {
      const res = await fetch("/api/timekeeping/check-in/qr", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: p }),
      });

      const json: TimekeepingResponse = await res.json();

      if (res.ok) {
        setSuccessData(json);
        setSuccessModalOpen(true);
        setIsScanning(false);
        setQrPayload("");
        await refreshAuth();
      } else {
        showStatus("error", json?.message || "Invalid QR code or system error");
      }
    } catch (err) {
      showStatus("error", "QR check-in connection failed");
    } finally {
      setTimeout(() => {
        setLoadingQr(false);
        setIsProcessing(false);
      }, 1500);
    }
  };

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    if (isProcessing || successModalOpen) return;
    console.log(`Scan result: ${decodedText}`);
    setIsScanning(false);
    submitQr(decodedText);
  };

  const onScanFailure = (error: string) => {
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
        {t("timekeeping.title")}
      </h1>

      {!isScanning ? (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
            {t("timekeeping.checkInOptions")}
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
                <h3 className="font-bold text-lg mb-2">{t("timekeeping.ipCheckIn")}</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {t("timekeeping.ipCheckInDesc")}
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={loadingIp}
                  size="lg"
                >
                  {loadingIp ? t("timekeeping.checkingIn") : t("timekeeping.checkIn")}
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
                <h3 className="font-bold text-lg mb-2">{t("timekeeping.qrCheckIn")}</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {t("timekeeping.qrCheckInDesc")}
                </p>
                <Button className="w-full" variant="outline" size="lg">
                  {t("timekeeping.scanQr")}
                </Button>
              </CardContent>
            </Card>

            {/* --- CARD 3: Paste Code --- */}
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-400 group"
              onClick={() => {
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
                <h3 className="font-bold text-lg mb-2">{t("timekeeping.pasteQr")}</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {t("timekeeping.pasteQrDesc")}
                </p>
                <Button className="w-full" variant="outline" size="lg">
                  {t("timekeeping.pasteFromClipboard")}
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
              {t("timekeeping.scanningQr")}
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
                {t("timekeeping.cancelScan")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
