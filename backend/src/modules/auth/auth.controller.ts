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

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Request() req: any) {
    // Gọi service lấy full thông tin user + permissions + lương thưởng
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile/update")
  async updateProfile(
    @Request() req: any,
    @Body() updateData: { phone_number: string; address: string }
  ) {
    return this.authService.updateContactInfo(req.user.id, updateData);
  }
  @Post("login")
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) return { error: "Invalid credentials" };
    const token = this.authService.login(user);
    // login() returns { access_token }
    const access = (await token).access_token;
    // set HttpOnly cookie
    res.cookie("access_token", access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    return { success: true };
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token");
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async profile(@Request() req: any) {
    const user = req.user;
    if (!user || !user.employee_id) return null;
    return await this.authService.getProfile(user.employee_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("navigation")
  async navigation(@Request() req: any) {
    const user = req.user;
    if (!user || !user.employee_id) return null;
    const profile = await this.authService.getProfile(user.employee_id);
    const permissions = profile.permissions || [];

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

    // Filter admin section based on position_name
    const hasAdminAccess = profile.position?.position_name === "admin";
    if (!hasAdminAccess) {
      navigation.admin = [];
    }

    return navigation;
  }
}
