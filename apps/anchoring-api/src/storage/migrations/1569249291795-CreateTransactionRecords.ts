/* istanbul ignore file */
import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateTransactionRecords1569249291795 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'txHash',
            type: 'varchar(512)',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'chainId',
            type: 'varchar(128)',
            isNullable: false,
            isUnique: false,
          },
          {
            name: 'blockNumber',
            type: 'integer',
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
        ],
      }),
    );
    await queryRunner.addColumn(
      'anchors',
      new TableColumn({
        name: 'transactionId',
        type: 'uuid',
        isNullable: false,
        isUnique: false,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable('transactions');
    await queryRunner.dropColumn('anchors', 'transactionId');
  }
}
