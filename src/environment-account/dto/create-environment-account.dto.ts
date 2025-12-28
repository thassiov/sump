import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsObject, MinLength, MaxLength } from 'class-validator';

export class CreateEnvironmentAccountDto {
  @ApiProperty({
    description: 'Full name of the account holder',
    example: 'Alice Johnson',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Email address',
    example: 'alice.johnson@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Username',
    example: 'alicejohnson',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username!: string;

  @ApiProperty({
    description: 'Phone number in E.164 format',
    example: '+1234567890',
  })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({
    description: 'URL to avatar image',
    example: 'https://example.com/avatar.png',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Custom properties for the account',
    example: { preferences: { theme: 'dark' } },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  customProperties?: Record<string, unknown>;
}

export class CreateEnvironmentAccountResponseDto {
  @ApiProperty({
    description: 'UUID of the created account',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;
}
