import { DataSource } from 'typeorm';

async function run() {
  const dataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "hrm",
  });
  
  await dataSource.initialize();
  console.log("Data Source has been initialized!");
  
  const queryRunner = dataSource.createQueryRunner();
  try {
    const comments = await queryRunner.query('SELECT * FROM comments');
    console.log(comments);
  } catch(e) {
    console.error(e);
  }
  
  await dataSource.destroy();
}

run();
