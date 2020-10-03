import { Controller, Get, Param, Query } from "@nestjs/common";
import { CidStringCodec, DecodePipe } from "@vessel-kit/codec";
import * as t from "io-ts";
import CID from "cids";
import { IpfsService } from "./ipfs.service";

@Controller("/api/v0/cloud")
export class CloudController {
  constructor(private readonly ipfs: IpfsService) {}

  @Get("/:cid")
  async read(
    @Param("cid", new DecodePipe(t.string.pipe(CidStringCodec))) cid: CID,
    @Query("path") path?: string
  ) {
    const blob = await this.ipfs.client.dag.get(cid, path);
    return blob?.value;
  }
}
