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
      return { error: "Invalid credentials" };
    }

    const tokenData = await this.authService.login(user);

    res.cookie("access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
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
      secure: process.env.NODE_ENV === "development",
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
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    const user = req.user;
    const userId = user.employee_id || user.id;
    if (!userId) return { main: [], admin: [] };

    const profile = await this.authService.getProfile(userId);
    const positionName = profile.position?.position_name || "";

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

    const isAdmin =
      positionName === "Admin" ||
      positionName.toLowerCase() === "admin" ||
      positionName === "System Admin" ||
      positionName === "Director";

    if (!isAdmin) {
      navigation.admin = [];
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
      department_id: number;
      position_id: number;
      secretKey: string;
      first_name: string; // [FIX] Thêm vào type definition
      last_name: string; // [FIX] Thêm vào type definition
    }
  ) {
    // 1. Lấy biến từ Body (bao gồm cả first_name, last_name)
    const {
      email,
      password,
      department_id,
      position_id,
      secretKey,
      first_name, // [FIX] Destructuring lấy biến ra
      last_name, // [FIX] Destructuring lấy biến ra
    } = body;

    // 2. Validate dữ liệu đầu vào
    if (
      !email ||
      !password ||
      !department_id ||
      !position_id ||
      !secretKey ||
      !first_name || // [FIX] Validate
      !last_name // [FIX] Validate
    ) {
      throw new BadRequestException("All fields are required");
    }

    // 3. Gọi Service
    const result = await this.authService.registerAdminUser({
      email,
      password,
      department_id,
      position_id,
      secretKey,
      first_name, // Biến này giờ đã tồn tại
      last_name, // Biến này giờ đã tồn tại
    });

    // 4. Trả về kết quả
    return result;
  }
}
