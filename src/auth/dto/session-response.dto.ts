import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty({
    description: 'Session ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Account type',
    enum: ['tenant_account', 'environment_account'],
    example: 'tenant_account',
  })
  accountType!: 'tenant_account' | 'environment_account';

  @ApiProperty({
    description: 'Account ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  accountId!: string;

  @ApiProperty({
    description: 'Context type (tenant or environment)',
    enum: ['tenant', 'environment'],
    example: 'tenant',
  })
  contextType!: 'tenant' | 'environment';

  @ApiProperty({
    description: 'Context ID (tenant or environment UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  contextId!: string;

  @ApiProperty({
    description: 'Session expiration date',
    example: '2025-01-27T12:00:00.000Z',
  })
  expiresAt!: Date;

  @ApiPropertyOptional({
    description: 'IP address that created the session',
    example: '192.168.1.1',
  })
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent that created the session',
    example: 'Mozilla/5.0...',
  })
  userAgent?: string;

  @ApiProperty({
    description: 'Last activity timestamp',
    example: '2025-01-01T12:00:00.000Z',
  })
  lastActiveAt!: Date;

  @ApiProperty({
    description: 'Session creation timestamp',
    example: '2025-01-01T12:00:00.000Z',
  })
  createdAt!: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Account ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  accountId!: string;

  @ApiProperty({
    description: 'Session information',
    type: SessionResponseDto,
  })
  session!: SessionResponseDto;
}
