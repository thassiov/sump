import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, ValidateIf } from 'class-validator';

export class ForgotPasswordDto {
  @ApiPropertyOptional({
    description: 'Email address. At least one of email, phone, or username must be provided.',
    example: 'jane.smith@example.com',
  })
  @ValidateIf((o) => !o.phone && !o.username)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number in E.164 format. At least one of email, phone, or username must be provided.',
    example: '+1234567890',
  })
  @ValidateIf((o) => !o.email && !o.username)
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Username. At least one of email, phone, or username must be provided.',
    example: 'janesmith',
  })
  @ValidateIf((o) => !o.email && !o.phone)
  @IsString()
  @IsOptional()
  username?: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description:
      'Message indicating the request was processed. For security, this message is the same whether or not the account exists.',
    example: 'If an account exists with this identifier, a reset link has been sent.',
  })
  message!: string;
}
