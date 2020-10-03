/* istanbul ignore file */
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRequestRecords1569249291595 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "requests",
        columns: [
          {
            name: "id",
            type: "uuid",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "status",
            type: "varchar(128)",
            isNullable: false,
            isUnique: false,
          },
          {
            name: "cid",
            type: "varchar(512)",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "docId",
            type: "varchar(512)",
            isNullable: false,
            isUnique: false,
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
    await queryRunner.dropTable("requests");
  }
}
