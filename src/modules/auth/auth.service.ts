import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ResponseHandler } from 'utility/success-response';
import { CustomError } from 'utility/custom-error';
import { TwilioService } from '../twilio/twilio.service';
import { DoctorService } from '../doctor/doctor.service';
import { HospitalService } from '../hospital/hospital.service';
import { LoginInDTO } from 'DTO/login.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
    constructor(
        private readonly twilioService: TwilioService,
        private readonly doctorService: DoctorService,
        private readonly hospitalService: HospitalService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) { }

    c
    public removeFields(obj: any, fields: string[]): any {
        const removedFields = { ...obj };
        fields.forEach(field => delete removedFields[field]);
        return removedFields;
    }


    public async generateAccessToken(user): Promise<string> {
        const payload = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        };
        const secretKey = process.env.ACCESS_KEY;
        const expiresIn = process.env.ACCESS_KEY_EXPIRE || '30s';
        return this.jwtService.signAsync(payload, { secret: secretKey, expiresIn });
    }

    public async generateRefreshToken(user): Promise<string> {
        const payload = { id: user._id };
        const secretKey = process.env.REFRESH_KEY;
        const expiresIn = process.env.REFRESH_KEY_EXPIRE || '30d';
        return this.jwtService.signAsync(payload, { secret: secretKey, expiresIn });
    }



    public async register(RegisterDto: any): Promise<boolean> {
        const { role, ...details } = RegisterDto;
        let response;
        switch (role) {
            case 'patient':
                response = await this.userService.register(details.patient, role);
                if (response) {
                    return true
                }
                throw new CustomError("Patient registration failed", 500);

            case 'doctor':
                response = await this.doctorService.register(details.doctor);
                if (response) {
                    return true
                }
                throw new CustomError("Doctor registration failed", 500);
            case 'hospital':
                response = await this.hospitalService.register(details.hospital);
                if (response) {
                    return true;
                }
                throw new CustomError("Hospital registration failed", 500);
            default:
                throw new CustomError("Invalid Role", 401);
        }
    }

    public async login(LoginDto: LoginInDTO): Promise<any> {
        const { role, ...LoginDetails } = LoginDto;
        let response;
        switch (role) {
            case 'patient':
                response = await this.userService.login(LoginDetails, role);
                if (response) {
                    return response
                }
                throw new CustomError("Patient login failed", 500);

            case 'doctor':
                response = await this.doctorService.login(LoginDetails);
                if (response) {
                    return response
                }
                throw new CustomError("Doctor login failed", 500);
            case 'hospital':
                response = await this.hospitalService.login(LoginDetails);
                if (response) {
                    return response;
                }
                throw new CustomError("Hospital login failed", 500);
            default:
                throw new CustomError("Invalid Role", 401);
        }

    }
}
