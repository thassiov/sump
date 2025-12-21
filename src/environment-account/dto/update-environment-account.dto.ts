import { ApiProperty, ApiPropertyOptional, ApiExtraModels } from '@nestjs/swagger';

export class UpdateEnvironmentAccountDto {
  @ApiPropertyOptional({
    description: 'New name for the account',
    example: 'Alice Johnson Updated',
    minLength: 3,
    maxLength: 100,
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'New avatar URL',
    example: 'https://example.com/new-avatar.png',
  })
  avatarUrl?: string;
}

export class UpdateEnvironmentAccountEmailDto {
  @ApiProperty({
    description: 'New email address',
    example: 'new.alice@example.com',
  })
  email!: string;
}

export class UpdateEnvironmentAccountPhoneDto {
  @ApiProperty({
    description: 'New phone number in E.164 format',
    example: '+1987654321',
  })
  phone!: string;
}

export class UpdateEnvironmentAccountUsernameDto {
  @ApiProperty({
    description: 'New username',
    example: 'newalice',
    minLength: 3,
    maxLength: 20,
  })
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
  customProperty!: string;
}
