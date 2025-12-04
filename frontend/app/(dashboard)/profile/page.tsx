"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Edit2, Save, X } from "lucide-react";

interface StatusMessage {
  type: "success" | "error" | "info";
  text: string;
}

interface ProfileData {
  employee_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  avatar_url?: string;
  position?: {
    position_id: number;
    position_name: string;
  };
  department?: {
    department_id: number;
    department_name: string;
  };
  permissions?: string[];
  bank_info?: {
    bank_name?: string;
    account_number?: string;
    account_holder_name?: string;
  };
  tax_code?: string;
  contract?: {
    contract_id: number;
    contract_type: string;
    start_date: string;
    end_date?: string;
    base_salary?: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null
  );
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Form state for editable fields
  const [formData, setFormData] = useState({
    phone_number: "",
    address: "",
  });

  // Check authorization
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      }
    }
  }, [authLoading, user, router]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.employee_id) return;

      try {
        setLoading(true);
        const response = await fetch("/api/auth/profile", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          setFormData({
            phone_number: data.phone_number || "",
            address: data.address || "",
          });
        } else {
          throw new Error("Failed to load profile");
        }
      } catch (error) {
        setStatusMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Error loading profile",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadProfile();
    }
  }, [authLoading, user]);

  // Auto-dismiss status message
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save contact information
  const handleSaveContact = async () => {
    setIsSavingContact(true);
    try {
      const response = await fetch("/api/auth/profile/update", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: formData.phone_number,
          address: formData.address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedData = await response.json();
      setProfileData(updatedData);
      setStatusMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
      setIsEditingContact(false);
    } catch (error) {
      setStatusMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Error updating profile",
      });
    } finally {
      setIsSavingContact(false);
    }
  };

  // Permission checks
  const canViewFinancial = (): boolean => {
    if (!profileData?.permissions) return false;
    return (
      profileData.permissions.includes("manage:payroll") ||
      profileData.permissions.includes("manage:system")
    );
  };

  const canViewContract = (): boolean => {
    if (!profileData?.permissions) return false;
    return (
      profileData.permissions.includes("manage:leave") ||
      profileData.permissions.includes("manage:system")
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your personal and professional information
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-4 rounded-lg font-medium ${
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

        {/* Profile Header Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                {profileData.avatar_url ? (
                  <img
                    src={profileData.avatar_url}
                    alt={profileData.first_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={40} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {profileData.first_name} {profileData.last_name}
                </h2>
                <p className="text-gray-600 mb-4">{profileData.email}</p>

                <div className="flex flex-wrap gap-2">
                  {profileData.position?.position_name && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {profileData.position.position_name}
                    </span>
                  )}
                  {profileData.department?.department_name && (
                    <span className="px-3 py-1 bg-gray-200 text-gray-800 text-sm font-medium rounded-full">
                      {profileData.department.department_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Information Section - Visible to All */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>General Information</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Your basic personal information
              </p>
            </div>
            {!isEditingContact && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingContact(true)}
                className="gap-2"
              >
                <Edit2 size={16} />
                Edit
              </Button>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Read-only fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Email
                </Label>
                <p className="mt-2 text-gray-900">{profileData.email}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Full Name
                </Label>
                <p className="mt-2 text-gray-900">
                  {profileData.first_name} {profileData.last_name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Position
                </Label>
                <p className="mt-2 text-gray-900">
                  {profileData.position?.position_name || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Department
                </Label>
                <p className="mt-2 text-gray-900">
                  {profileData.department?.department_name || "N/A"}
                </p>
              </div>
            </div>

            {/* Editable fields */}
            {isEditingContact && (
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
                <h4 className="font-semibold text-gray-900">Edit Contact Info</h4>

                <div>
                  <Label htmlFor="phone_number" className="text-sm">
                    Phone Number
                  </Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveContact}
                    disabled={isSavingContact}
                    className="gap-2"
                  >
                    <Save size={16} />
                    {isSavingContact ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingContact(false)}
                    disabled={isSavingContact}
                    className="gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Display current values when not editing */}
            {!isEditingContact && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Phone Number
                  </Label>
                  <p className="mt-2 text-gray-900">
                    {formData.phone_number || "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Address
                  </Label>
                  <p className="mt-2 text-gray-900">
                    {formData.address || "Not provided"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Information Section - Accountant/Admin Only */}
        {canViewFinancial() && profileData.bank_info && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900">
                Financial Information
              </CardTitle>
              <p className="text-sm text-amber-700 mt-1">
                Confidential - Visible to HR and Accounting staff
              </p>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Bank Name
                  </Label>
                  <p className="mt-2 text-gray-900">
                    {profileData.bank_info?.bank_name || "N/A"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Account Holder Name
                  </Label>
                  <p className="mt-2 text-gray-900">
                    {profileData.bank_info?.account_holder_name || "N/A"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Account Number
                  </Label>
                  <p className="mt-2 text-gray-900 font-mono">
                    {profileData.bank_info?.account_number
                      ? `••••${profileData.bank_info.account_number.slice(-4)}`
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Tax Code
                  </Label>
                  <p className="mt-2 text-gray-900">
                    {profileData.tax_code || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-amber-100 border border-amber-300 rounded-lg">
                <p className="text-sm text-amber-700">
                  To update your financial information, please contact the HR
                  department.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contract Information Section - HR/Admin Only */}
        {canViewContract() && profileData.contract && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">Labor Contract</CardTitle>
              <p className="text-sm text-green-700 mt-1">
                Contract details and employment terms
              </p>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Contract Type
                  </Label>
                  <p className="mt-2 text-gray-900">
                    {profileData.contract?.contract_type || "N/A"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Start Date
                  </Label>
                  <p className="mt-2 text-gray-900">
                    {profileData.contract?.start_date
                      ? new Date(
                          profileData.contract.start_date
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    End Date
                  </Label>
                  <p className="mt-2 text-gray-900">
                    {profileData.contract?.end_date
                      ? new Date(
                          profileData.contract.end_date
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Open-ended"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Base Salary
                  </Label>
                  <p className="mt-2 text-gray-900 font-mono">
                    {profileData.contract?.base_salary
                      ? `$${parseFloat(
                          profileData.contract.base_salary
                        ).toLocaleString()}`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm text-green-700">
                  For changes to your contract, please submit a request through
                  HR.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}