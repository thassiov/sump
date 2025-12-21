import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnvironmentAccountDto {
  @ApiProperty({
    description: 'Full name of the account holder',
    example: 'Alice Johnson',
    minLength: 3,
    maxLength: 100,
  })
  name!: string;

  @ApiProperty({
    description: 'Email address',
    example: 'alice.johnson@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Username',
    example: 'alicejohnson',
    minLength: 3,
    maxLength: 20,
  })
  username!: string;

  @ApiProperty({
    description: 'Phone number in E.164 format',
    example: '+1234567890',
  })
  phone!: string;

  @ApiPropertyOptional({
    description: 'URL to avatar image',
    example: 'https://example.com/avatar.png',
  })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Custom properties for the account',
    example: { preferences: { theme: 'dark' } },
    type: 'object',
    additionalProperties: true,
  })
  customProperties?: Record<string, unknown>;
}

export class CreateEnvironmentAccountResponseDto {
  @ApiProperty({
    description: 'UUID of the created account',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;
}
