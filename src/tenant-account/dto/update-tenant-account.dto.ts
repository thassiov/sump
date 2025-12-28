import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateTenantAccountDto {
  @ApiPropertyOptional({
    description: 'New name for the account',
    example: 'Jane Smith Updated',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'New avatar URL',
    example: 'https://example.com/new-avatar.png',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class UpdateTenantAccountEmailDto {
  @ApiProperty({
    description: 'New email address',
    example: 'new.email@example.com',
  })
  @IsEmail()
  email!: string;
}

export class UpdateTenantAccountPhoneDto {
  @ApiProperty({
    description: 'New phone number in E.164 format',
    example: '+1987654321',
  })
  @IsString()
  phone!: string;
}

export class UpdateTenantAccountUsernameDto {
  @ApiProperty({
    description: 'New username',
    example: 'newusername',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username!: string;
}

export class UserDefinedIdentificationDto {
  @ApiPropertyOptional({
    description: 'Email to search by',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone to search by',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Username to search by',
    example: 'johndoe',
  })
  @IsOptional()
  @IsString()
  username?: string;
}
