import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({
    description: 'Email address (use email, phone, or username)',
    example: 'jane.smith@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number in E.164 format (use email, phone, or username)',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Username (use email, phone, or username)',
    example: 'janesmith',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Password',
    example: 'SecureP@ssw0rd!',
  })
  @IsString()
  password!: string;
}
