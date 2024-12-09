import { Injectable } from '@nestjs/common';
import { RegisterHospitalDTO } from './DTO/register-hospital.dto';
import { CustomError } from 'utility/custom-error';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospital, HospitalDocument } from './hospital.schema';
@Injectable()
export class HospitalService {

    constructor(@InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument> ){}
    async register(register:RegisterHospitalDTO):Promise<any>{
        try {
            const existingHospital = await this.hospitalModel.findOne({ email: register.email });
            if (existingHospital) {
                throw new CustomError('Email already registered', 409);
            }
            const newHospital = new this.hospitalModel({
                ...register,
            });
            await newHospital.save();
            return newHospital
        } catch (error) {
            console.error(error);
            if (error instanceof CustomError) {
                throw error
            }
            throw new CustomError('Error during user registration', 500);
        }

    }

    public async login(login:any){}
}
