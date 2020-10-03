import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryColumn,
} from "typeorm";
import { uuidTransformer } from "./uuid.transformer";
import {
  AnchoringStatus,
  UuidValue,
  IAnchoringRequest,
} from "@vessel-kit/anchoring";

@Entity("requests")
export class RequestRecord implements IAnchoringRequest {
  @PrimaryColumn({ generated: "uuid", transformer: uuidTransformer })
  // @ts-ignore
  id: UuidValue;

  @Column({ enum: AnchoringStatus })
  // @ts-ignore
  status: AnchoringStatus;

  @Column("varchar")
  // @ts-ignore
  cid: string;

  @Column()
  // @ts-ignore
  docId: string;

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
