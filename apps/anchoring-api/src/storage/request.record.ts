import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryColumn } from 'typeorm';
import { uuidTransformer } from './uuid.transformer';
import CID from 'cids';
import { cidTransformer } from './cid.transformer';
import { AnchoringStatus, UuidValue } from '@potter/anchoring';

@Entity('requests')
export class RequestRecord {
  @PrimaryColumn({ generated: 'uuid', transformer: uuidTransformer })
  id: UuidValue;

  @Column({ enum: AnchoringStatus })
  status: AnchoringStatus;

  @Column('varchar', { transformer: cidTransformer })
  cid: CID;

  @Column()
  docId: string;

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
