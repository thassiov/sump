import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class EnvironmentSummaryDto {
  @ApiProperty({
    description: 'UUID of the environment',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Name of the environment',
    example: 'production',
  })
  name!: string;

  @ApiProperty({
    description: 'UUID of the tenant this environment belongs to',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  tenantId!: string;

  @ApiPropertyOptional({
    description: 'Custom properties',
    example: { feature_flags: { dark_mode: true } },
    type: 'object',
  })
  customProperties?: Record<string, unknown>;
}

export class TenantResponseDto {
  @ApiProperty({
    description: 'UUID of the tenant',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Name of the tenant',
    example: 'My Company',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Custom properties',
    example: { tier: 'premium' },
    type: 'object',
  })
  customProperties?: Record<string, unknown>;

  @ApiProperty({
    description: 'List of environments belonging to this tenant',
    type: [EnvironmentSummaryDto],
  })
  environments!: EnvironmentSummaryDto[];
}
