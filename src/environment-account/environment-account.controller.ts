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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnvironmentAccountUseCase } from '../core/use-cases/environment-account.use-case';
import {
  ICreateEnvironmentAccountDto,
  IUpdateEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
} from '../core/types/environment-account/dto.type';
import { IEnvironmentAccount } from '../core/types/environment-account/environment-account.type';

@ApiTags('Environment Accounts')
@Controller('environments/:environmentId/accounts')
export class EnvironmentAccountController {
  constructor(
    private readonly environmentAccountUseCase: EnvironmentAccountUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account in an environment' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async createAccount(
    @Param('environmentId') environmentId: string,
    @Body() dto: ICreateEnvironmentAccountDto
  ) {
    return this.environmentAccountUseCase.createNewAccount(environmentId, dto);
  }

  @Get(':accountId')
  @ApiOperation({ summary: 'Get account by ID and environment ID' })
  @ApiResponse({ status: 200, description: 'Account found' })
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
  @ApiOperation({ summary: 'Delete account by ID and environment ID' })
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
  @ApiOperation({ summary: 'Update account non-sensitive properties' })
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
  @ApiOperation({ summary: 'Update account email' })
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
  @ApiOperation({ summary: 'Update account phone' })
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
  @ApiOperation({ summary: 'Update account username' })
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
  @ApiOperation({ summary: 'Set custom property on account' })
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
  @ApiOperation({ summary: 'Delete custom property from account' })
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
