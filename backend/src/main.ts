import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  console.log(`✅ HRM Backend listening on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error("❌ Bootstrap error:", err);
  process.exit(1);
});
