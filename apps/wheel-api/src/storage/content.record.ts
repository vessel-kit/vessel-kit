import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('contents')
export class ContentRecord {
  @PrimaryColumn('varchar')
  // @ts-ignore
  cid: string;

  @Column()
  // @ts-ignore
  payload: string;

  @Column()
  // @ts-ignore
  createdAt: Date;

  @Column()
  // @ts-ignore
  updatedAt: Date;

  @BeforeInsert()
  // @ts-ignore
  private beforeInsert() {
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = this.updatedAt || this.createdAt;
  }

  @BeforeUpdate()
  // @ts-ignore
  private beforeUpdate() {
    this.updatedAt = new Date();
  }
}
