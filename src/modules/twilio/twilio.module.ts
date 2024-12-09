import { forwardRef, Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';

@Module({
    imports:[
        forwardRef(()=>UserModule)
    ],
    controllers:[],
    providers:[TwilioService ],
    exports:[TwilioService]
})
export class TwilioModule {}
