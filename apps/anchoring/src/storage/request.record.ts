import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryColumn } from 'typeorm';
import { UuidValue } from './uuid.value';
import { uuidTransformer } from './uuid.transformer';
import { RequestStatus } from './request-status';
import CID from 'cids';
import { cidTransformer } from './cid.transformer';

@Entity('requests')
export class RequestRecord {
  @PrimaryColumn({ generated: 'uuid', transformer: uuidTransformer })
  id: UuidValue;

  @Column({ enum: RequestStatus })
  status: RequestStatus;

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
