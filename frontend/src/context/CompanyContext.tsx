"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CompanySettings {
  id: number;
  company_name: string;
  logo_url?: string;
  tax_id?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  base_currency: string;
  secondary_currency?: string;
}

interface CompanyContextType {
  settings: CompanySettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateLogo: (url: string) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiBase}/company-profile`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch company settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:3001';
    const fullLogoUrl = settings?.logo_url ? `${backendBaseUrl}${settings.logo_url}` : '/favicon.ico';
    
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = fullLogoUrl;
  }, [settings?.logo_url]);

  const updateLogo = (url: string) => {
    setSettings((prev) => (prev ? { ...prev, logo_url: url } : null));
  };

  return (
    <CompanyContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, updateLogo }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};
