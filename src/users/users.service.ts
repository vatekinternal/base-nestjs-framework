import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Result, err, ok } from 'neverthrow';
import * as bcrypt from 'bcrypt';
import { AppError } from 'src/common/types';
import { CRUDService } from 'src/common/crud.service';
import { ErrorMessage } from 'src/common/error-message';

@Injectable()
export class UsersService extends CRUDService<User> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel);
  }

  async create(createUserDto: CreateUserDto): Promise<Result<User, AppError>> {
    try {
      const existUser = await this.userModel.findOne({ username: createUserDto.username });
      if (existUser) {
        return err({
          message: ErrorMessage.USER_NAME_HAS_BEEN_EXISTED,
          statusCode: 400,
        });
      }
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const model = new this.userModel({ ...createUserDto, password: hashedPassword });

      const user = await model.save();

      return ok(user as User);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_SAVING_USER,
        statusCode: 500,
        context: createUserDto,
        cause: e,
      });
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Result<User, AppError>> {
    try {
      const existUser = await this.userModel.findOne({ username: updateUserDto.username });
      if (existUser && existUser?._id?.toString() !== id) {
        return err({
          message: ErrorMessage.USER_NAME_HAS_BEEN_EXISTED,
          statusCode: 400,
        });
      }
      // Check if the update includes a new password
      if (updateUserDto.password) {
        // Hash the new password before updating
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      // Find the user by ID and update the fields
      const user = await this.userModel.findOneAndUpdate({ _id: id }, updateUserDto, { new: true });

      if (!user) {
        return err({
          message: ErrorMessage.USER_NOT_FOUND,
          statusCode: 404,
        });
      }

      return ok(user as User);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_UPDATING_USER,
        statusCode: 500,
        context: updateUserDto,
        cause: e,
      });
    }
  }

  async updateDevice(_id: string, deviceId: string): Promise<Result<User, AppError>> {
    try {
      // Find the user by ID and update the fields
      const user = await this.userModel.findOneAndUpdate({ _id }, { deviceId });
      if (!user) {
        return err({
          message: ErrorMessage.USER_NAME_HAS_BEEN_EXISTED,
          statusCode: 400,
        });
      }
      return ok(user as User);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_UPDATING_USER,
        statusCode: 500,
        cause: e,
      });
    }
  }

  async updateRequestTime(_id: string, time: Date): Promise<Result<User, AppError>> {
    try {
      // Find the user by ID and update the fields
      const user = await this.userModel.findOneAndUpdate({ _id }, { requestedAt: time });
      if (!user) {
        return err({
          message: ErrorMessage.USER_NOT_FOUND,
          statusCode: 404,
        });
      }
      return ok(user as User);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_UPDATING_USER,
        statusCode: 500,
        cause: e,
      });
    }
  }

  async findUserById(_id: string): Promise<User> {
    const user = await this.userModel.findOne({ _id });
    return user;
  }
}
