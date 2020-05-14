import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UuidValue } from './uuid.value';
import { uuidTransformer } from './uuid.transformer';
import CID from 'cids';
import { cidTransformer } from './cid.transformer';
import { RequestRecord } from './request.record';

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
