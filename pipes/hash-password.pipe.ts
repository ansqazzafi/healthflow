import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CustomError } from 'utility/custom-error';

@Injectable()
export class HashPasswordPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const role = value.role;
    const entity = value[role];
    if (entity?.password) {
      entity.password = await bcrypt.hash(entity.password, 10);
    }
    else if (value.newPassword) {
      value.newPassword = await bcrypt.hash(value.newPassword, 10);
    }
    else {
      throw new CustomError("Password Fields are missing", 401)
    }

    return value;
  }
}
