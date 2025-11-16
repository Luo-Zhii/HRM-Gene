import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend development
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  // Expose API under /api prefix so frontend can call /api/* consistently
  app.setGlobalPrefix("api");

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`✅ HRM Backend listening on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error("❌ Bootstrap error:", err);
  process.exit(1);
});
