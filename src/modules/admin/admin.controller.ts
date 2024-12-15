import { Controller, Post, Body, UseGuards, Req, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { VerifyAdminGuard } from 'guards/verify-admin.guard';
import { SuccessHandler } from 'interfaces/success-handler.interface';
import { CustomError } from 'utility/custom-error';
import { ResponseHandler } from 'utility/success-response';
import { Request } from 'express';
import { roles } from 'enums/role.enum';
import { UpdateAdminDTO } from './DTO/updatedto copy';
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService,
    private readonly responseHandler:ResponseHandler
  ) {}

  @Post('accounts/verify')
  @UseGuards(VerifyAdminGuard)
  async verifyAccount(@Body() body: { Id: string }) {
    console.log('Request received:', body);
    const { Id } = body;
    const result = await this.adminService.verifyAccount(Id);
    return result;
  }

  @Patch()
  public async updateProfile(
    @Body() updateDto: UpdateAdminDTO,
    @Req() req: Request,
  ): Promise<SuccessHandler<any>> {
    const { id, role } = req.user;
    console.log(id, role, 'hit the point');

    if (role !== roles.admin) {
      throw new CustomError('you Cannot Update the Admin');
    }
    const response = await this.adminService.updateProfile(id, updateDto);
    return this.responseHandler.successHandler(
      response,
      'Admin profile updated',
    );
  }
}
