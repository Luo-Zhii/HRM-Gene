"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

interface CompanySetting {
  setting_id: number;
  key: string;
  value: string;
}

interface StatusMessage {
  type: "success" | "error" | "info";
  text: string;
}

export default function SystemSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<CompanySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null
  );
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Check authorization
  useEffect(() => {
    if (!authLoading && user) {
      const hasPermission = user.permissions?.includes("manage:system");
      if (!hasPermission) {
        setStatusMessage({
          type: "error",
          text: "You do not have permission to access this page.",
        });
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [authLoading, user, router]);

  // Load settings
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();
      setSettings(data || []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error loading settings";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.permissions?.includes("manage:system")) {
      loadSettings();
    }
  }, [user]);

  // Auto-dismiss status message
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Handle edit click
  const handleEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditingValue(value);
  };

  // Handle save
  const handleSave = async () => {
    if (!editingKey || editingValue === null) {
      setStatusMessage({ type: "error", text: "Invalid key or value" });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: editingKey, value: editingValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to save setting");
      }

      setStatusMessage({
        type: "success",
        text: `Setting ${editingKey} saved successfully!`,
      });

      setEditingKey(null);
      setEditingValue("");
      await loadSettings();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error saving setting";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditingKey(null);
    setEditingValue("");
  };

  // Render authorization check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user || !user.permissions?.includes("manage:system")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure application-wide settings
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mb-4 p-4 rounded-lg font-medium ${
              statusMessage.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : statusMessage.type === "error"
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-blue-100 text-blue-800 border border-blue-300"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading settings...</p>
          </div>
        ) : settings.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 font-medium">No settings found</p>
            <p className="text-gray-500 mt-2">
              Settings will appear here once they are created.
            </p>
          </div>
        ) : (
          // Settings List
          <div className="space-y-4">
            {settings.map((setting) => (
              <div
                key={setting.setting_id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {setting.key}
                    </h3>
                    {editingKey === setting.key ? (
                      <div className="mt-4 space-y-3">
                        <textarea
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="px-4 py-2 bg-gray-300 text-gray-900 rounded font-medium hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-2 text-gray-600 font-mono text-sm bg-gray-100 p-3 rounded break-all">
                          {setting.value || "(empty)"}
                        </p>
                        <button
                          onClick={() => handleEdit(setting.key, setting.value)}
                          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Count */}
        {!loading && settings.length > 0 && (
          <div className="mt-6 text-sm text-gray-600">
            Showing {settings.length} setting{settings.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
