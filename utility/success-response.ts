import { Injectable } from "@nestjs/common";
import { SuccessHandler } from "interfaces/success-handler.interface";
@Injectable()
export class ResponseHandler {
  successHandler(data: any, message: string, statusCode: number = 200): SuccessHandler {
    return {
      success: true,   
      statusCode,
      message,
      data,
    };
  }
}