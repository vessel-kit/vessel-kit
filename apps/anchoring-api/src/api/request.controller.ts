import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import CID from "cids";
import { RequestCreateScenario } from "../scenarios/request-create.scenario";
import { RequestGetManyScenario } from "../scenarios/request-get-many.scenario";
import { RequestGetScenario } from "../scenarios/request-get.scenario";
import { RequestStorage } from "../storage/request.storage";
import { CidStringCodec, DecodePipe } from "@vessel-kit/codec";
import { AnchorStorage } from "../storage/anchor.storage";
import { IpfsService } from "../anchoring/ipfs.service";
import * as multihash from "multihashes";
import { RequestPresentation } from "./request.presentation";
import { AnchorRequestPayload } from "@vessel-kit/anchoring";
import * as t from "io-ts";
import { ApiOperation, ApiTags, ApiResponse, ApiBody } from "@nestjs/swagger";

const PAGE_SIZE = 25;

@Controller("/v0/requests")
export class RequestController {
  constructor(
    private readonly requestCreateScenario: RequestCreateScenario,
    private readonly requestGetScenario: RequestGetScenario,
    private readonly requestGetManyScenario: RequestGetManyScenario,
    private readonly requestStorage: RequestStorage,
    private readonly anchorStorage: AnchorStorage,
    private readonly ipfsService: IpfsService
  ) {}

  @Get("/")
  @ApiTags("requests")
  @ApiOperation({
    summary: "Get the page with requests",
    description:
      "Get requests information " +
      "including request list, total count of requests, page size (for pagination)",
  })
  async index(@Query("page") pageIndex = 1) {
    const requests = await this.requestStorage.page(pageIndex, PAGE_SIZE);
    const totalCount = await this.requestStorage.count();
    const ipfs = this.ipfsService.client;
    const presentations = await Promise.all(
      requests.map(async (r) => {
        const anchor = await this.anchorStorage.byRequestId(r.id);
        if (anchor) {
          const proofDag = await ipfs.dag.get(new CID(anchor.proofCid));
          const merkleRootMultihash = proofDag.value.root.multihash;
          const digest = multihash.decode(merkleRootMultihash).digest;

          const txHashCid = proofDag.value.txHash;
          const txHashDigest = multihash.decode(txHashCid.multihash);
          const ethereumTxHash =
            "0x" + multihash.toHexString(txHashDigest.digest);
          const chainId = proofDag.value.chainId;

          return new RequestPresentation(
            r,
            anchor,
            digest,
            ethereumTxHash,
            chainId
          );
        } else {
          return new RequestPresentation(r);
        }
      })
    );
    return {
      requests: presentations,
      totalCount: totalCount,
      pageSize: PAGE_SIZE,
    };
  }

  @Get("/:cid")
  @ApiOperation({ deprecated: true })
  async get(
    @Param("cid", new DecodePipe(t.string.pipe(CidStringCodec))) cid: CID,
    @Query() query: string
  ) {
    return this.requestGetScenario.execute(cid);
  }

  @Get("/list/:cid")
  @ApiTags("requests")
  @ApiOperation({ summary: "Get all anchor requests by CID" })
  @ApiResponse({ status: 200, description: "Success" })
  @ApiResponse({ status: 500, description: "Error" })
  async getMany(@Param("cid") cidString: string) {
    return this.requestGetManyScenario.execute(cidString);
  }

  @Post("/")
  @ApiResponse({
    status: 201,
    description: "The record has been successfully created",
  })
  @ApiResponse({ status: 500, description: "Error" })
  @ApiOperation({ summary: "Create a new anchor request." })
  @ApiBody({
    schema: {
      example: {
        docId:
          "vessel://bafyreibw43tmfkw4az3ezb2dkiid6abwx2criw4te2jhti6k523cecjuxm",
        cid: "bafyreibw43tmfkw4az3ezb2dkiid6abwx2criw4te2jhti6k523cecjuxm",
      },
    },
  })
  async create(
    @Body(new DecodePipe(AnchorRequestPayload))
    body: t.TypeOf<typeof AnchorRequestPayload>
  ) {
    await this.requestCreateScenario.execute(body.cid, body.docId);
    return this.requestGetScenario.execute(body.cid);
  }
}
