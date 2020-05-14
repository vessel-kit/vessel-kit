import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import Joi from '@hapi/joi';
import CID from 'cids';
import { RequestCreateScenario } from '../scenarios/request-create.scenario';
import { RequestCreatedPresentation } from './request-created.presentation';
import { RequestGetScenario } from '../scenarios/request-get.scenario';
import { RequestStorage } from '../storage/request.storage';
import { RequestPresentation } from './request.presentation';

interface CreateRequestPayload {
  cid: string;
  docId: string;
}

const createRequestSchema = Joi.object<CreateRequestPayload>({
  cid: Joi.string().required(),
  docId: Joi.string().required(),
});

const PAGE_SIZE = 25;

@Controller('/api/v0/requests')
export class RequestController {
  constructor(
    private readonly requestCreateScenario: RequestCreateScenario,
    private readonly requestGetScenario: RequestGetScenario,
    private readonly requestStorage: RequestStorage,
  ) {}

  @Get('/')
  async index(@Query('page') pageIndex = 1) {
    const requests = await this.requestStorage.page(pageIndex, PAGE_SIZE);
    const totalCount = await this.requestStorage.count();
    return {
      requests: requests.map(r => new RequestPresentation(r)),
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
    const result = await this.requestCreateScenario.execute(cid, body.docId);
    return new RequestCreatedPresentation(result.record, result.nextAnchoring);
  }
}
