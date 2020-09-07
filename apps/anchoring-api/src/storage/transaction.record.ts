import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryColumn } from 'typeorm';
import { UuidValue } from '@vessel-kit/anchoring';
import { uuidTransformer } from './uuid.transformer';

@Entity('transactions')
export class TransactionRecord {
  @PrimaryColumn({ generated: 'uuid', transformer: uuidTransformer })
  id: UuidValue;

  @Column()
  txHash: string;

  @Column()
  chainId: string;

  @Column()
  blockNumber: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @BeforeInsert()
  private beforeInsert() {
    this.id = this.id || new UuidValue();
    this.createdAt = new Date();
    this.updatedAt = this.createdAt;
  }

  @BeforeUpdate()
  private beforeUpdate() {
    this.updatedAt = new Date();
  }
}
