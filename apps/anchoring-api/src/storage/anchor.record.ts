import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryColumn,
} from "typeorm";
import { UuidValue } from "@vessel-kit/anchoring";
import { uuidTransformer } from "./uuid.transformer";

@Entity("anchors")
export class AnchorRecord {
  @PrimaryColumn({ generated: "uuid", transformer: uuidTransformer })
  // @ts-ignore
  id: UuidValue;

  @Column("uuid", { transformer: uuidTransformer })
  // @ts-ignore
  requestId: UuidValue;

  @Column("varchar")
  // @ts-ignore
  cid: string;

  @Column()
  // @ts-ignore
  path: string;

  @Column("varchar")
  // @ts-ignore
  proofCid: string;

  @Column()
  // @ts-ignore
  createdAt: Date;

  @Column()
  // @ts-ignore
  updatedAt: Date;

  @Column("uuid", { transformer: uuidTransformer })
  // @ts-ignore
  transactionId: UuidValue;

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
