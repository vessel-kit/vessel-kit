import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import CID from 'cids';
import { cidTransformer } from './cid.transformer';

@Entity('documents')
export class DocumentRecord {
  @PrimaryColumn('varchar', { transformer: cidTransformer })
  cid: CID;

  @Column()
  doctype: string;

  @Column()
  payload: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @BeforeInsert()
  private beforeInsert() {
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = this.updatedAt || this.createdAt;
  }

  @BeforeUpdate()
  private beforeUpdate() {
    this.updatedAt = new Date();
  }
}
