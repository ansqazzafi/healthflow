import { Body, Controller, Req, Post, UsePipes, Query, Get, Param, Delete } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { RegisterDto } from 'DTO/register.dto';
import { SuccessHandler } from 'interfaces/success-handler.interface';
import { CustomError } from 'utility/custom-error';
import { ResponseHandler } from 'utility/success-response';
import { Request } from 'express';
import { HashPasswordPipe } from 'pipes/hash-password.pipe';
import { Specialty } from 'enums/specialty.enum';
import { gender } from 'enums/gender.enum';
import { log } from 'node:console';
@Controller('hospital')
export class HospitalController {
    constructor(private readonly hospitalService: HospitalService,
        private readonly responseHandler: ResponseHandler,

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

    @Get()
    public async getHospitals(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('city') city?: string,
    ): Promise<SuccessHandler<any>> {
        const newPage = parseInt(page)
        const newLimit = parseInt(limit)
        const response = await this.hospitalService.getHospitals(newPage, newLimit, city)
        return this.responseHandler.successHandler(response, 'Hospitals fetched Successfully')

    }

    @Delete(':id')
    public async deleteHospital(@Param('id') id: string): Promise<SuccessHandler<any>> {
        console.log("id", id)
        const response = await this.hospitalService.deleteHospital(id)
        return this.responseHandler.successHandler(true, "Hospital Deleted Successfully")
    }




}