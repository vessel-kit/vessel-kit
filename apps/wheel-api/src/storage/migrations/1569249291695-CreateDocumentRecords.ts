/* istanbul ignore file */
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateDocumentRecords1569249291695 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "documents",
        columns: [
          {
            name: "cid",
            type: "varchar(512)",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "doctype",
            type: "varchar(255)",
            isNullable: false,
            isUnique: false,
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
    await queryRunner.dropTable("documents");
  }
}
