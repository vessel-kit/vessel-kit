import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import CID from 'cids';
import { cidTransformer } from './cid.transformer';

@Entity('contents')
export class ContentRecord {
  @PrimaryColumn('varchar', { transformer: cidTransformer })
  cid: CID;

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
