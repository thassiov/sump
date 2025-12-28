import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateTenantAccountRoleDto {
  @ApiProperty({
    description: 'Role type',
    enum: ['owner', 'admin', 'user'],
    example: 'owner',
  })
  role!: 'owner' | 'admin' | 'user';

  @ApiProperty({
    description: 'Target type for the role',
    enum: ['tenant', 'environment'],
    example: 'tenant',
  })
  target!: 'tenant' | 'environment';

  @ApiProperty({
    description: 'UUID of the target (tenant or environment)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  targetId!: string;
}

class CreateTenantAccountDto {
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
    description: 'Password for the account',
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

  @ApiPropertyOptional({
    description: 'Roles assigned to the account',
    type: [CreateTenantAccountRoleDto],
  })
  roles?: CreateTenantAccountRoleDto[];
}

class CreateTenantDetailsDto {
  @ApiProperty({
    description: 'Name of the tenant',
    example: 'My Company',
    minLength: 2,
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Custom properties for the tenant',
    example: { tier: 'premium', region: 'us-east' },
    type: 'object',
    additionalProperties: true,
  })
  customProperties?: Record<string, unknown>;
}

class CreateEnvironmentDetailsDto {
  @ApiProperty({
    description: 'Name of the environment',
    example: 'production',
    minLength: 2,
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Custom properties for the environment',
    example: { feature_flags: { dark_mode: true } },
    type: 'object',
    additionalProperties: true,
  })
  customProperties?: Record<string, unknown>;
}

export class CreateTenantDto {
  @ApiProperty({
    description: 'Tenant details',
    type: CreateTenantDetailsDto,
  })
  tenant!: CreateTenantDetailsDto;

  @ApiProperty({
    description: 'Initial owner account for the tenant',
    type: CreateTenantAccountDto,
  })
  account!: CreateTenantAccountDto;

  @ApiPropertyOptional({
    description: 'Initial environment (defaults to "default" if not provided)',
    type: CreateEnvironmentDetailsDto,
  })
  environment?: CreateEnvironmentDetailsDto;
}

class SessionInfoDto {
  @ApiProperty({
    description: 'UUID of the session',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  id!: string;

  @ApiProperty({
    description: 'Account type',
    example: 'tenant_account',
  })
  accountType!: string;

  @ApiProperty({
    description: 'UUID of the account',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  accountId!: string;

  @ApiProperty({
    description: 'Context type',
    example: 'tenant',
  })
  contextType!: string;

  @ApiProperty({
    description: 'UUID of the context (tenant or environment)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  contextId!: string;

  @ApiProperty({
    description: 'Session expiration timestamp',
  })
  expiresAt!: Date;
}

export class CreateTenantResponseDto {
  @ApiProperty({
    description: 'UUID of the created tenant',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  tenantId!: string;

  @ApiProperty({
    description: 'UUID of the created account',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  accountId!: string;

  @ApiProperty({
    description: 'UUID of the created environment',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  environmentId!: string;

  @ApiProperty({
    description: 'Session created for the new account',
    type: SessionInfoDto,
  })
  session!: SessionInfoDto;
}
