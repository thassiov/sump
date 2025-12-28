import { ApiProperty, ApiPropertyOptional, ApiExtraModels } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateEnvironmentAccountDto {
  @ApiPropertyOptional({
    description: 'New name for the account',
    example: 'Alice Johnson Updated',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'New avatar URL',
    example: 'https://example.com/new-avatar.png',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class UpdateEnvironmentAccountEmailDto {
  @ApiProperty({
    description: 'New email address',
    example: 'new.alice@example.com',
  })
  @IsEmail()
  email!: string;
}

export class UpdateEnvironmentAccountPhoneDto {
  @ApiProperty({
    description: 'New phone number in E.164 format',
    example: '+1987654321',
  })
  @IsString()
  phone!: string;
}

export class UpdateEnvironmentAccountUsernameDto {
  @ApiProperty({
    description: 'New username',
    example: 'newalice',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username!: string;
}

@ApiExtraModels()
export class SetEnvironmentAccountCustomPropertyDto {
  // This class represents a free-form object for custom properties
  // The actual structure is dynamic key-value pairs
}

export class DeleteEnvironmentAccountCustomPropertyDto {
  @ApiProperty({
    description: 'Key of the custom property to delete',
    example: 'subscription',
  })
  @IsString()
  customProperty!: string;
}
