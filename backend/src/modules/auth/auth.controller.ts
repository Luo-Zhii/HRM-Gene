import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Res,
  Patch,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --- 1. LOGIN ---
  @Post("login")
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) return { error: "Invalid credentials" };

    const tokenData = await this.authService.login(user); // Giả sử trả về { access_token }

    // Set Cookie
    res.cookie("access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true, user: user }; // Có thể trả về user info cơ bản luôn
  }

  // --- 2. LOGOUT ---
  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    // Xóa cookie, quan trọng là option phải giống lúc set (trừ maxAge)
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return { success: true };
  }

  // --- 3. GET PROFILE (Đã gộp và thêm chống cache) ---
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    // 👇 QUAN TRỌNG: Thêm Header chống Cache cho trình duyệt 👇
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    const user = req.user;
    // Kiểm tra xem user lấy từ token có id hay employee_id
    const userId = user.employee_id || user.id;

    if (!userId) return null;

    return this.authService.getProfile(userId);
  }

  // --- 4. UPDATE PROFILE ---
  @UseGuards(JwtAuthGuard)
  @Patch("profile/update")
  async updateProfile(
    @Request() req: any,
    @Body() updateData: { phone_number: string; address: string }
  ) {
    const userId = req.user.employee_id || req.user.id;
    return this.authService.updateContactInfo(userId, updateData);
  }

  // --- 5. NAVIGATION (Cũng nên chống cache nếu phân quyền thay đổi) ---
  @UseGuards(JwtAuthGuard)
  @Get("navigation")
  async navigation(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    // Chống cache cho menu luôn để tránh logout admin vào user vẫn thấy menu admin
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    const user = req.user;
    const userId = user.employee_id || user.id;
    if (!userId) return null;

    const profile = await this.authService.getProfile(userId);

    // Define navigation structure
    const navigation = {
      main: [
        { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        { name: "Timekeeping", href: "/dashboard/timekeeping", icon: "Clock" },
        { name: "Leave", href: "/dashboard/leave", icon: "Calendar" },
      ],
      admin: [
        {
          name: "Leave Approvals",
          href: "/admin/leave-approvals",
          icon: "CheckCircle",
        },
        { name: "Organization", href: "/admin/organization", icon: "Building" },
        { name: "Permissions", href: "/admin/permissions", icon: "Shield" },
        {
          name: "QR Display (Tablet)",
          href: "/admin/qr-display",
          icon: "Tablet",
        },
        { name: "Settings", href: "/admin/settings", icon: "Settings" },
      ],
    };

    // Filter admin logic
    // Lưu ý: Nên check permissions thay vì check cứng tên "admin" nếu có thể
    const hasAdminAccess =
      profile.position?.position_name === "admin" ||
      profile.position?.position_name === "System Admin";

    if (!hasAdminAccess) {
      navigation.admin = [];
    }

    return navigation;
  }
}
