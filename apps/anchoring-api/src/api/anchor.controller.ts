import { Controller, Get, Query } from '@nestjs/common';
import { AnchorStorage } from '../storage/anchor.storage';
import { AnchorPresentation } from './anchor.presentation';
import {
  ApiOperation,
  ApiTags,
  ApiResponse
} from '@nestjs/swagger';

const PAGE_SIZE = 25;

@Controller('/v0/anchors')
export class AnchorController {
  constructor(private readonly anchorStorage: AnchorStorage) {}

  @Get('/')
  @ApiTags('anchors')
  @ApiOperation({ summary: 'Get the page with anchors information', description: 'Get anchor information ' +
      'including anchors, total count of anchors, page size (for pagination)' })
  @ApiResponse({ status: 200, description: 'Success'})
  @ApiResponse({ status: 500, description: 'Error'})
  async index(@Query('page') pageIndex = 1) {
    const anchors = await this.anchorStorage.page(pageIndex, PAGE_SIZE);
    const totalCount = await this.anchorStorage.count();
    return {
      anchors: anchors.map(a => new AnchorPresentation(a)),
      totalCount: totalCount,
      pageSize: PAGE_SIZE,
    };
  }
}
