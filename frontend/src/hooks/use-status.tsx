"use client";
import { useToast } from "@/hooks/use-toast";

// QUAN TRỌNG: Phải đổi thành Custom Hook (bắt đầu bằng 'use')
// Để có thể gọi useToast() bên trong nó.
export function useShowStatus() {
  const { toast } = useToast();

  const showStatus = (
    type: "success" | "error" | "info" | "warning",
    text: string
  ) => {
    if (type === "success") {
      toast({
        variant: "default", // Hoặc "success" nếu bạn đã config trong ui/toast
        className: "bg-green-600 text-white border-green-700", // Tailwind style cứng nếu chưa có variant
        title: "Success",
        description: text,
      });
    } else if (type === "error") {
      toast({
        variant: "destructive",
        title: "Error",
        description: text,
      });
    } else if (type === "warning") {
      toast({
        variant: "default",
        className: "bg-yellow-500 text-black border-yellow-600",
        title: "Warning",
        description: text,
      });
    } else {
      toast({
        variant: "default", // Info
        className: "bg-blue-500 text-white border-blue-600",
        title: "Info",
        description: text,
      });
    }
  };

  return showStatus;
}
