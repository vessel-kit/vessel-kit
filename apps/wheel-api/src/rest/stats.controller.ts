import { Controller, Get } from "@nestjs/common";
import { Vessel } from "@vessel-kit/vessel";

@Controller("/api/v0/stats")
export class StatsController {
  constructor(private readonly vessel: Vessel) {}

  @Get("/")
  async index() {
    const stats = await this.vessel.list();
    return {
      documentsCount: stats.length,
    };
  }
}
