import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePositionNameUnique1763301307333 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, remove duplicate position names by keeping only the first occurrence
    await queryRunner.query(`
            DELETE FROM position a USING (
                SELECT MIN(position_id) as id, position_name
                FROM position
                GROUP BY position_name HAVING COUNT(*) > 1
            ) b
            WHERE a.position_name = b.position_name
            AND a.position_id != b.id
        `);

    // Then add the unique constraint
    await queryRunner.query(`
            ALTER TABLE position ADD CONSTRAINT UQ_position_name UNIQUE (position_name)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE position DROP CONSTRAINT UQ_position_name
        `);
  }
}
