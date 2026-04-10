"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { useAuthContext } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function QrDisplayPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const { t } = useTranslation();
  const [qrToken, setQrToken] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(30); // State lưu số giây

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }
      const hasPermission =
        user.permissions?.includes("manage:system") ||
        user.permissions?.includes("manage:timekeeping");
      if (!hasPermission) {
        router.push("/dashboard");
        return;
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchQr = async () => {
      try {
        const response = await fetch("/api/timekeeping/dynamic-qr", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setQrToken(data.token);
        }
      } catch (error) {
        console.error("Failed to fetch QR token:", error);
      }
    };

    // Lần đầu tiên vào trang thì gọi luôn
    fetchQr();

    // Setup interval chạy mỗi 1 giây (1000ms) để đếm ngược
    const timerInterval = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          fetchQr(); // Gọi lại API khi hết giờ
          return 30; // Reset lại bộ đếm về 30 giây
        }
        return prevCount - 1; // Trừ đi 1 giây
      });
    }, 1000);

    // Cleanup khi rời khỏi trang
    return () => clearInterval(timerInterval);
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-medium text-gray-600">{t("qrDisplay.loading")}</div>;
  }

  if (!user) return null;

  const hasPermission =
    user.permissions?.includes("manage:system") ||
    user.permissions?.includes("manage:timekeeping");
  if (!hasPermission) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{t("qrDisplay.accessDenied")}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
      <h1 className="text-3xl font-bold mb-2 text-slate-800">{t("qrDisplay.title")}</h1>
      <p className="mb-8 text-slate-500">{t("qrDisplay.subtitle")}</p>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
        {qrToken ? (
          <div className="p-4 bg-white border-4 border-blue-50 rounded-xl">
            <QRCode value={qrToken} size={280} level="H" />
          </div>
        ) : (
          <div className="w-[312px] h-[312px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-slate-50">
            <span className="text-slate-400 font-medium animate-pulse">{t("qrDisplay.generating")}</span>
          </div>
        )}

        {/* --- KHU VỰC BỘ ĐẾM GIÂY --- */}
        <div className={`mt-8 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors ${countdown <= 5 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
          <RefreshCcw size={16} className={`${countdown <= 5 ? 'animate-spin' : ''}`} />
          <span>{t("qrDisplay.refreshesIn", { seconds: countdown })}</span>
        </div>
      </div>
    </div>
  );
}