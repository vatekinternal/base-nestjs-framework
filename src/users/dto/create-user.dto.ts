import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsBoolean,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';
import { Role } from 'src/schema/user.schema';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: string;

  @ApiProperty({ type: [String], description: 'Array id-string of categories' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Each permission must be a string' })
  @IsNotEmpty({ each: true, message: 'Each permission must be not empty string' })
  permissions: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username must only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsOptional()
  // @IsPhoneNumber()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPermittedEdit?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
