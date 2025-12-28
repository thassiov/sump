import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class UpdateTenantDto {
  @ApiPropertyOptional({
    description: 'New name for the tenant',
    example: 'My Updated Company',
    minLength: 2,
  })
  name?: string;
}

/**
 * Request body for setting a custom property.
 * Pass any key-value pair where the key is a string and the value is JSON-compatible.
 * @example { "tier": "enterprise" }
 */
export class SetCustomPropertyDto {
  [key: string]: unknown;
}

export class DeleteCustomPropertyDto {
  @ApiProperty({
    description: 'Key of the custom property to delete',
    example: 'tier',
  })
  customProperty!: string;
}
