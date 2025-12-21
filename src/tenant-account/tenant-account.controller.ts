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
import { TenantAccountUseCase } from '../core/use-cases/tenant-account.use-case';
import {
  ICreateTenantAccountDto,
  IUpdateTenantAccountNonSensitivePropertiesDto,
  IUpdateTenantAccountEmailDto,
  IUpdateTenantAccountPhoneDto,
  IUpdateTenantAccountUsernameDto,
  ITenantAccountUserDefinedIdentification,
} from '../core/types/tenant-account/dto.type';
import {
  CreateTenantAccountDto,
  CreateTenantAccountResponseDto,
  UpdateTenantAccountDto,
  UpdateTenantAccountEmailDto,
  UpdateTenantAccountPhoneDto,
  UpdateTenantAccountUsernameDto,
  UserDefinedIdentificationDto,
  TenantAccountResponseDto,
} from './dto';

@ApiTags('Tenant Accounts')
@Controller('tenants/:tenantId/accounts')
export class TenantAccountController {
  constructor(private readonly tenantAccountUseCase: TenantAccountUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new account for a tenant',
    description: 'Creates a new account associated with the specified tenant.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiBody({ type: CreateTenantAccountDto })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: CreateTenantAccountResponseDto,
  })
  async createAccount(
    @Param('tenantId') tenantId: string,
    @Body() dto: ICreateTenantAccountDto
  ) {
    return this.tenantAccountUseCase.createNewAccount(tenantId, dto);
  }

  @Get(':accountId')
  @ApiOperation({
    summary: 'Get account by ID and tenant ID',
    description: 'Retrieves an account by its UUID within the specified tenant.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiResponse({
    status: 200,
    description: 'Account found',
    type: TenantAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getAccountById(
    @Param('tenantId') tenantId: string,
    @Param('accountId') accountId: string
  ) {
    const account = await this.tenantAccountUseCase.getAccountByIdAndTenantId(
      accountId,
      tenantId
    );
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  @Get('user-defined-identification')
  @ApiOperation({
    summary: 'Get account by user defined identification',
    description: 'Searches for an account by email, phone, or username within the tenant.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiBody({ type: UserDefinedIdentificationDto })
  @ApiResponse({
    status: 200,
    description: 'Account found',
    type: TenantAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getAccountByUserDefinedIdentification(
    @Param('tenantId') tenantId: string,
    @Body() dto: ITenantAccountUserDefinedIdentification
  ) {
    const account =
      await this.tenantAccountUseCase.getAccountByUserDefinedIdentificationAndTenantId(
        dto,
        tenantId
      );
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  @Delete(':accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete account by ID and tenant ID',
    description: 'Deletes an account from the specified tenant.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async deleteAccount(
    @Param('tenantId') tenantId: string,
    @Param('accountId') accountId: string
  ) {
    return this.tenantAccountUseCase.deleteAccountByIdAndTenantId(
      accountId,
      tenantId
    );
  }

  @Patch(':accountId')
  @ApiOperation({
    summary: 'Update account non-sensitive properties',
    description: 'Updates allowed account properties like name and avatar URL.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateTenantAccountDto })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async updateAccount(
    @Param('tenantId') tenantId: string,
    @Param('accountId') accountId: string,
    @Body() dto: IUpdateTenantAccountNonSensitivePropertiesDto
  ) {
    return this.tenantAccountUseCase.updateNonSensitivePropertiesByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  @Patch(':accountId/email')
  @ApiOperation({
    summary: 'Update account email',
    description: 'Updates the email address for the specified account.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateTenantAccountEmailDto })
  @ApiResponse({ status: 200, description: 'Email updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async updateAccountEmail(
    @Param('tenantId') tenantId: string,
    @Param('accountId') accountId: string,
    @Body() dto: IUpdateTenantAccountEmailDto
  ) {
    return this.tenantAccountUseCase.updateAccountEmailByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  @Patch(':accountId/phone')
  @ApiOperation({
    summary: 'Update account phone',
    description: 'Updates the phone number for the specified account.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateTenantAccountPhoneDto })
  @ApiResponse({ status: 200, description: 'Phone updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Phone already in use' })
  async updateAccountPhone(
    @Param('tenantId') tenantId: string,
    @Param('accountId') accountId: string,
    @Body() dto: IUpdateTenantAccountPhoneDto
  ) {
    return this.tenantAccountUseCase.updateAccountPhoneByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  @Patch(':accountId/username')
  @ApiOperation({
    summary: 'Update account username',
    description: 'Updates the username for the specified account.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateTenantAccountUsernameDto })
  @ApiResponse({ status: 200, description: 'Username updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Username already in use' })
  async updateAccountUsername(
    @Param('tenantId') tenantId: string,
    @Param('accountId') accountId: string,
    @Body() dto: IUpdateTenantAccountUsernameDto
  ) {
    return this.tenantAccountUseCase.updateAccountUsernameByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }
}
