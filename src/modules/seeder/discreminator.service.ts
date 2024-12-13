import { Injectable } from '@nestjs/common';
import { AdminSchema, DoctorSchema, HospitalSchema, PatientCareSchema, PatientSchema, User, UserDocument } from '../user/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomError } from 'utility/custom-error';


@Injectable()
export class DiscriminatorClass {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }
    discriminatorValidator(role: string): Model<UserDocument> {
        const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

        const DiscriminatorSchema = {
            Admin: AdminSchema,
            Doctor: DoctorSchema,
            Hospital: HospitalSchema,
            PatientCare: PatientCareSchema,
            Patient: PatientSchema
        }[normalizedRole];

        if (!DiscriminatorSchema) {
            throw new CustomError(`Invalid role: ${role}`, 400);
        }

        // Create and return the model based on the role
        return this.userModel.discriminator(normalizedRole, DiscriminatorSchema);
    }
}
