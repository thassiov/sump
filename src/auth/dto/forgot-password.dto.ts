import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiPropertyOptional({
    description: 'Email address (use email, phone, or username)',
    example: 'jane.smith@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number in E.164 format (use email, phone, or username)',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Username (use email, phone, or username)',
    example: 'janesmith',
  })
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
