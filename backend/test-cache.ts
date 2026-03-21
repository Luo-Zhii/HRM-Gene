import { Cache } from "cache-manager";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./src/app.module";
import { TimeKeepingService } from "./src/modules/timekeeping/timekeeping.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const svc = app.get(TimeKeepingService);
  
  const { token } = await svc.generateDynamicQr();
  console.log("Token generated:", token);
  
  const manager = (svc as any).cacheManager;
  // Let's see what happens to the cache...
  await manager.set('test-key-v5', true, 10000);
  await manager.set('test-key-v4', true, {ttl: 10});
  
  console.log("v5 get:", await manager.get('test-key-v5'));
  console.log("v4 get:", await manager.get('test-key-v4'));

  await app.close();
}
bootstrap();
