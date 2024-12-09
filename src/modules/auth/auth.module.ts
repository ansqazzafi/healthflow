import { forwardRef, Module } from '@nestjs/common';
// import { UserService } from '../user/user.service';
// import { TwilioService } from '../twilio/twilio.service';
// import { DoctorService } from '../doctor/doctor.service';
// import { HospitalService } from '../hospital/hospital.service';
import { ResponseHandler } from 'utility/success-response';
import { UserModule } from '../user/user.module';
import { TwilioModule } from '../twilio/twilio.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TwilioService } from '../twilio/twilio.service';
import { HospitalService } from '../hospital/hospital.service';
import { DoctorService } from '../doctor/doctor.service';
import { HospitalModule } from '../hospital/hospital.module';
import { DoctorModule } from '../doctor/doctor.module';
import { JwtService } from '@nestjs/jwt';
import { GlobalAuth } from 'src/common/services/global-auth.service';
@Module({
    imports: [TwilioModule, HospitalModule, DoctorModule,
        UserModule
    ],
    controllers: [AuthController],
    providers: [ResponseHandler, AuthService, JwtService, GlobalAuth],
    exports:[AuthService]
})
export class AuthModule { }
