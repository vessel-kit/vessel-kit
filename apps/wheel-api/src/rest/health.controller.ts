import { Controller, Get } from "@nestjs/common";

import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from "@nestjs/terminus";

const MEGABYTE = 1024 * 1024;
const MEMORY_HEAP_THRESHOLD = 200 * MEGABYTE;
const MEMORY_RSS_THRESHOLD = 3000 * MEGABYTE;

@Controller("/api/v0/health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mem: MemoryHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  async readiness() {
    return this.health.check([
      // async () => this.db.pingCheck('database', { timeout: 300 }),
      async () => this.mem.checkHeap("memory_heap", MEMORY_HEAP_THRESHOLD),
      async () => this.mem.checkRSS("memory_rss", MEMORY_RSS_THRESHOLD),
    ]);
  }
}
