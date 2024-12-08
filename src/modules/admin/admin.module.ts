import { Module } from '@nestjs/common';
import { User, UserSchema } from '../user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { ResponseHandler } from 'utility/success-response';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [AdminService, ResponseHandler],
  controllers: [AdminController],
})
export class AdminModule {}
