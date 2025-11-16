import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
