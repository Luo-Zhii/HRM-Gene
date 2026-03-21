import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as os from 'os'; // 1. Import module OS

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve the uploads folder statically
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });


  // Enable CORS for frontend development
  app.enableCors({
    origin: true, // Cho phép tất cả các nguồn (chỉ dùng để dev)
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  // Expose API under /api prefix so frontend can call /api/* consistently
  app.setGlobalPrefix("api");

  const port = process.env.PORT || 3001;
  await app.listen(port, "0.0.0.0");
  // 2. Logic lấy địa chỉ IP của máy
  const networkInterfaces = os.networkInterfaces();

  // Tìm địa chỉ IPv4 không phải là internal (127.0.0.1)
  const ipAddress = Object.values(networkInterfaces)
    .flat()
    .find((details) => details?.family === 'IPv4' && !details.internal)?.address;

  // 3. In ra console đẹp và đầy đủ thông tin
  console.log(`\n🚀 HRM Backend is running!`);
  console.log(`--------------------------------------------------`);
  console.log(`✅ Local:    http://localhost:${port}/api`);
  if (ipAddress) {
    console.log(`✅ Network:  http://${ipAddress}:${port}/api`);
  }
  console.log(`--------------------------------------------------\n`);
}

bootstrap().catch((err) => {
  console.error("❌ Bootstrap error:", err);
  process.exit(1);
});
