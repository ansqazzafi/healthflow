import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class VerifyAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    if (request.user.isAdmin !== true) {
      throw new ForbiddenException('Access restricted to admins');
    }

    return true;
  }
}