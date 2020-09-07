import { Controller, Get } from '@nestjs/common';
import { Ceramic } from '@vessel-kit/vessel';

@Controller('/api/v0/stats')
export class StatsController {
  constructor(private readonly ceramic: Ceramic) {
  }

  @Get('/')
  async index() {
    const stats = await this.ceramic.list()
    return {
      documentsCount: stats.length
    }
  }
}
