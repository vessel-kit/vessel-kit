import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryColumn } from 'typeorm';
import { UuidValue } from '@vessel-kit/anchoring';
import { uuidTransformer } from './uuid.transformer';

@Entity('transactions')
export class TransactionRecord {
  @PrimaryColumn({ generated: 'uuid', transformer: uuidTransformer })
  // @ts-ignore
  id: UuidValue;

  @Column()
  // @ts-ignore
  txHash: string;

  @Column()
  // @ts-ignore
  chainId: string;

  @Column()
  // @ts-ignore
  blockNumber: number;

  @Column()
  // @ts-ignore
  createdAt: Date;

  @Column()
  // @ts-ignore
  updatedAt: Date;

  @BeforeInsert()
  // @ts-ignore
  private beforeInsert() {
    this.id = this.id || new UuidValue();
    this.createdAt = new Date();
    this.updatedAt = this.createdAt;
  }

  @BeforeUpdate()
  // @ts-ignore
  private beforeUpdate() {
    this.updatedAt = new Date();
  }
}
