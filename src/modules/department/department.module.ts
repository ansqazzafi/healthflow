import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { ResponseHandler } from 'utility/success-response';
import { JwtService } from '@nestjs/jwt';
import { JwtMiddleware } from 'middlewares/verify-jwt.middlware';

@Module({
    imports: [UserModule],
    exports: [DepartmentService],
    controllers: [DepartmentController],
    providers: [ResponseHandler, JwtService, DepartmentService]
})
export class DepartmentModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(JwtMiddleware)
            .forRoutes(
                { path: 'department', method: RequestMethod.POST },
                { path: 'department', method: RequestMethod.DELETE },
            );
    }
}
