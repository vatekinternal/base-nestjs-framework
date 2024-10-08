import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { AppError, PaginationReq, SortReq } from './types';
import { ErrorMessage } from './error-message';

@Injectable()
export class CRUDService<T> {
  constructor(private readonly model: Model<T>) {}

  async create(createDto: Record<string, any>): Promise<Result<T, AppError>> {
    try {
      const modelInstance = new this.model(createDto);
      const createdModel = await modelInstance.save();
      return ok(createdModel as T);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_CREATING_MODEL,
        statusCode: 500,
        context: createDto,
        cause: e,
      });
    }
  }

  async findOne(conditions = {}, populates = [], projection = {}): Promise<Result<T, AppError>> {
    try {
      let queryPipeline: mongoose.Query<T, T, any, any> = this.model.findOne(
        conditions,
        projection,
      );
      populates.forEach((e) => (queryPipeline = queryPipeline.populate(e)));

      const data = await queryPipeline.lean();
      return ok(data as T);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_RETRIEVING_MODEL,
        statusCode: 500,
        cause: e,
      });
    }
  }

  async find(
    filter = {},
    populates = [],
    pagination?: PaginationReq,
    sort?: SortReq,
    projection = {},
  ): Promise<Result<T[], AppError>> {
    try {
      // const offset = (convertedPage - 1) * convertedPageSize;
      const options = {
        limit: pagination ? pagination.pageSize : undefined,
        skip: pagination ? (pagination.page - 1) * pagination.pageSize : undefined,
        sort: sort ? { [sort.field]: sort.value } : undefined,
      };
      let queryPipeline: mongoose.Query<T[], T, any, any> = this.model.find(
        filter,
        projection,
        options,
      );
      populates.forEach((e) => (queryPipeline = queryPipeline.populate(e)));

      const data = await queryPipeline.lean();

      return ok(data as T[]);
    } catch (e) {
      console.error(e);
      return err({
        message: ErrorMessage.ERROR_WHEN_RETRIEVING_MODEL,
        statusCode: 500,
        cause: e,
      });
    }
  }

  async count(filter = {}) {
    try {
      const totalRecords = await this.model.countDocuments(filter);
      return ok(totalRecords);
    } catch (e) {
      console.error(e);
      return err({
        message: ErrorMessage.ERROR_WHEN_COUNTING_MODEL,
        statusCode: 500,
        cause: e,
      });
    }
  }

  async update(id: string, updateDto: Record<string, any>): Promise<Result<T, AppError>> {
    try {
      const updatedModel = await this.model.findByIdAndUpdate(id, updateDto, { new: true }).exec();

      if (!updatedModel) {
        return err({
          message: ErrorMessage.MODEL_NOT_FOUND,
          statusCode: 404,
        });
      }

      return ok(updatedModel);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_UPDATING_MODEL,
        statusCode: 500,
        context: updateDto,
        cause: e,
      });
    }
  }

  async remove(id: string): Promise<Result<T, AppError>> {
    try {
      const removedModel = await this.model.findByIdAndDelete(id).exec();

      if (!removedModel) {
        return err({
          message: ErrorMessage.MODEL_NOT_FOUND,
          statusCode: 404,
        });
      }

      return ok(removedModel as T);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_REMOVING_MODEL,
        statusCode: 500,
        cause: e,
      });
    }
  }
}
