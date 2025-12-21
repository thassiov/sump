import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TenantAccountRoleDto {
  @ApiProperty({
    description: 'Role type',
    enum: ['owner', 'admin', 'user'],
    example: 'user',
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

export class CreateTenantAccountDto {
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
    type: [TenantAccountRoleDto],
  })
  roles?: TenantAccountRoleDto[];
}

export class CreateTenantAccountResponseDto {
  @ApiProperty({
    description: 'UUID of the created account',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;
}
