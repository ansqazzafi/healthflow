import { forwardRef, Module } from '@nestjs/common';
import { UserSchema, User } from '../user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseHandler } from 'utility/success-response';
import { UserService } from './user.service';
import { TwilioService } from '../twilio/twilio.service';
import { TwilioModule } from '../twilio/twilio.module';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [
    forwardRef(()=>TwilioModule),
    forwardRef(()=>AuthModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [],
  providers: [UserService, ResponseHandler],
  exports:[UserService]

})
export class UserModule {}
