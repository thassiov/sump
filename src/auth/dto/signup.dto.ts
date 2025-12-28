import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TenantSignupDto {
  @ApiProperty({
    description: 'Full name of the account holder',
    example: 'Jane Smith',
    minLength: 3,
    maxLength: 100,
  })
  name!: string;

  @ApiProperty({
    description: 'Email address',
    example: 'jane.smith@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Username',
    example: 'janesmith',
    minLength: 3,
    maxLength: 20,
  })
  username!: string;

  @ApiProperty({
    description: 'Password',
    example: 'SecureP@ssw0rd!',
    minLength: 8,
  })
  password!: string;

  @ApiPropertyOptional({
    description: 'Phone number in E.164 format',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'URL to avatar image',
    example: 'https://example.com/avatar.png',
  })
  avatarUrl?: string;
}

export class EnvironmentSignupDto {
  @ApiProperty({
    description: 'Full name of the account holder',
    example: 'John Doe',
    minLength: 3,
    maxLength: 100,
  })
  name!: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
    minLength: 3,
    maxLength: 20,
  })
  username!: string;

  @ApiProperty({
    description: 'Password',
    example: 'SecureP@ssw0rd!',
    minLength: 8,
  })
  password!: string;

  @ApiPropertyOptional({
    description: 'Phone number in E.164 format',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'URL to avatar image',
    example: 'https://example.com/avatar.png',
  })
  avatarUrl?: string;
}
