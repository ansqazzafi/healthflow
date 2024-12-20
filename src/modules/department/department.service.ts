import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import { CustomError } from 'utility/custom-error';
import { HospitalDepartment } from 'enums/departments.enum';

@Injectable()
export class DepartmentService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }
    public async addDepartment(id: string, departments: HospitalDepartment[]): Promise<any> {
        try {
            const hospital = await this.userModel.findById(id);
            if (!hospital) {
                throw new CustomError("Hospital not found", 404);
            }
            const newDepartments = departments.filter(department =>
                !hospital.departments.includes(department)
            );

            if (newDepartments.length === 0) {
                return { success: false, message: "No new departments to add" };
            }

            hospital.departments = [...hospital.departments, ...newDepartments];

            await hospital.save();

            return { success: true, message: "Departments updated successfully" };
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("There is an error during the addition of Department to hospital", 500);
        }
    }

    public async deleteDepartment(id: string, deletedDepartments: HospitalDepartment[]): Promise<any> {
        try {
            const hospital = await this.userModel.findByIdAndUpdate(
                id,
                {
                    $pull: {
                        departments: { $in: deletedDepartments }
                    }
                },
                { new: true }
            );

            if (!hospital) {
                throw new CustomError("Hospital not found", 404);
            }

            const remainingDepartments = hospital.departments;
            for (const department of deletedDepartments) {
                if (remainingDepartments.includes(department)) {
                    throw new CustomError(`Department ${department} not removed, try again later`, 401);
                }
            }

            return true
        } catch (error) {
            throw new CustomError("There was an error during the deletion of departments from the hospital", 500);
        }
    }

    public async findDepartments(id: string, role: string): Promise<any> {
        try {
            const hospital = await this.userModel.findById(id)
            if (hospital.role !== role) {
                throw new CustomError("Access Denied", 402)
            }
            const departments = hospital.departments
            return departments
        } catch (error) {
            if (error instanceof CustomError) {
                throw error
            }
            throw new CustomError("There is an error during fetch departments", 500)
        }
    }

}
