import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { User, UserSchema } from '../user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { ResponseHandler } from 'utility/success-response';
import { AdminController } from './admin.controller';
import { Hospital, HospitalSchema } from '../hospital/hospital.schema';
import { JwtMiddleware } from 'middlewares/verify-jwt.middlware';
import { JwtService } from '@nestjs/jwt';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Hospital.name, schema: HospitalSchema },
    ]),
  ],
  providers: [AdminService, ResponseHandler, JwtService],
  controllers: [AdminController],
})
export class AdminModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes('admin/verify');
  }
 }
