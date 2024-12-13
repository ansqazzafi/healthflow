import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { VerifyAdminGuard } from 'guards/verify-admin.guard';
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Post('accounts/verify')
  @UseGuards(VerifyAdminGuard)
  async verifyAccount(@Body() body: { Id: string }) {
    console.log('Request received:', body);
    const { Id } = body;
    const result = await this.adminService.verifyAccount(Id);
    return result;
  }
}
