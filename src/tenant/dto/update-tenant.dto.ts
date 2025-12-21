import { ApiPropertyOptional, ApiProperty, ApiExtraModels } from '@nestjs/swagger';

export class UpdateTenantDto {
  @ApiPropertyOptional({
    description: 'New name for the tenant',
    example: 'My Updated Company',
    minLength: 2,
  })
  name?: string;
}

@ApiExtraModels()
export class SetCustomPropertyDto {
  // This class represents a free-form object for custom properties
  // The actual structure is dynamic key-value pairs
}

export class DeleteCustomPropertyDto {
  @ApiProperty({
    description: 'Key of the custom property to delete',
    example: 'tier',
  })
  customProperty!: string;
}
