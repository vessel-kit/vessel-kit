import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import Joi from '@hapi/joi';
import CID from 'cids';
import { RequestCreateScenario } from '../scenarios/request-create.scenario';
import { RequestCreatedPresentation } from './request-created.presentation';
import { RequestGetScenario } from '../scenarios/request-get.scenario';
import { RequestStorage } from '../storage/request.storage';
import { RequestPresentation } from './request.presentation';
import { ApiProperty } from '@nestjs/swagger';
import { CeramicDocumentId } from '@potter/vessel';
import { AnchoringScheduleService } from '../anchoring/anchoring-schedule.service';
import { AnchorStorage } from '../storage/anchor.storage';
import { Ipfs } from 'ipfs';
import { IpfsService } from '../anchoring/ipfs.service';
import * as multihash from 'multihashes';

class CreateRequestPayload {
  @ApiProperty()
  cid: string;

  @ApiProperty()
  docId: string;
}

const createRequestSchema = Joi.object<CreateRequestPayload>({
  cid: Joi.string().required(),
  docId: Joi.string().required(),
});

const PAGE_SIZE = 25;

@Controller('/v0/requests')
export class RequestController {
  constructor(
    private readonly requestCreateScenario: RequestCreateScenario,
    private readonly requestGetScenario: RequestGetScenario,
    private readonly requestStorage: RequestStorage,
    private readonly anchoringSchedule: AnchoringScheduleService,
    private readonly anchorStorage: AnchorStorage,
    private readonly ipfsService: IpfsService,
  ) {}

  @Get('/')
  async index(@Query('page') pageIndex = 1) {
    const requests = await this.requestStorage.page(pageIndex, PAGE_SIZE);
    const totalCount = await this.requestStorage.count();
    const ipfs = this.ipfsService.client;
    const presentations = await Promise.all(
      requests.map(async r => {
        const anchor = await this.anchorStorage.byRequestId(r.id);
        if (anchor) {
          const proofDag = await ipfs.dag.get(new CID(anchor.proofCid));
          const merkleRootMultihash = proofDag.value.root.multihash;
          const digest = multihash.decode(merkleRootMultihash).digest;

          const txHashCid = proofDag.value.txHash;
          const txHashDigest = multihash.decode(txHashCid.multihash);
          const ethereumTxHash = '0x' + txHashDigest.digest.toString('hex');
          const chainId = proofDag.value.chainId;

          return new RequestPresentation(r, anchor, digest, ethereumTxHash, chainId);
        } else {
          return new RequestPresentation(r)
        }
      }),
    );
    return {
      requests: presentations,
      totalCount: totalCount,
      pageSize: PAGE_SIZE,
    };
  }

  @Get('/:cid')
  async get(@Param('cid') cidString: string) {
    return this.requestGetScenario.execute(cidString);
  }

  @Post('/')
  async create(@Body() body: CreateRequestPayload) {
    const validationResult = createRequestSchema.validate(body);
    if (validationResult.error) {
      throw new Error(`Validation error: ${validationResult.error.message}`);
    }
    const cid = new CID(body.cid);
    const docId = CeramicDocumentId.fromString(body.docId).toString();
    const result = await this.requestCreateScenario.execute(cid, docId);
    return new RequestCreatedPresentation(result.record, result.nextAnchoring);
  }
}
