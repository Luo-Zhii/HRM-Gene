"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { useAuthContext } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";

export default function QrDisplayPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [qrToken, setQrToken] = useState<string>("");

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
    const fetchQr = async () => {
      try {
        const response = await fetch("/api/timekeeping/dynamic-qr", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Include auth headers if needed
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

    if (user) {
      // Fetch immediately
      fetchQr();

      // Set up interval to fetch every 3 seconds
      const interval = setInterval(fetchQr, 10000);

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const hasPermission =
    user.permissions?.includes("manage:system") ||
    user.permissions?.includes("manage:timekeeping");
  if (!hasPermission) {
    return <div>Access denied</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-8">Dynamic QR Code for Check-In</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg">
        {qrToken ? (
          <QRCode value={qrToken} size={256} />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
            <span className="text-gray-500">Loading QR...</span>
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Scan this QR code to check in
      </p>
    </div>
  );
}
