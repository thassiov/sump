import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  ValidateNested,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

class TenantAccountRoleDto {
  @ApiProperty({
    description: 'Role type',
    enum: ['owner', 'admin', 'user'],
    example: 'user',
  })
  @IsEnum(['owner', 'admin', 'user'])
  role!: 'owner' | 'admin' | 'user';

  @ApiProperty({
    description: 'Target type for the role',
    enum: ['tenant', 'environment'],
    example: 'tenant',
  })
  @IsEnum(['tenant', 'environment'])
  target!: 'tenant' | 'environment';

  @ApiProperty({
    description: 'UUID of the target (tenant or environment)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  targetId!: string;
}

export class CreateTenantAccountDto {
  @ApiProperty({
    description: 'Full name of the account holder',
    example: 'Jane Smith',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Email address',
    example: 'jane.smith@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Username',
    example: 'janesmith',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username!: string;

  @ApiPropertyOptional({
    description: 'Phone number in E.164 format',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'URL to avatar image',
    example: 'https://example.com/avatar.png',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Roles assigned to the account',
    type: [TenantAccountRoleDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TenantAccountRoleDto)
  roles?: TenantAccountRoleDto[];
}

export class CreateTenantAccountResponseDto {
  @ApiProperty({
    description: 'UUID of the created account',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;
}
