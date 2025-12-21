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
import { TenantAccountUseCase } from '../core/use-cases/tenant-account.use-case';
import {
  ICreateTenantAccountDto,
  IUpdateTenantAccountNonSensitivePropertiesDto,
  IUpdateTenantAccountEmailDto,
  IUpdateTenantAccountPhoneDto,
  IUpdateTenantAccountUsernameDto,
  ITenantAccountUserDefinedIdentification,
} from '../core/types/tenant-account/dto.type';

@ApiTags('Tenant Accounts')
@Controller('tenants/:tenantId/accounts')
export class TenantAccountController {
  constructor(private readonly tenantAccountUseCase: TenantAccountUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account for a tenant' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async createAccount(
    @Param('tenantId') tenantId: string,
    @Body() dto: ICreateTenantAccountDto
  ) {
    return this.tenantAccountUseCase.createNewAccount(tenantId, dto);
  }

  @Get(':accountId')
  @ApiOperation({ summary: 'Get account by ID and tenant ID' })
  @ApiResponse({ status: 200, description: 'Account found' })
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
  @ApiOperation({ summary: 'Get account by user defined identification' })
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
  @ApiOperation({ summary: 'Delete account by ID and tenant ID' })
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
  @ApiOperation({ summary: 'Update account non-sensitive properties' })
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
  @ApiOperation({ summary: 'Update account email' })
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
  @ApiOperation({ summary: 'Update account phone' })
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
  @ApiOperation({ summary: 'Update account username' })
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
