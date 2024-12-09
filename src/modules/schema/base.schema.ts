import { Prop } from '@nestjs/mongoose';
import { Schema } from 'mongoose';

export class BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: false })
  isActive: boolean;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: false })
  profilePicture?: string;

  @Prop({ required: false, default: false })
  isPhoneVerified: boolean;

  @Prop({ required: false })
  refreshToken?: string;
}
