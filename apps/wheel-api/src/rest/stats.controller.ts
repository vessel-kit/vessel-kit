import { Controller, Get } from '@nestjs/common';
import { Ceramic } from '@potter/vessel';

@Controller('/api/v0/stats')
export class StatsController {
  constructor(private readonly ceramic: Ceramic) {
  }

  @Get('/')
  async index() {
    // const stats = await this.ceramic.stats()
    // return {
    //   documentsCount: stats.documentsCount
    // }
    return {
      documentsCount: 'N/A'
    }
  }
}
