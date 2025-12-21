import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TenantAccountRoleResponseDto {
  @ApiProperty({
    description: 'Role type',
    enum: ['owner', 'admin', 'user'],
    example: 'admin',
  })
  role!: 'owner' | 'admin' | 'user';

  @ApiProperty({
    description: 'Target type for the role',
    enum: ['tenant', 'environment'],
    example: 'tenant',
  })
  target!: 'tenant' | 'environment';

  @ApiProperty({
    description: 'UUID of the target',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  targetId!: string;
}

export class TenantAccountResponseDto {
  @ApiProperty({
    description: 'UUID of the account',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
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
  })
  username!: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.png',
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'UUID of the tenant',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  tenantId!: string;

  @ApiProperty({
    description: 'Assigned roles',
    type: [TenantAccountRoleResponseDto],
  })
  roles!: TenantAccountRoleResponseDto[];
}
