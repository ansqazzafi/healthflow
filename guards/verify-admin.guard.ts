import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class VerifyAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log(request.user, "Request");
    if (!request.user) {
      throw new UnauthorizedException('Admin not authenticated');
    }
    if (request.user.role !== 'admin') {
      throw new ForbiddenException('Access restricted to admins');
    }

    return true;
  }
}