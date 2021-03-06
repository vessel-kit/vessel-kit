import { Module } from "@nestjs/common";
import { AnchoringScheduleService } from "./anchoring-schedule.service";
import { CommonsModule } from "../commons/commons.module";
import { AnchoringService } from "./anchoring.service";
import { StorageModule } from "../storage/storage.module";
import { IpfsService } from "./ipfs.service";

@Module({
  imports: [CommonsModule, StorageModule],
  providers: [AnchoringScheduleService, AnchoringService, IpfsService],
  exports: [AnchoringScheduleService, IpfsService],
})
export class AnchoringModule {}
