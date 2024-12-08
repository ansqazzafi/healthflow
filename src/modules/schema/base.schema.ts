import { Prop } from '@nestjs/mongoose';
import { Schema } from 'mongoose';

export class BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: false })
  isActive: boolean;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: false })
  profilePicture?: string;

  @Prop({ required: false })
  refreshToken?: string;
}
