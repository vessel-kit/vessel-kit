import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryColumn } from 'typeorm';
import { UuidValue } from '@vessel-kit/anchoring';
import { uuidTransformer } from './uuid.transformer';
import CID from 'cids';
import { cidTransformer } from './cid.transformer';

@Entity('anchors')
export class AnchorRecord {
  @PrimaryColumn({ generated: 'uuid', transformer: uuidTransformer })
  id: UuidValue;

  @Column('uuid', { transformer: uuidTransformer })
  requestId: UuidValue;

  @Column('varchar', { transformer: cidTransformer })
  cid: CID;

  @Column()
  path: string;

  @Column('varchar', { transformer: cidTransformer })
  proofCid: CID;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column('uuid', { transformer: uuidTransformer })
  transactionId: UuidValue;

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
