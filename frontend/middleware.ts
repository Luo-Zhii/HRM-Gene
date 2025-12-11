import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Các đường dẫn mà middleware sẽ chạy
export const config = {
  matcher: [
    /*
     * Khớp với tất cả các đường dẫn, NGOẠI TRỪ:
     * - /api (đường dẫn API)
     * - /_next/static (file tĩnh)
     * - /_next/image (tối ưu hóa ảnh)
     * - /favicon.ico (icon)
     * Việc này đảm bảo nó chạy trên CẢ /login VÀ /dashboard
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  // Lấy đường dẫn mà user đang cố truy cập
  const isPublicPath = pathname === "/login" || pathname === "/admin-register"; // (Bạn có thể thêm /register, v.v.)

  // --- LOGIC XỬ LÝ ---

  // 1. User CÓ token (đã đăng nhập)
  if (token) {
    // Nếu họ cố vào trang login, "đá" họ vào trang dashboard
    if (isPublicPath) {
      return NextResponse.redirect(
        new URL("/dashboard/timekeeping", request.url)
      );
    }
    // Nếu họ vào trang khác, cứ cho đi
    return NextResponse.next();
  }

  // 2. User KHÔNG có token (chưa đăng nhập)
  if (!token) {
    // Nếu họ cố vào trang public (login), cứ cho đi
    if (isPublicPath) {
      return NextResponse.next();
    }
    // Nếu họ cố vào trang bảo vệ (dashboard), "đá" họ về login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
