import { Role, User } from 'src/schema/user.schema';
import { Request } from 'express';

export type AppError = {
  message: string;
  statusCode?: number;
  error?: string;
  context?: Record<string, any>;
  cause?: any;
};

export type PaginationReq = {
  page: number;
  pageSize: number;
};

export type SortReq = {
  field: string;
  value: string; //'DESC' | 'ASC'
};

export type Pagination = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
};

export type JwtPayload = {
  userId: string;
  role: Role;
  deviceId: string;
};

export interface CustomRequest extends Request {
  user: JwtPayload;
}

export enum Operator {
  EQ = 'eq', //Equal to
  NE = 'ne', //Not equal to
  LT = 'lt', //Less than
  GT = 'gt', //Greater than
  LE = 'le', //Less than or equal
  GE = 'ge', //Greater than or equal
  IN = 'in', //In
  NI = 'ni', //	Not in
  SW = 'sw', //Starts with
  CN = 'cn', //	Contains
}

export type FilterItem = {
  field: string;
  operator: string;
  value: string;
};
