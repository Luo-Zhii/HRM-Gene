"use client";
import React, { useState, useEffect, useRef } from "react";
import { useCompany } from "@/src/context/CompanyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, Camera, Save, X, Globe, Building2, Landmark, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CompanyProfilePage() {
  const { settings, refreshSettings, updateLogo } = useCompany();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    company_name: "",
    tax_id: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    base_currency: "USD",
    secondary_currency: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || "",
        tax_id: settings.tax_id || "",
        address: settings.address || "",
        city: settings.city || "",
        state: settings.state || "",
        zip: settings.zip || "",
        country: settings.country || "",
        base_currency: settings.base_currency || "USD",
        secondary_currency: settings.secondary_currency || "",
      });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiBase = "/api";
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/company-profile`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      if (res.ok) {
        await refreshSettings();
        toast({ title: "Success", description: "Company profile updated successfully." });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update company profile.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const apiBase = "/api";
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/company-profile/logo`, {
        method: "PATCH",
        body: uploadData,
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        updateLogo(data.logo_url);
        toast({ title: "Success", description: "Logo updated successfully." });
      } else {
        throw new Error("Logo upload failed");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload logo.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const logoUrl = settings?.logo_url 
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${settings.logo_url}`
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-inter">Company Profile</h1>
        <p className="text-gray-500 mt-1">Set up company profile details and branding.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              General Branding
            </CardTitle>
            <CardDescription>Update your company logo and name</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 px-8 flex flex-col md:flex-row gap-10 items-start">
            <div className="relative group">
              <div className="w-40 h-40 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-300 relative bg-white shadow-inner">
                {uploading ? (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mb-2"></div>
                    <div className="w-16 h-2 bg-gray-200 rounded"></div>
                  </div>
                ) : logoUrl ? (
                  <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    <span className="text-xs text-gray-400 font-medium">SVG, PNG, JPG</span>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute -bottom-2 -right-2 rounded-xl shadow-lg bg-white border-gray-200 hover:bg-gray-50 text-blue-600 h-10 w-10"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="w-5 h-5" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="grid gap-2">
                <Label htmlFor="company_name" className="text-sm font-semibold text-gray-700">Company Name</Label>
                <div className="relative">
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="e.g. Acme Corp"
                    className="pl-4 h-12 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tax_id" className="text-sm font-semibold text-gray-700">Tax ID / Business Number</Label>
                <Input
                  id="tax_id"
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleChange}
                  placeholder="e.g. 12-3456789"
                  className="h-12 rounded-xl border-gray-200 font-medium"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Address & Localization
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Street Address</Label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street and number, P.O. box"
                className="h-12 rounded-xl border-gray-200 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">City</Label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="h-12 rounded-xl border-gray-200 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">State / Province</Label>
              <Input
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="h-12 rounded-xl border-gray-200 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Zip / Postal Code</Label>
              <Input
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                className="h-12 rounded-xl border-gray-200 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Country / Region</Label>
              <Input
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="h-12 rounded-xl border-gray-200 font-medium"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-blue-600" />
              Currency Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-8 grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Base Currency</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  name="base_currency"
                  value={formData.base_currency}
                  onChange={handleChange}
                  placeholder="e.g. USD, VND, EUR"
                  className="pl-9 h-12 rounded-xl border-gray-200 font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Secondary Currency (Optional)</Label>
              <Input
                name="secondary_currency"
                value={formData.secondary_currency}
                onChange={handleChange}
                placeholder="e.g. VND"
                className="h-12 rounded-xl border-gray-200 font-medium"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 pt-4">
          <Button type="button" variant="outline" className="h-12 px-8 rounded-xl font-bold text-gray-600 hover:bg-gray-50 border-gray-200">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="h-12 px-10 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all">
            {loading ? "Saving..." : "Save Changes"}
            <Save className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
