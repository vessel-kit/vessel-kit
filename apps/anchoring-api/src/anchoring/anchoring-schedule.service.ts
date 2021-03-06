import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronCommand, CronJob } from "cron";
import { ConfigService } from "../commons/config.service";
import { AnchoringService } from "./anchoring.service";

@Injectable()
export class AnchoringScheduleService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AnchoringScheduleService.name);
  private readonly jobs: Map<string, CronJob> = new Map();

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
    private readonly anchoringService: AnchoringService
  ) {
    this.triggerAnchoring = this.triggerAnchoring.bind(this);
  }

  add(schedule: string, command: CronCommand & { name: string }) {
    const job = new CronJob(schedule, command);
    this.jobs.set(command.name, job);
    this.schedulerRegistry.addCronJob(command.name, job);
    job.start();
  }

  get(command: { name: string }) {
    return this.jobs.get(command.name);
  }

  async triggerAnchoring() {
    this.logger.log("Trigger anchoring");
    await this.anchoringService.anchorRequests();
  }

  onApplicationBootstrap(): any {
    const anchoringSchedule = this.configService.current.ANCHORING_SCHEDULE;
    this.add(anchoringSchedule, this.triggerAnchoring);
  }
}
