import { Module } from "@nestjs/common";
import { AppController } from "src/app.controller";
import { AppService } from "src/app.service";
import { CampaignsModule } from "src/campaigns/campaigns.module";
import { DatabaseModule } from "src/database/database.module";
import { TrackingModule } from "src/tracking/tracking.module";
import { UnsubscribeModule } from "src/unsubscribe/unsubscribe.module";


@Module({
  imports: [
    DatabaseModule,
    CampaignsModule,
    TrackingModule,
    UnsubscribeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}