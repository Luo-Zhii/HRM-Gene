"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  User,
  Edit2,
  Save,
  X,
  Briefcase,
  DollarSign,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
}

interface Contract {
  contract_id: number;
  contract_number: string;
  contract_type: string;
  start_date: string;
  end_date?: string;
  status: string;
  salary_rate: string;
  file_url?: string;
  employee?: {
    employee_id: number;
  };
}

interface Violation {
  violation_id: number;
  date: string;
  violation_type: string;
  description: string;
  penalty_amount: string;
  status: string;
  employee?: {
    employee_id: number;
  };
}

interface SalaryHistory {
  history_id: number;
  old_salary: string;
  new_salary: string;
  change_date: string;
  reason?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [activeTab, setActiveTab] = useState("job-info");

  // Form state for editable fields
  const [formData, setFormData] = useState({
    phone_number: "",
    address: "",
  });

  // Determine if viewing own profile or someone else's
  const viewingOwnProfile = !employeeId || parseInt(employeeId) === user?.employee_id;
  const targetEmployeeId = employeeId ? parseInt(employeeId) : user?.employee_id;

  // Check if user has HR/Admin permissions
  const isHRorAdmin =
    user?.permissions?.includes("manage:employees") ||
    user?.permissions?.includes("manage:system") ||
    user?.permissions?.includes("manage:payroll");

  // Check if can view salary (own profile or HR/Admin)
  const canViewSalary = viewingOwnProfile || isHRorAdmin;

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.employee_id && !employeeId) return;

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
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadProfile();
    }
  }, [authLoading, user, employeeId, toast]);

  // Load contracts
  useEffect(() => {
    const loadContracts = async () => {
      if (!targetEmployeeId) return;

      try {
        const url = employeeId
          ? `/api/contracts?employeeId=${employeeId}`
          : "/api/contracts";
        const response = await fetch(url, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          // If viewing another employee, filter by employeeId on frontend
          const filtered = employeeId
            ? data.filter(
                (c: Contract) => c.employee?.employee_id === parseInt(employeeId)
              )
            : data;
          setContracts(filtered || []);
        }
      } catch (error) {
        console.error("Failed to load contracts:", error);
      }
    };

    if (user) {
      loadContracts();
    }
  }, [user, targetEmployeeId, employeeId]);

  // Load violations
  useEffect(() => {
    const loadViolations = async () => {
      if (!targetEmployeeId) return;

      try {
        const url = employeeId
          ? `/api/violations?employeeId=${employeeId}`
          : "/api/violations";
        const response = await fetch(url, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          // If viewing another employee, filter by employeeId on frontend
          const filtered = employeeId
            ? data.filter(
                (v: Violation) => v.employee?.employee_id === parseInt(employeeId)
              )
            : data;
          setViolations(filtered || []);
        }
      } catch (error) {
        console.error("Failed to load violations:", error);
      }
    };

    if (user) {
      loadViolations();
    }
  }, [user, targetEmployeeId, employeeId]);

  // Load salary history
  useEffect(() => {
    const loadSalaryHistory = async () => {
      if (!targetEmployeeId || !canViewSalary) return;

      try {
        const response = await fetch(
          `/api/salary-history${employeeId ? `?employeeId=${employeeId}` : ""}`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSalaryHistory(data || []);
        }
      } catch (error) {
        console.error("Failed to load salary history:", error);
      }
    };

    if (user && canViewSalary) {
      loadSalaryHistory();
    }
  }, [user, targetEmployeeId, employeeId, canViewSalary]);

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
      toast({
        variant: "default",
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsEditingContact(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error updating profile",
      });
    } finally {
      setIsSavingContact(false);
    }
  };

  // Format currency
  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Prepare salary chart data
  const salaryChartData = salaryHistory
    .map((item) => ({
      date: formatDate(item.change_date),
      salary: parseFloat(item.new_salary),
      reason: item.reason || "Salary change",
    }))
    .reverse(); // Show oldest to newest

  // Get current active contract
  const activeContract = contracts.find(
    (c) => c.status === "Active" && (!c.end_date || new Date(c.end_date) > new Date())
  );

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {viewingOwnProfile ? "My Profile" : "Employee Profile"}
          </h1>
          <p className="text-gray-600 mt-2">
            {viewingOwnProfile
              ? "Manage your personal and professional information"
              : `${profileData.first_name} ${profileData.last_name}'s profile`}
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                {profileData.avatar_url ? (
                  <img
                    src={profileData.avatar_url}
                    alt={profileData.first_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={32} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profileData.first_name} {profileData.last_name}
                </h2>
                <p className="text-gray-600 mb-4">{profileData.email}</p>

                <div className="flex flex-wrap gap-2">
                  {profileData.position?.position_name && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {profileData.position.position_name}
                    </Badge>
                  )}
                  {profileData.department?.department_name && (
                    <Badge variant="secondary" className="bg-gray-200 text-gray-800">
                      {profileData.department.department_name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Layout */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <Card>
                <CardContent className="p-2">
                  <TabsList className="flex flex-col h-auto w-full bg-transparent">
                    <TabsTrigger
                      value="job-info"
                      className="w-full justify-start data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Job Info
                    </TabsTrigger>
                    {canViewSalary && (
                      <TabsTrigger
                        value="salary"
                        className="w-full justify-start data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Salary & Benefits
                      </TabsTrigger>
                    )}
                    <TabsTrigger
                      value="contracts"
                      className="w-full justify-start data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Labor Contracts
                    </TabsTrigger>
                    <TabsTrigger
                      value="violations"
                      className="w-full justify-start data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Violations
                    </TabsTrigger>
                  </TabsList>
                </CardContent>
              </Card>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
              {/* Job Info Tab */}
              <TabsContent value="job-info" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle>General Information</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Your basic personal information
                      </p>
                    </div>
                    {viewingOwnProfile && !isEditingContact && (
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
                    {isEditingContact && viewingOwnProfile && (
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
                        <h4 className="font-semibold text-gray-900">
                          Edit Contact Info
                        </h4>

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
              </TabsContent>

              {/* Salary & Benefits Tab */}
              {canViewSalary && (
                <TabsContent value="salary" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Salary History</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Track salary progression over time
                      </p>
                    </CardHeader>
                    <CardContent>
                      {salaryHistory.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No salary history available</p>
                        </div>
                      ) : (
                        <div className="w-full h-96">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salaryChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) =>
                                  `$${value.toLocaleString()}`
                                }
                              />
                              <Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                labelFormatter={(label) => `Date: ${label}`}
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="salary"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name="Salary"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Salary History Table */}
                  {salaryHistory.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Salary Change Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Old Salary</TableHead>
                              <TableHead className="text-right">New Salary</TableHead>
                              <TableHead>Change</TableHead>
                              <TableHead>Reason</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {salaryHistory
                              .slice()
                              .reverse()
                              .map((item) => {
                                const oldSalary = parseFloat(item.old_salary);
                                const newSalary = parseFloat(item.new_salary);
                                const change = newSalary - oldSalary;
                                const changePercent =
                                  ((change / oldSalary) * 100).toFixed(1);

                                return (
                                  <TableRow key={item.history_id}>
                                    <TableCell>{formatDate(item.change_date)}</TableCell>
                                    <TableCell className="text-right">
                                      {formatCurrency(item.old_salary)}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      {formatCurrency(item.new_salary)}
                                    </TableCell>
                                    <TableCell
                                      className={
                                        change >= 0
                                          ? "text-green-600 font-semibold"
                                          : "text-red-600 font-semibold"
                                      }
                                    >
                                      {change >= 0 ? "+" : ""}
                                      {formatCurrency(change)} ({changePercent}%)
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                      {item.reason || "N/A"}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              )}

              {/* Labor Contracts Tab */}
              <TabsContent value="contracts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Labor Contracts</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Contract history and details
                    </p>
                  </CardHeader>
                  <CardContent>
                    {contracts.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No contracts found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeContract && (
                          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Badge className="bg-green-600 mb-2">
                                  Current Active Contract
                                </Badge>
                                <p className="font-semibold text-lg">
                                  Contract #{activeContract.contract_number}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {activeContract.contract_type} •{" "}
                                  {formatDate(activeContract.start_date)} -{" "}
                                  {activeContract.end_date
                                    ? formatDate(activeContract.end_date)
                                    : "Open-ended"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Salary Rate</p>
                                <p className="font-bold text-lg text-green-700">
                                  {formatCurrency(activeContract.salary_rate)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Contract No.</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Start Date</TableHead>
                              <TableHead>End Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Salary Rate</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contracts.map((contract) => (
                              <TableRow
                                key={contract.contract_id}
                                className={
                                  contract.contract_id === activeContract?.contract_id
                                    ? "bg-green-50"
                                    : ""
                                }
                              >
                                <TableCell className="font-medium">
                                  {contract.contract_number}
                                </TableCell>
                                <TableCell>{contract.contract_type}</TableCell>
                                <TableCell>{formatDate(contract.start_date)}</TableCell>
                                <TableCell>
                                  {contract.end_date
                                    ? formatDate(contract.end_date)
                                    : "Open-ended"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      contract.status === "Active"
                                        ? "default"
                                        : contract.status === "Expired"
                                        ? "outline"
                                        : "destructive"
                                    }
                                  >
                                    {contract.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(contract.salary_rate)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Violations Tab */}
              <TabsContent value="violations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Violations & Discipline</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Disciplinary records and violations
                    </p>
                  </CardHeader>
                  <CardContent>
                    {violations.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No violations recorded</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Penalty</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {violations.map((violation) => (
                            <TableRow key={violation.violation_id}>
                              <TableCell>{formatDate(violation.date)}</TableCell>
                              <TableCell className="font-medium">
                                {violation.violation_type}
                              </TableCell>
                              <TableCell className="max-w-md">
                                <p className="text-sm text-gray-700 truncate">
                                  {violation.description}
                                </p>
                              </TableCell>
                              <TableCell className="text-right text-red-600 font-semibold">
                                {formatCurrency(violation.penalty_amount)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    violation.status === "Resolved"
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {violation.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
