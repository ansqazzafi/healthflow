import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/modules/user/user.schema';
import { CustomError } from 'utility/custom-error';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly jwtService: JwtService,
    ) { }

    private async getUser( _id: string) {
        let user = await this.userModel.findById(_id).select("-password -refreshToken");
        if (!user) {
            throw new CustomError("User role does not match", 403);
        }
        return user;
    }

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies?.accessToken;
            if (!token) {
                throw new CustomError("Unauthorized request", 401);
            }

            const decodedToken = await this.jwtService.verifyAsync(token, {
                secret: process.env.ACCESS_KEY,
            });

            const { _id, role } = decodedToken.credentials;
            if (!role || !_id) {
                throw new CustomError("Invalid access token: missing role or user ID", 401);
            }

            const user = await this.getUser(_id);
            if (!user) {
                throw new CustomError("Invalid Access Token or user not found", 401);
            }
            req.user = user;
            next();
        } catch (error) {
            throw new CustomError(error?.message || "Invalid access token", 401);
        }
    }
}
