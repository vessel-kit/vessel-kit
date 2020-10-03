/* istanbul ignore file */
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateContentRecords1569249291595 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "contents",
        columns: [
          {
            name: "cid",
            type: "varchar(512)",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "payload",
            type: "text",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "createdAt",
            type: "TIMESTAMP",
            isNullable: false,
            isUnique: false,
          },
          {
            name: "updatedAt",
            type: "TIMESTAMP",
            isNullable: false,
            isUnique: false,
          },
        ],
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable("contents");
  }
}
