/* istanbul ignore file */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAnchorRecords1569249291695 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: 'anchors',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'cid',
            type: 'varchar(512)',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'path',
            type: 'varchar(128)',
            isNullable: false,
            isUnique: false,
          },
          {
            name: 'proofCid',
            type: 'varchar(512)',
            isNullable: false,
            isUnique: false,
          },
          {
            name: 'createdAt',
            type: 'TIMESTAMP',
            isNullable: false,
            isUnique: false,
          },
          {
            name: 'updatedAt',
            type: 'TIMESTAMP',
            isNullable: false,
            isUnique: false,
          },
          {
            name: 'requestId',
            type: 'uuid',
            isNullable: false,
            isUnique: false,
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable('anchors');
  }
}
