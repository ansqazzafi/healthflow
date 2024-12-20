import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { User } from '../user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { ResponseHandler } from 'utility/success-response';
import { AdminController } from './admin.controller';
import { JwtMiddleware } from 'middlewares/verify-jwt.middlware';
import { JwtService } from '@nestjs/jwt';
import { TwilioModule } from '../twilio/twilio.module';
import { NodemailerModule } from 'src/modules/nodemailer/nodemailer.module';
@Module({
  imports: [
    TwilioModule,
    NodemailerModule,
    MongooseModule.forFeature([{ name: User.name, schema: User }]),
  ],
  providers: [AdminService, ResponseHandler, JwtService],
  controllers: [AdminController],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { path: 'admin', method: RequestMethod.PATCH },
        { path: 'admin/accounts/verify', method: RequestMethod.POST }
      );
  }
}
