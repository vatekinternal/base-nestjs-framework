import { Role } from 'src/schema/user.schema';

export interface IUserRequest {
  userId: string;
  role: Role;
  deviceId: string;
  iat: number;
  exp: number;
}
