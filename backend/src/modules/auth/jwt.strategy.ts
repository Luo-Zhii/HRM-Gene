import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Employee } from "../../entities/employee.entity"; // ⚠️ Sửa đường dẫn nếu cần

const cookieExtractor = (req: any) => {
  let token = null;
  if (!req) return null;
  if (req.cookies && req.cookies.access_token) token = req.cookies.access_token;
  else if (req.headers && req.headers.cookie) {
    const m = req.headers.cookie
      .split(";")
      .find((c: string) => c.trim().startsWith("access_token="));
    if (m) token = decodeURIComponent(m.split("=")[1]);
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // 👇 Inject Repository để query database
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "CHANGE_ME",
    } as any);
  }

  async validate(payload: any) {
    // 👇 Thay vì trả về payload thô, ta query DB để lấy quyền mới nhất
    const user = await this.employeeRepo.findOne({
      where: { employee_id: payload.sub } as any,
      relations: [
        "position",
        "position.permissions", // 👈 Tên này phải chuẩn theo Entity Position
        "position.permissions.permission", // 👈 Lấy tên permission
      ],
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // 👇 "Làm phẳng" quyền thành mảng string: ['manage:system', 'view:leave']
    const permissions =
      user.position?.permissions
        ?.map((pp) => pp.permission?.permission_name)
        .filter((p) => p) || [];

    // 👇 Trả về User kèm Permissions để Guard sử dụng
    return {
      ...user,
      employee_id: payload.sub,
      email: payload.email,
      role: user.position?.position_name, // Gán role để dùng cho Admin Bypass
      permissions: permissions, // ✅ Guard cần cái này nhất
    };
  }
}
