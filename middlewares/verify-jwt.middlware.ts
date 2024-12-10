import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { roles } from 'enums/role.enum';
import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from 'src/modules/doctor/doctor.schema';
import { Hospital, HospitalDocument } from 'src/modules/hospital/hospital.schema';
import { User, UserDocument } from 'src/modules/user/user.schema';
import { CustomError } from 'utility/custom-error';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
        private readonly jwtService: JwtService,
    ) { }
    private async getUserByRole(role: string, _id: string) {
        let entity;

        switch (role) {
            case roles.hospital:
                entity = await this.hospitalModel.findById(_id).select("-password -refreshToken");
                break;
            case roles.patient:
            case roles.patientCare:
            case roles.admin:
                entity = await this.userModel.findById(_id).select("-password -refreshToken");
                break;
            default:
                throw new CustomError("Invalid role in access token", 401);
        }
        return entity;
    }
    async use(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies?.accessToken;
            console.log(token , "Token from cookies")
            if (!token) {
                throw new CustomError("Unauthorized request", 401);
            }
            const decodedToken = await this.jwtService.verifyAsync(token, {
                secret: process.env.ACCESS_KEY,
            });
            console.log(decodedToken , "Token");
            

            const { _id, role } = decodedToken.credentials;
            if (!role || !_id) {
                throw new CustomError("Invalid access token: missing role or user ID", 401);
            }
            const entity = await this.getUserByRole(role, _id);

            if (!entity) {
                throw new CustomError("Invalid Access Token or user not found", 401);
            }
            req.entity = entity;
            next();
        } catch (error) {
            throw new CustomError(error?.message || "Invalid access token", 401);
        }
    }
}
