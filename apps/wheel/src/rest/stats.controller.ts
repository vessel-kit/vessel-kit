import { Controller, Get } from '@nestjs/common';
import { Ceramic } from '../lib/ceramic/ceramic';

@Controller('/api/v0/stats')
export class StatsController {
  constructor(private readonly ceramic: Ceramic) {
  }

  @Get('/')
  async index() {
    const stats = await this.ceramic.stats()
    return {
      documentsCount: stats.documentsCount
    }
  }
}
