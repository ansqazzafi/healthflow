import { Module } from '@nestjs/common';
import { JazzcashService } from './jazzcash.service';
import { JazzcashController } from './jazzcash.controller';

@Module({
  providers: [JazzcashService],
  controllers: [JazzcashController]
})
export class JazzcashModule {}
