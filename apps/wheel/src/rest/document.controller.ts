import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Ceramic } from '../lib/ceramic/ceramic';
import { DocumentPresentation } from './document.presentation';
import CID from 'cids';
import { DocumentStatePresentation } from './document-state.presentation';


@Controller('/api/v0/ceramic')
export class DocumentController {
  constructor(private readonly ceramic: Ceramic) {}

  @Post('/')
  async create(@Body() body: any) {
    const document = await this.ceramic.create(body);
    return new DocumentPresentation(document);
  }

  @Get('/')
  async list() {
    return await this.ceramic.list();
  }

  @Get('/:cid')
  async read(@Param('cid') cidString: string) {
    const cid = new CID(cidString);
    const document = await this.ceramic.load(cid);
    return new DocumentPresentation(document);
  }

  @Get('/list/:cid')
  async readMany(@Param('cid') cidString: string) {
    const cid = new CID(cidString);
    const documents = await this.ceramic.loadMany(cid);
    return documents.map(d => {
      return {
        cid: d.cid,
        status: d.status,
        content: d.anchorRecord?.content,
        updatedAt: d.updatedAt
      }
    });
  }

  @Put('/:cid')
  async update(@Param('cid') cidString: string, @Body() body: any) {
    const cid = new CID(cidString);
    const document = await this.ceramic.load(cid);
    await document.update(body);
    return;
  }

  @Get('/:cid/state')
  async state(@Param('cid') cidString: string) {
    const cid = new CID(cidString);
    const document = await this.ceramic.load(cid);
    return new DocumentStatePresentation(document);
  }
}
