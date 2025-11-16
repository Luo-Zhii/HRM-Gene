import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

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
  constructor() {
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
    // payload contains sub, email, positionId
    return {
      employee_id: payload.sub,
      email: payload.email,
      positionId: payload.positionId,
    };
  }
}
