import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import * as mongooseTimestamp from 'mongoose-timestamp';

export type UserDocument = HydratedDocument<User>;

export enum Role {
  Admin = 'admin',
  User = 'user',
}

@Schema({ collection: 'user' })
export class User extends Document {
  @Prop({ enum: Role })
  role: Role;

  @Prop(String)
  accountName: string;

  @Prop({ unique: true })
  username: string;

  @Prop(String)
  password: string;

  @Prop(String)
  phone: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop(Date)
  requestedAt: Date;

  @Prop(String)
  description: string;

  @Prop(String)
  deviceId: string;
}

const userSchema = SchemaFactory.createForClass(User);

userSchema.plugin(mongooseTimestamp);

export { userSchema };
