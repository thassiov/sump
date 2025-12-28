import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

/**
 * Request body for setting a custom property on an environment.
 * Pass any key-value pair where the key is a string and the value is JSON-compatible.
 * @example { "max_users": 100 }
 */
export class SetEnvironmentCustomPropertyDto {
  [key: string]: unknown;
}

export class DeleteEnvironmentCustomPropertyDto {
  @ApiProperty({
    description: 'Key of the custom property to delete',
    example: 'max_users',
  })
  @IsString()
  customProperty!: string;
}
