import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronCommand, CronJob } from 'cron';
import { ConfigService } from '../commons/config.service';
import { bind } from 'decko';
import { AnchoringService } from './anchoring.service';

@Injectable()
export class AnchoringScheduleService implements OnApplicationBootstrap {
  readonly jobs: Map<string, CronJob> = new Map();
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
    private readonly anchoringService: AnchoringService,
  ) {}

  add(schedule: string, command: CronCommand & { name: string }) {
    const job = new CronJob(schedule, command);
    this.jobs.set(command.name, job);
    this.schedulerRegistry.addCronJob(command.name, job);
    job.start();
  }

  get(command: { name: string }) {
    return this.jobs.get(command.name);
  }

  @bind()
  async triggerAnchoring() {
    await this.anchoringService.anchorRequests();
  }

  onApplicationBootstrap(): any {
    const anchoringSchedule = this.configService.current.ANCHORING_SCHEDULE;
    this.add(anchoringSchedule, this.triggerAnchoring);
  }
}
