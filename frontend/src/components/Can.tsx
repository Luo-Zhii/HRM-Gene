import React from "react";
import { useCheckPermission } from "@/hooks/useCheckPermission";

interface CanProps {
  method: string;
  apiPath: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ method, apiPath, children, fallback = null }) => {
  const { checkPermission } = useCheckPermission();

  if (checkPermission(method, apiPath)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
