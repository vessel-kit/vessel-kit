import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryColumn,
} from "typeorm";

@Entity("documents")
export class DocumentRecord {
  @PrimaryColumn("varchar")
  // @ts-ignore
  cid: string;

  @Column()
  // @ts-ignore
  doctype: string;

  @Column("simple-json")
  payload: any;

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
