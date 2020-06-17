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
import { DocumentPresentation } from './document.presentation';
import { DocumentStatePresentation } from './document-state.presentation';
import { CeramicDocumentId } from '@potter/vessel';

@Controller('/api/v0/ceramic')
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name);
  constructor(private readonly ceramic: Ceramic) {}

  @Post('/')
  async create(@Body() body: any) {
    this.logger.log(`Handling CREATE`);
    const document = await this.ceramic.create(body);
    this.logger.log(
      `Created ${document.state} document ${document.id.toString()}`,
    );
    return new DocumentPresentation(document);
  }

  @Get('/:cid')
  async read(@Param('cid') cidString: string) {
    const cid = CeramicDocumentId.fromString(cidString);
    const document = await this.ceramic.load(cid);
    return new DocumentPresentation(document);
  }

  @Put('/:cid')
  async update(@Param('cid') cidString: string, @Body() body: any) {
    const documentId = CeramicDocumentId.fromString(cidString);
    const document = await this.ceramic.load(documentId);
    await document.update(body);
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
