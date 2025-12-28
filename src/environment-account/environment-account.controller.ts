import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { EnvironmentAccountUseCase } from '../core/use-cases/environment-account.use-case';
import {
  ICreateEnvironmentAccountDto,
  IUpdateEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
} from '../core/types/environment-account/dto.type';
import { IEnvironmentAccount } from '../core/types/environment-account/environment-account.type';
import {
  CreateEnvironmentAccountDto,
  CreateEnvironmentAccountResponseDto,
  UpdateEnvironmentAccountDto,
  UpdateEnvironmentAccountEmailDto,
  UpdateEnvironmentAccountPhoneDto,
  UpdateEnvironmentAccountUsernameDto,
  SetEnvironmentAccountCustomPropertyDto,
  DeleteEnvironmentAccountCustomPropertyDto,
  EnvironmentAccountResponseDto,
} from './dto';
import { AuthGuard, RolesGuard } from '../auth/guards';
import { RequireRoles, AllowOwner, EnvironmentResource } from '../auth/decorators';

@ApiTags('Environment Accounts')
@Controller('environments/:environmentId/accounts')
@EnvironmentResource('environmentId')
export class EnvironmentAccountController {
  constructor(
    private readonly environmentAccountUseCase: EnvironmentAccountUseCase
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Sign up for an environment',
    description: 'Creates a new user account within the specified environment. This is a public endpoint for user registration.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiBody({ type: CreateEnvironmentAccountDto })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: CreateEnvironmentAccountResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email/username/phone already in use' })
  async createAccount(
    @Param('environmentId') environmentId: string,
    @Body() dto: ICreateEnvironmentAccountDto
  ) {
    return this.environmentAccountUseCase.createNewAccount(environmentId, dto);
  }

  @Get(':accountId')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles(
    { role: 'owner', target: 'environment', targetId: ':environmentId' },
    { role: 'admin', target: 'environment', targetId: ':environmentId' },
    { role: 'user', target: 'environment', targetId: ':environmentId' }
  )
  @AllowOwner()
  @ApiOperation({
    summary: 'Get account by ID and environment ID',
    description: 'Retrieves an account by its UUID within the specified environment.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiResponse({
    status: 200,
    description: 'Account found',
    type: EnvironmentAccountResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getAccountById(
    @Param('environmentId') environmentId: string,
    @Param('accountId') accountId: string
  ) {
    const account =
      await this.environmentAccountUseCase.getAccountByIdAndTenantEnvironmentId(
        accountId,
        environmentId
      );
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  @Delete(':accountId')
  @UseGuards(AuthGuard, RolesGuard)
  @AllowOwner()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete own account',
    description: 'Allows a user to delete their own account. Admins cannot delete user accounts (use disable instead).',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - you can only delete your own account' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async deleteAccount(
    @Param('environmentId') environmentId: string,
    @Param('accountId') accountId: string
  ) {
    return this.environmentAccountUseCase.deleteAccountByIdAndTenantEnvironmentId(
      accountId,
      environmentId
    );
  }

  @Patch(':accountId')
  @UseGuards(AuthGuard, RolesGuard)
  @AllowOwner()
  @ApiOperation({
    summary: 'Update own account properties',
    description: 'Updates account properties like name and avatar URL. Users can only update their own account.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateEnvironmentAccountDto })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - you can only update your own account' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async updateAccount(
    @Param('environmentId') environmentId: string,
    @Param('accountId') accountId: string,
    @Body() dto: IUpdateEnvironmentAccountNonSensitivePropertiesDto
  ) {
    return this.environmentAccountUseCase.updateAccountNonSensitivePropertiesByIdAndTenantEnvironmentId(
      accountId,
      environmentId,
      dto
    );
  }

  @Patch(':accountId/email')
  @UseGuards(AuthGuard, RolesGuard)
  @AllowOwner()
  @ApiOperation({
    summary: 'Update own email',
    description: 'Updates the email address. Users can only update their own email.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateEnvironmentAccountEmailDto })
  @ApiResponse({ status: 200, description: 'Email updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - you can only update your own email' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async updateAccountEmail(
    @Param('environmentId') environmentId: string,
    @Param('accountId') accountId: string,
    @Body() dto: IUpdateTenantEnvironmentAccountEmailDto
  ) {
    return this.environmentAccountUseCase.updateAccountEmailByIdAndTenantEnvironmentId(
      accountId,
      environmentId,
      dto
    );
  }

  @Patch(':accountId/phone')
  @UseGuards(AuthGuard, RolesGuard)
  @AllowOwner()
  @ApiOperation({
    summary: 'Update own phone',
    description: 'Updates the phone number. Users can only update their own phone.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateEnvironmentAccountPhoneDto })
  @ApiResponse({ status: 200, description: 'Phone updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - you can only update your own phone' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Phone already in use' })
  async updateAccountPhone(
    @Param('environmentId') environmentId: string,
    @Param('accountId') accountId: string,
    @Body() dto: IUpdateTenantEnvironmentAccountPhoneDto
  ) {
    return this.environmentAccountUseCase.updateAccountPhoneByIdAndTenantEnvironmentId(
      accountId,
      environmentId,
      dto
    );
  }

  @Patch(':accountId/username')
  @UseGuards(AuthGuard, RolesGuard)
  @AllowOwner()
  @ApiOperation({
    summary: 'Update own username',
    description: 'Updates the username. Users can only update their own username.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateEnvironmentAccountUsernameDto })
  @ApiResponse({ status: 200, description: 'Username updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - you can only update your own username' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Username already in use' })
  async updateAccountUsername(
    @Param('environmentId') environmentId: string,
    @Param('accountId') accountId: string,
    @Body() dto: IUpdateTenantEnvironmentAccountUsernameDto
  ) {
    return this.environmentAccountUseCase.updateAccountUsernameByIdAndTenantEnvironmentId(
      accountId,
      environmentId,
      dto
    );
  }

  @Patch(':accountId/custom-property')
  @UseGuards(AuthGuard, RolesGuard)
  @AllowOwner()
  @ApiOperation({
    summary: 'Set custom property on own account',
    description: 'Sets or updates a custom property. Users can only set properties on their own account.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: SetEnvironmentAccountCustomPropertyDto })
  @ApiResponse({ status: 200, description: 'Custom property set successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - you can only set properties on your own account' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async setCustomProperty(
    @Param('environmentId') environmentId: string,
    @Param('accountId') accountId: string,
    @Body() customProperty: IEnvironmentAccount['customProperties']
  ) {
    return this.environmentAccountUseCase.setAccountCustomPropertyByIdAndTenantEnvironmentId(
      accountId,
      environmentId,
      customProperty
    );
  }

  @Delete(':accountId/custom-property')
  @UseGuards(AuthGuard, RolesGuard)
  @AllowOwner()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete custom property from own account',
    description: 'Removes a custom property. Users can only delete properties from their own account.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: DeleteEnvironmentAccountCustomPropertyDto })
  @ApiResponse({ status: 204, description: 'Custom property deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - you can only delete properties from your own account' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async deleteCustomProperty(
    @Param('environmentId') environmentId: string,
    @Param('accountId') accountId: string,
    @Body('customProperty') customPropertyKey: string
  ) {
    return this.environmentAccountUseCase.deleteAccountCustomPropertyByIdAndTenantEnvironmentId(
      accountId,
      environmentId,
      customPropertyKey
    );
  }

  @Patch(':accountId/disable')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles(
    { role: 'owner', target: 'environment', targetId: ':environmentId' },
    { role: 'admin', target: 'environment', targetId: ':environmentId' }
  )
  @ApiOperation({
    summary: 'Disable an account',
    description: 'Disables an account. Only environment admins/owners can disable accounts. Disabled accounts cannot log in.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account to disable' })
  @ApiResponse({ status: 200, description: 'Account disabled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or owner role required' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async disableAccount(
    @Param('environmentId') environmentId: string,
    @Param('accountId') accountId: string
  ) {
    return this.environmentAccountUseCase.disableAccountByIdAndEnvironmentId(
      accountId,
      environmentId
    );
  }

  @Patch(':accountId/enable')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles(
    { role: 'owner', target: 'environment', targetId: ':environmentId' },
    { role: 'admin', target: 'environment', targetId: ':environmentId' }
  )
  @ApiOperation({
    summary: 'Enable a disabled account',
    description: 'Re-enables a previously disabled account. Only environment admins/owners can enable accounts.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account to enable' })
  @ApiResponse({ status: 200, description: 'Account enabled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or owner role required' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async enableAccount(
    @Param('environmentId') environmentId: string,
    @Param('accountId') accountId: string
  ) {
    return this.environmentAccountUseCase.enableAccountByIdAndEnvironmentId(
      accountId,
      environmentId
    );
  }
}
