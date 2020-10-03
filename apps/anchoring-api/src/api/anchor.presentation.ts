import { AnchorRecord } from "../storage/anchor.record";
import { ApiProperty } from "@nestjs/swagger";

export class AnchorPresentation {
  @ApiProperty({
    example: "3ce7f07f-284e-405e-8833-d05494329d1d",
    description: "Anchor ID",
  })
  readonly id = this.anchor.id.toString();
  @ApiProperty({
    example: "0bb6b43a-9ca7-4806-b2aa-a7b440c55af1",
    description: "Anchor Request ID",
  })
  readonly requestId = this.anchor.requestId.toString();
  @ApiProperty({
    example: "bafyreibxstit7iyussyxn3rcl5kee7xputh4ebgksl2jrft4ysgwkfhwmq",
    description: "Document CID",
  })
  readonly cid = this.anchor.cid.toString();
  @ApiProperty({
    example: "2020-08-21 20:38:13.557",
    description: "Date of anchor's creation",
  })
  readonly createdAt = this.anchor.createdAt.toISOString();

  constructor(private readonly anchor: AnchorRecord) {}

  toJSON() {
    return {
      id: this.id,
      requestId: this.requestId,
      cid: this.cid,
      createdAt: this.createdAt,
    };
  }
}
