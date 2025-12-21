import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnvironmentAccountResponseDto {
  @ApiProperty({
    description: 'UUID of the account',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Full name',
    example: 'Alice Johnson',
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
  })
  username!: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
  })
  phone!: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.png',
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'UUID of the environment',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  environmentId!: string;

  @ApiPropertyOptional({
    description: 'Custom properties',
    example: { preferences: { theme: 'dark' } },
    type: 'object',
  })
  customProperties?: Record<string, unknown>;
}
