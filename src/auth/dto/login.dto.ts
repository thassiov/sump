import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
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

  @ApiProperty({
    description: 'Password',
    example: 'SecureP@ssw0rd!',
  })
  password!: string;
}
