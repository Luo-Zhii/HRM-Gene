import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Res,
  Patch,
  BadRequestException,
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
    if (!user) {
      return { error: "Invalid credentials" }; // Trả về object lỗi thay vì throw để Frontend dễ xử lý
    }

    const tokenData = await this.authService.login(user);

    // Set Cookie: Quan trọng là httpOnly để bảo mật
    res.cookie("access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true, user: user, access_token: tokenData.access_token };
  }

  // --- 2. LOGOUT ---
  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return { success: true };
  }

  // --- 3. GET PROFILE ---
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    // Chống Cache tuyệt đối cho Profile
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    const user = req.user;
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

  // --- 5. NAVIGATION (Menu Sidebar) ---
  @UseGuards(JwtAuthGuard)
  @Get("navigation")
  async navigation(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    // Chống cache cho Menu
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    const user = req.user;
    const userId = user.employee_id || user.id;
    if (!userId) return { main: [], admin: [] };

    // Lấy profile mới nhất từ DB để check chức vụ
    const profile = await this.authService.getProfile(userId);
    const positionName = profile.position?.position_name || "";

    // --- CẤU TRÚC MENU ---
    const navigation = {
      main: [
        { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        { name: "Timekeeping", href: "/dashboard/timekeeping", icon: "Clock" },
        { name: "My Leave", href: "/dashboard/leave", icon: "Calendar" },
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
          name: "QR Display",
          href: "/admin/qr-display",
          icon: "Tablet",
        },
        { name: "Settings", href: "/admin/settings", icon: "Settings" },
      ],
    };

    // --- LOGIC CHECK ADMIN (QUAN TRỌNG) ---
    // Chấp nhận nhiều trường hợp viết hoa/thường để tránh lỗi
    const isAdmin =
      positionName === "Admin" ||
      positionName.toLowerCase() === "admin" ||
      positionName === "System Admin" ||
      positionName === "Director"; // Thêm chức vụ này nếu có

    if (!isAdmin) {
      navigation.admin = []; // Nếu không phải Admin thì xóa menu Admin
    }

    return navigation;
  }

  // --- 6. ADMIN/DEVELOPER REGISTRATION (Bootstrap only) ---
  @Post("admin-register")
  async adminRegister(
    @Body()
    body: {
      email: string;
      password: string;
      role: "Admin" | "Developer";
      secretKey: string;
    },
    @Res({ passthrough: true }) res: Response
  ) {
    const { email, password, role, secretKey } = body;

    if (!email || !password || !role || !secretKey) {
      throw new BadRequestException("All fields are required");
    }

    const user = await this.authService.registerAdminUser({
      email,
      password,
      role,
      secretKey,
    });

    const tokenData = await this.authService.login(user);

    res.cookie("access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true, user, access_token: tokenData.access_token };
  }
}
