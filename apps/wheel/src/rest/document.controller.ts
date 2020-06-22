import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { Ceramic } from '../lib/ceramic/ceramic';
import { LiveGateway } from '../live/live.gateway'
import { DocumentPresentation } from './document.presentation';
import CID from 'cids';
import { DocumentStatePresentation } from './document-state.presentation';


@Controller('/api/v0/ceramic')
export class DocumentController {
  constructor(private readonly ceramic: Ceramic, private readonly liveUpdater: LiveGateway) {}

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
    let document
    try {
      const cid = new CID(cidString);
      document = await this.ceramic.load(cid);
    } catch (e) {
      throw new HttpException('I_AM_A_TEAPOT', HttpStatus.I_AM_A_TEAPOT);
    }
    return new DocumentPresentation(document);
  }

  @Get('/list/:cid')
  async readMany(@Param('cid') cidString: string) {
    let documents = []
    try {
      const cid = new CID(cidString);
      documents = await this.ceramic.loadMany(cid);
    } catch (e) {
      throw new HttpException('I_AM_A_TEAPOT', HttpStatus.I_AM_A_TEAPOT);
    }
      return documents.map(d => {
        return {
          cid: d.cid,
          status: d.status,
          content: d.anchorRecord?.content,
          updatedAt: d.updatedAt
        }
      });

  }

  @Get('/content/:cid')
  async readContent(@Param('cid') cidString: string) {
    let content
    try {
      const cid = new CID(cidString);
      content = await this.ceramic.content(cid);
    } catch (e) {
      throw new HttpException('I_AM_A_TEAPOT', HttpStatus.I_AM_A_TEAPOT);
    }

    return {
      content: content
    };
  }

  @Put('/:cid')
  async update(@Param('cid') cidString: string, @Body() body: any) {
    const cid = new CID(cidString);
    const document = await this.ceramic.load(cid);
    await document.update(body);
    this.liveUpdater.sendUpdate(cidString, body.content)
    return;
  }

  @Get('/:cid/state')
  async state(@Param('cid') cidString: string) {
    const cid = new CID(cidString);
    const document = await this.ceramic.load(cid);
    return new DocumentStatePresentation(document);
  }
}
