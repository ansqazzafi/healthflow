import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service'; // Import AuthService
import { Request, Response } from 'express'; // Request and Response from Express for handling requests
import { PatientService } from '../patient/patient.service';
import { DoctorService } from '../doctor/doctor.service';
import { HospitalService } from '../hospital/hospital.service';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}
}
