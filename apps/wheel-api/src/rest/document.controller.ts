import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Ceramic } from '@potter/vessel';
import { LiveGateway } from '../live/live.gateway';
import { DocumentPresentation } from './document.presentation';
import { DocumentStatePresentation } from './document-state.presentation';
import { CeramicDocumentId } from '@potter/codec';
import CID from 'cids';

@Controller('/api/v0/ceramic')
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name);
  constructor(
    private readonly ceramic: Ceramic,
    private readonly liveUpdater: LiveGateway,
  ) {}

  @Post('/')
  async create(@Body() body: any) {
    this.logger.log(`Handling CREATE`);
    const document = await this.ceramic.create(body);
    this.logger.log(
      `Created ${document.state} document ${document.id.toString()}`,
    );
    return new DocumentPresentation(document);
  }

  @Get('/')
  async list() {
    return this.ceramic.list();
  }

  @Get('/:cid')
  async read(@Param('cid') cidString: string) {
    const cid = CeramicDocumentId.fromString(cidString);
    const document = await this.ceramic.load(cid);
    return new DocumentPresentation(document);
  }

  // @Get('/list/:cid')
  // async readMany(@Param('cid') cidString: string) {
  //   const cid = new CID(cidString);
  //   const documents = await this.ceramic.loadMany(cid);
  //   return documents.map(d => {
  //     return {
  //       cid: d.cid,
  //       status: d.status,
  //       content: d.anchorRecord?.content,
  //       updatedAt: d.updatedAt,
  //     };
  //   });
  // }

  @Get('/content/:cid')
  async readContent(@Param('cid') cidString: string) {
    const cid = new CID(cidString);
    // const content = await this.ceramic.content(cid);
    // return {
    //   content: content,
    // };
  }

  @Put('/:cid')
  async update(@Param('cid') cidString: string, @Body() body: any) {
    const documentId = CeramicDocumentId.fromString(cidString);
    const document = await this.ceramic.load(documentId);
    await document.update(body);
    this.liveUpdater.sendUpdate(cidString, body.content);
    return;
  }

  @Get('/:cid/state')
  async state(@Param('cid') cidString: string) {
    const documentId = CeramicDocumentId.fromString(cidString);
    try {
      const document = await this.ceramic.load(documentId);
      return new DocumentStatePresentation(document);
    } catch (e) {
      console.error(e);
      return {
        error: e.message,
      };
    }
  }
}
