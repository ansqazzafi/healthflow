import { Body, Controller, Req, Post, UsePipes, Query, Get, ParseIntPipe } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { RegisterDto } from 'DTO/register.dto';
import { SuccessHandler } from 'interfaces/success-handler.interface';
import { CustomError } from 'utility/custom-error';
import { ResponseHandler } from 'utility/success-response';
import { Request } from 'express';
import { HashPasswordPipe } from 'pipes/hash-password.pipe';
import { Specialty } from 'enums/specialty.enum';
import { parse } from 'path';
import { address } from 'interfaces/address.interface';
import { gender } from 'enums/gender.enum';
@Controller('hospital')
export class HospitalController {
    constructor(private readonly hospitalService: HospitalService,
        private readonly responseHandler: ResponseHandler
    ) { }

    @Post('register-doctor')
    @UsePipes(HashPasswordPipe)
    public async registerDoctor(@Body() RegisterDto: RegisterDto, @Req() req: Request): Promise<SuccessHandler<any>> {
        const { role, ...details } = RegisterDto
        const { id } = req.entity
        console.log("RegisterDTo", RegisterDto, id)
        if (req.entity.role !== "hospital") {
            throw new CustomError("You cannot register Doctor")
        }
        try {
            const response = await this.hospitalService.registerDoctor(details.doctor, id)
            console.log("controller", response)
            if (!response) {
                throw new CustomError("Unable to Registered the Doctor", 401)
            }
            return this.responseHandler.successHandler(true, "Doctor registered SuccessFully")
        } catch (error) {
            if (error instanceof CustomError) {
                throw error
            }
            throw new CustomError("There is an error during register doctor", 402)
        }
    }

    @Get('doctors')
    public async getDoctors(
        @Req() req: Request,
        @Query('page') page: string = "1",
        @Query('limit') limit: string = "10",
        @Query('specialty') specialty?: Specialty,
        @Query('city') city?: string,  
        @Query('gender') gender?: gender,  
    ): Promise<SuccessHandler<any>> {
        console.log(req.query, 'f')
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        console.log(typeof (page), limit , city ,"rere")
        const { id } = req.entity;
        if (req.entity.role !== "hospital") {
            throw new CustomError("You are not authorized to view doctors");
        }
        try {
            const response = await this.hospitalService.getDoctorsByHospital(id, pageNumber, limitNumber, specialty, city, gender);
            return this.responseHandler.successHandler(response, "Doctors retrieved successfully");
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("There was an error fetching the doctors", 500);
        }
    }




}
// hospital/doctors?specialty=cardiology&page=1&limit=10