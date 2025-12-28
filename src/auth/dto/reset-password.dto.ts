import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The password reset token received via email/SMS',
    example: 'a1b2c3d4e5f6...',
  })
  @IsString()
  token!: string;

  @ApiProperty({
    description: 'The new password (min 8 characters)',
    example: 'NewSecureP@ssw0rd!',
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Whether the password was successfully reset',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Message describing the result',
    example: 'Password has been reset successfully. Please log in with your new password.',
  })
  message!: string;
}
