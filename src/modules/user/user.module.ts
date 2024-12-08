import { Module } from '@nestjs/common';
import { UserSchema, User } from '../user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseHandler } from 'utility/success-response';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserService, ResponseHandler],
  controllers: [],
})
export class UserModule {}
