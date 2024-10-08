import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Admin } from 'src/auth/admin.decorator';
import { toApiErrorResp, toApiOkResp, toQueryCondition } from 'src/common/api';
import { AppError, Pagination } from 'src/common/types';
import { User } from 'src/schema/user.schema';
import { GetCommonDto } from '../common/get-common.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Admin()
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const savedOrError = await this.usersService.create(createUserDto);

    return savedOrError.match(
      (user: User) => res.status(200).json(toApiOkResp(user)),
      (e: AppError) => res.status(e.statusCode || 500).json(toApiErrorResp(e)),
    );
  }

  @Admin()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    const updateOrError = await this.usersService.update(id, updateUserDto);

    return updateOrError.match(
      (user: User) => res.status(200).json(toApiOkResp(user)),
      (e: AppError) => res.status(e.statusCode || 500).json(toApiErrorResp(e)),
    );
  }

  @Admin()
  @Get()
  @ApiQuery({
    name: 'filter',
    description:
      'Filter conditions in the format: ["field:operator:value"] - (JSON of array string - need to convert to URL before call API in code)',
    required: false,
    type: 'string',
    example: '["username:eq:admin","description:cn:first"]',
  })
  @ApiQuery({
    name: 'sort',
    description: 'Sorting conditions in the format: "field:order"',
    required: false,
    type: 'string',
    example: 'createdAt:desc',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Number of items per page',
    required: false,
    type: 'number',
  })
  async find(@Req() req: Request, @Res() res: Response, @Query() queryDto: GetCommonDto) {
    const { filter, page = 1, pageSize = 20, sort } = queryDto;
    const queryCondition = toQueryCondition(filter);
    const usersOrError = await this.usersService.find(
      queryCondition,
      [],
      { page, pageSize },
      sort,
      { password: 0 },
    );
    const countOrError = await this.usersService.count(filter);
    if (countOrError.isErr()) {
      return res.status(500).json(toApiErrorResp(countOrError.error));
    }
    const totalRecords = countOrError.value;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const pagination: Pagination = {
      page: page,
      pageSize: pageSize,
      totalPages: totalPages,
      totalRecords: totalRecords,
    };

    return usersOrError.match(
      (users: User[]) => res.status(200).json(toApiOkResp(users, pagination)),
      (e: AppError) => res.status(e.statusCode || 500).json(toApiErrorResp(e)),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const userOrError = await this.usersService.findOne({ _id: id }, [], { password: 0 });
    return userOrError.match(
      (user: User) => res.status(200).json(toApiOkResp(user)),
      (e: AppError) => res.status(e.statusCode || 500).json(toApiErrorResp(e)),
    );
  }

  @Admin()
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    const deletedOrError = await this.usersService.remove(id);
    return deletedOrError.match(
      (user: User) => res.status(200).json(toApiOkResp(user)),
      (e: AppError) => res.status(e.statusCode || 500).json(toApiErrorResp(e)),
    );
  }
}
