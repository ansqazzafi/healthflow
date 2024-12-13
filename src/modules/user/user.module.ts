import { forwardRef, Module } from '@nestjs/common';
import { Admin, AdminSchema, DiscriminatorUserModel, User, UserSchema } from '../user/user.schema';
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
    MongooseModule.forFeatureAsync([{ name: User.name, useFactory:()=>{
      const schema = UserSchema;
      const discriminator = DiscriminatorUserModel(schema)
      return discriminator
    }  }]),
  ],
  controllers: [],
  providers: [UserService, ResponseHandler],
  exports:[UserService, MongooseModule]

})
export class UserModule {}
