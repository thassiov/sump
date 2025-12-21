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

@ApiTags('Environment Accounts')
@Controller('environments/:environmentId/accounts')
export class EnvironmentAccountController {
  constructor(
    private readonly environmentAccountUseCase: EnvironmentAccountUseCase
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new account in an environment',
    description: 'Creates a new user account within the specified environment.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiBody({ type: CreateEnvironmentAccountDto })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: CreateEnvironmentAccountResponseDto,
  })
  async createAccount(
    @Param('environmentId') environmentId: string,
    @Body() dto: ICreateEnvironmentAccountDto
  ) {
    return this.environmentAccountUseCase.createNewAccount(environmentId, dto);
  }

  @Get(':accountId')
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete account by ID and environment ID',
    description: 'Deletes an account from the specified environment.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
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
  @ApiOperation({
    summary: 'Update account non-sensitive properties',
    description: 'Updates allowed account properties like name and avatar URL.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateEnvironmentAccountDto })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
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
  @ApiOperation({
    summary: 'Update account email',
    description: 'Updates the email address for the specified account.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateEnvironmentAccountEmailDto })
  @ApiResponse({ status: 200, description: 'Email updated successfully' })
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
  @ApiOperation({
    summary: 'Update account phone',
    description: 'Updates the phone number for the specified account.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateEnvironmentAccountPhoneDto })
  @ApiResponse({ status: 200, description: 'Phone updated successfully' })
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
  @ApiOperation({
    summary: 'Update account username',
    description: 'Updates the username for the specified account.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateEnvironmentAccountUsernameDto })
  @ApiResponse({ status: 200, description: 'Username updated successfully' })
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
  @ApiOperation({
    summary: 'Set custom property on account',
    description: 'Sets or updates a custom property on the account.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: SetEnvironmentAccountCustomPropertyDto })
  @ApiResponse({ status: 200, description: 'Custom property set successfully' })
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete custom property from account',
    description: 'Removes a custom property from the account by its key.',
  })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: DeleteEnvironmentAccountCustomPropertyDto })
  @ApiResponse({ status: 204, description: 'Custom property deleted successfully' })
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
}
