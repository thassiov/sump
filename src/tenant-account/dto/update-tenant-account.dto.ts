import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTenantAccountDto {
  @ApiPropertyOptional({
    description: 'New name for the account',
    example: 'Jane Smith Updated',
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

export class UpdateTenantAccountEmailDto {
  @ApiProperty({
    description: 'New email address',
    example: 'new.email@example.com',
  })
  email!: string;
}

export class UpdateTenantAccountPhoneDto {
  @ApiProperty({
    description: 'New phone number in E.164 format',
    example: '+1987654321',
  })
  phone!: string;
}

export class UpdateTenantAccountUsernameDto {
  @ApiProperty({
    description: 'New username',
    example: 'newusername',
    minLength: 3,
    maxLength: 20,
  })
  username!: string;
}

export class UserDefinedIdentificationDto {
  @ApiPropertyOptional({
    description: 'Email to search by',
    example: 'user@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone to search by',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Username to search by',
    example: 'johndoe',
  })
  username?: string;
}
