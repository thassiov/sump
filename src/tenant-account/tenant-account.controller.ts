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
import { TenantAccountUseCase } from '../core/use-cases/tenant-account.use-case';
import {
  ICreateTenantAccountDto,
  IUpdateTenantAccountNonSensitivePropertiesDto,
  IUpdateTenantAccountEmailDto,
  IUpdateTenantAccountPhoneDto,
  IUpdateTenantAccountUsernameDto,
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
import { AuthGuard, RolesGuard } from '../auth/guards';
import { RequireRoles, AllowOwner, CurrentSession, TenantResource } from '../auth/decorators';
import { ISession } from '../auth/types/session.type';

@ApiTags('Tenant Accounts')
@Controller('tenants/:tenantId/accounts')
@UseGuards(AuthGuard, RolesGuard)
@TenantResource('tenantId')
export class TenantAccountController {
  constructor(private readonly tenantAccountUseCase: TenantAccountUseCase) {}

  @Post()
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or owner role required' })
  async createAccount(
    @Param('tenantId') tenantId: string,
    @Body() dto: ICreateTenantAccountDto
  ) {
    const id = await this.tenantAccountUseCase.createNewAccount(tenantId, dto);
    return { id };
  }

  @Get('user-defined-identification')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' },
    { role: 'user', target: 'tenant', targetId: ':tenantId' }
  )
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getAccountByUserDefinedIdentification(
    @Param('tenantId') tenantId: string,
    @Body() dto: UserDefinedIdentificationDto
  ) {
    const accounts =
      await this.tenantAccountUseCase.getAccountByUserDefinedIdentificationAndTenantId(
        dto,
        tenantId
      );
    if (!accounts || accounts.length === 0) {
      throw new NotFoundException('Account not found');
    }
    // Return first match (identifiers are unique)
    return accounts[0];
  }

  @Get(':accountId')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' },
    { role: 'user', target: 'tenant', targetId: ':tenantId' }
  )
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
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

  @Delete(':accountId')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete account by ID and tenant ID',
    description: 'Deletes an account from the specified tenant.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or owner role required' })
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
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @AllowOwner()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Update account non-sensitive properties',
    description: 'Updates allowed account properties like name and avatar URL. Users can update their own account.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateTenantAccountDto })
  @ApiResponse({ status: 204, description: 'Account updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - must be admin/owner or account owner' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async updateAccount(
    @Param('tenantId') tenantId: string,
    @Param('accountId') accountId: string,
    @Body() dto: IUpdateTenantAccountNonSensitivePropertiesDto
  ): Promise<void> {
    await this.tenantAccountUseCase.updateNonSensitivePropertiesByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  @Patch(':accountId/email')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @AllowOwner()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Update account email',
    description: 'Updates the email address for the specified account. Users can update their own email.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateTenantAccountEmailDto })
  @ApiResponse({ status: 204, description: 'Email updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - must be admin/owner or account owner' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async updateAccountEmail(
    @Param('tenantId') tenantId: string,
    @Param('accountId') accountId: string,
    @Body() dto: IUpdateTenantAccountEmailDto
  ): Promise<void> {
    await this.tenantAccountUseCase.updateAccountEmailByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  @Patch(':accountId/phone')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @AllowOwner()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Update account phone',
    description: 'Updates the phone number for the specified account. Users can update their own phone.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateTenantAccountPhoneDto })
  @ApiResponse({ status: 204, description: 'Phone updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - must be admin/owner or account owner' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Phone already in use' })
  async updateAccountPhone(
    @Param('tenantId') tenantId: string,
    @Param('accountId') accountId: string,
    @Body() dto: IUpdateTenantAccountPhoneDto
  ): Promise<void> {
    await this.tenantAccountUseCase.updateAccountPhoneByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  @Patch(':accountId/username')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @AllowOwner()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Update account username',
    description: 'Updates the username for the specified account. Users can update their own username.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account' })
  @ApiBody({ type: UpdateTenantAccountUsernameDto })
  @ApiResponse({ status: 204, description: 'Username updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - must be admin/owner or account owner' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Username already in use' })
  async updateAccountUsername(
    @Param('tenantId') tenantId: string,
    @Param('accountId') accountId: string,
    @Body() dto: IUpdateTenantAccountUsernameDto
  ): Promise<void> {
    await this.tenantAccountUseCase.updateAccountUsernameByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  @Patch(':accountId/disable')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Disable an account',
    description: 'Disables an account. Owners can disable admins and users. Admins can only disable users. Disabled accounts cannot log in.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account to disable' })
  @ApiResponse({ status: 204, description: 'Account disabled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role to disable this account' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async disableAccount(
    @Param('tenantId') tenantId: string,
    @Param('accountId') accountId: string,
    @CurrentSession() session: ISession
  ): Promise<void> {
    await this.tenantAccountUseCase.disableAccountByIdAndTenantId(
      session.accountId,
      accountId,
      tenantId
    );
  }

  @Patch(':accountId/enable')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Enable a disabled account',
    description: 'Re-enables a previously disabled account. Owners can enable admins and users. Admins can only enable users.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'accountId', description: 'UUID of the account to enable' })
  @ApiResponse({ status: 204, description: 'Account enabled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role to enable this account' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async enableAccount(
    @Param('tenantId') tenantId: string,
    @Param('accountId') accountId: string,
    @CurrentSession() session: ISession
  ): Promise<void> {
    await this.tenantAccountUseCase.enableAccountByIdAndTenantId(
      session.accountId,
      accountId,
      tenantId
    );
  }
}
