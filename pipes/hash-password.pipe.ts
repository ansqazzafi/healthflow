import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CustomError } from 'utility/custom-error';

@Injectable()
export class HashPasswordPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!value.password) {
      throw new CustomError('Password is required', 401);
    }
    const hashedPassword = await bcrypt.hash(value.password, 10);
    value.password = hashedPassword;
    return value;
  }
}
