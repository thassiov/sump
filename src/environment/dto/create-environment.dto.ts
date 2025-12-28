import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, IsObject } from 'class-validator';

export class CreateEnvironmentDto {
  @ApiProperty({
    description: 'Name of the environment',
    example: 'staging',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({
    description: 'Custom properties for the environment',
    example: { feature_flags: { beta_features: true } },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  customProperties?: Record<string, unknown>;
}

export class CreateEnvironmentResponseDto {
  @ApiProperty({
    description: 'UUID of the created environment',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;
}
