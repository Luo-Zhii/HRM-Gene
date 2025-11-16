import { DataSource } from "typeorm";
import * as path from "path";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "hrm",
  entities: [path.join(__dirname, "src/entities/*.ts")],
  migrations: [path.join(__dirname, "src/migrations/*.ts")],
  synchronize: false, // Disable synchronize for migrations
});

export default AppDataSource;
