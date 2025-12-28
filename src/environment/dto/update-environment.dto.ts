import { ApiProperty, ApiPropertyOptional, ApiExtraModels } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateEnvironmentDto {
  @ApiPropertyOptional({
    description: 'New name for the environment',
    example: 'production-v2',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}

@ApiExtraModels()
export class SetEnvironmentCustomPropertyDto {
  // This class represents a free-form object for custom properties
  // The actual structure is dynamic key-value pairs
}

export class DeleteEnvironmentCustomPropertyDto {
  @ApiProperty({
    description: 'Key of the custom property to delete',
    example: 'max_users',
  })
  @IsString()
  customProperty!: string;
}
