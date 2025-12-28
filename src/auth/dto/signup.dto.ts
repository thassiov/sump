import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class TenantSignupDto {
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

  @ApiProperty({
    description: 'Password',
    example: 'SecureP@ssw0rd!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

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
  @IsUrl()
  avatarUrl?: string;
}

export class EnvironmentSignupDto {
  @ApiProperty({
    description: 'Full name of the account holder',
    example: 'John Doe',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username!: string;

  @ApiProperty({
    description: 'Password',
    example: 'SecureP@ssw0rd!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

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
  @IsUrl()
  avatarUrl?: string;
}
