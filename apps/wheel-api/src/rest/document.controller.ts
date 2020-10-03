import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { Vessel } from "@vessel-kit/vessel";
import { LiveGateway } from "../live/live.gateway";
import { DocumentRecord } from "../storage/document.record";
// import { DocumentStorage } from '../storage/document.storage'; TODO
import { DocumentStatePresentation } from "./document-state.presentation";
import { DocId, CidStringCodec, DecodePipe } from "@vessel-kit/codec";
import CID from "cids";
import * as t from "io-ts";
import { IDocument } from "@vessel-kit/vessel";

@Controller("/api/v0/document")
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name);
  constructor(
    private readonly vessel: Vessel,
    private readonly liveUpdater: LiveGateway // private readonly documentStorage: DocumentStorage,
  ) {}

  @Post("/")
  async create(@Body() body: any) {
    this.logger.log(`Handling CREATE`);
    const document = await this.vessel.create(body);
    this.logger.log(
      `Created ${document.state.doctype} document ${document.id.toString()}`
    );
    const record = new DocumentRecord();
    record.cid = document.id.cid.toString();
    record.doctype = body.doctype;
    record.payload = body.content;
    record.createdAt = new Date();
    record.updatedAt = new Date();
    // await this.documentStorage.save(record); TODO
    return document.state;
  }

  @Get("/")
  async list() {
    return this.vessel.list();
  }

  @Get("/:cid")
  async read(@Param("cid") cidString: string) {
    if (cidString === "undefined") {
      return {};
    } else {
      const cid = DocId.fromString(cidString);
      const document: IDocument<unknown, unknown> = await this.vessel.load(cid);
      return document.state;
    }
  }

  @Get("/:cid/history")
  async readMany(@Param("cid") cidString: string) {
    const cid = new CID(cidString);
    const documents = await this.vessel.history(new DocId(cid));
    return JSON.stringify(documents);
  }

  @Get("/:cid/content")
  async readContent(@Param("cid") cidString: string) {
    const cid = new CID(cidString);
    const document = await this.vessel.load(new DocId(cid));
    const content = await document.canonical();
    return {
      content: content,
    };
  }

  @Put("/:cid")
  async update(@Param("cid") cidString: string, @Body() body: any) {
    const documentId = DocId.fromString(cidString);
    const document = await this.vessel.load(documentId);
    await document.update(body);
    this.liveUpdater.sendUpdate(cidString, body.content);
    return document.state;
  }

  @Get("/:cid/state")
  async state(@Param("cid") cidString: string) {
    const documentId = DocId.fromString(cidString);
    try {
      const document = await this.vessel.load(documentId);
      return new DocumentStatePresentation(document);
    } catch (e) {
      console.error(e);
      return {
        error: e.message,
      };
    }
  }

  @Post("/:cid/anchor")
  async requestAnchor(
    @Param("cid", new DecodePipe(t.string.pipe(CidStringCodec))) cid: CID
  ) {
    const documentId = new DocId(cid);
    const document = await this.vessel.load(documentId);
    document.requestAnchor();
    return document.state;
  }
}
