import { Controller, Get } from '@nestjs/common';
import { RequestStorage } from '../storage/request.storage';
import { AnchorStorage } from '../storage/anchor.storage';
import { AnchoringScheduleService } from '../anchoring/anchoring-schedule.service';
import { AnchoringStatus } from '@potter/anchoring';
import {
  ApiOperation,
  ApiTags,
  ApiResponse
} from '@nestjs/swagger';

@Controller('/v0/stats')
export class StatsController {
  constructor(
    private readonly requestStorage: RequestStorage,
    private readonly anchorStorage: AnchorStorage,
    private readonly anchoringSchedule: AnchoringScheduleService,
  ) {}

  @Get('/')
  @ApiTags('stats')
  @ApiOperation({ summary: 'Get stats', description: 'Gather statistics about total amount of requests, ' +
      'total amount of anchors, pending requests, next anchoring time'})
  @ApiResponse({ status: 200, description: 'Success'})
  @ApiResponse({ status: 500, description: 'Error'})
  async index() {
    const requestsTotalCount = await this.requestStorage.count();
    const anchorsTotalCount = await this.anchorStorage.count();
    const pendingRequests = await this.requestStorage.countByStatus(AnchoringStatus.PENDING);
    const cronJob = this.anchoringSchedule.get(this.anchoringSchedule.triggerAnchoring);
    const nextAnchoring = cronJob.nextDate().toDate()
    return {
      requestsTotalCount: requestsTotalCount,
      anchorsTotalCount: anchorsTotalCount,
      pendingRequests: pendingRequests,
      nextAnchoring: nextAnchoring.toISOString()
    };
  }
}
