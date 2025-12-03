"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

/* CẢI THIỆN 1: VIEWPORT (Vị trí hiển thị)
  - Tăng z-index lên [9999] để đảm bảo Toast luôn nằm trên cùng, không bị Header che.
  - Điều chỉnh padding và vị trí để Toast "nổi" đẹp hơn trên giao diện.
*/
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 right-0 z-[9999] flex max-h-screen  flex-col-reverse mt-8 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

/* CẢI THIỆN 2: VARIANTS (Màu sắc theo trạng thái)
  - Thêm 'success': Màu xanh lá (quan trọng cho app chấm công).
  - Thêm 'warning': Màu vàng cam.
  - Thêm 'info': Màu xanh dương.
  - Tăng padding và bo góc để nhìn hiện đại hơn.
*/
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-6 shadow-lg transition-all ...", // (Giữ nguyên dòng dài này)
  {
    variants: {
      variant: {
        default: "default border bg-background text-foreground", // Thêm chữ 'default' (nếu thích)
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground", // Cái này có sẵn chữ 'destructive' rồi nên nút X màu đỏ đã chạy ngon.

        // --- SỬA CÁC DÒNG DƯỚI ĐÂY ---
        // Thêm chữ "success" vào đầu chuỗi
        success:
          "success border-green-200 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100 dark:border-green-900",

        // Thêm chữ "warning" vào đầu chuỗi
        warning:
          "warning border-yellow-200 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100 dark:border-yellow-900",

        // Thêm chữ "info" vào đầu chuỗi
        info: "info border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100 dark:border-blue-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

// ... (Các phần trên giữ nguyên)

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      // --- CÁC CLASS CƠ BẢN ---
      "absolute right-0 top-0 rounded-md p-1 opacity-50 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1",

      // --- MÀU SẮC MẶC ĐỊNH ---
      "text-foreground/50 hover:text-foreground",

      // --- MÀU SẮC THEO TỪNG LOẠI (VARIANTS) ---
      // 1. Destructive (Lỗi - Đỏ)
      "group-[.destructive]:text-red-500 group-[.destructive]:hover:text-red-700 group-[.destructive]:focus:ring-red-400",

      // 2. Success (Thành công - Xanh lá) - Đã thêm dòng này
      "group-[.success]:text-green-600 group-[.success]:hover:text-green-800",

      // 3. Warning (Cảnh báo - Vàng) - Đã thêm dòng này
      "group-[.warning]:text-yellow-600 group-[.warning]:hover:text-yellow-800",

      // 4. Info (Thông tin - Xanh dương) - Đã thêm dòng này
      "group-[.info]:text-blue-600 group-[.info]:hover:text-blue-800",

      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

// ... (Các phần dưới giữ nguyên)

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
