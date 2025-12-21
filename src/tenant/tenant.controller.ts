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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantUseCase } from '../core/use-cases/tenant.use-case';
import {
  CreateNewTenantUseCaseDto,
  IUpdateTenantNonSensitivePropertiesDto,
} from '../core/types/tenant/dto.type';
import { ITenant } from '../core/types/tenant/tenant.type';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantUseCase: TenantUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new tenant with initial account and environment',
  })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  async createTenant(@Body() dto: CreateNewTenantUseCaseDto) {
    return this.tenantUseCase.createNewTenant(dto);
  }

  @Get(':tenantId')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant found' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getTenantById(@Param('tenantId') tenantId: string) {
    return this.tenantUseCase.getTenantById(tenantId);
  }

  @Delete(':tenantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tenant by ID' })
  async deleteTenantById(@Param('tenantId') tenantId: string) {
    return this.tenantUseCase.deleteTenantById(tenantId);
  }

  @Patch(':tenantId')
  @ApiOperation({ summary: 'Update tenant non-sensitive properties' })
  async updateTenant(
    @Param('tenantId') tenantId: string,
    @Body() dto: IUpdateTenantNonSensitivePropertiesDto
  ) {
    return this.tenantUseCase.updateNonSensitivePropertiesByIdUseCase(
      tenantId,
      dto
    );
  }

  @Get(':tenantId/accounts')
  @ApiOperation({ summary: 'Get all accounts for a tenant' })
  async getAccountsByTenantId(@Param('tenantId') tenantId: string) {
    return this.tenantUseCase.getAccountsByTenantId(tenantId);
  }

  @Patch(':tenantId/custom-property')
  @ApiOperation({ summary: 'Set custom property on tenant' })
  async setCustomProperty(
    @Param('tenantId') tenantId: string,
    @Body() customProperty: ITenant['customProperties']
  ) {
    return this.tenantUseCase.setCustomPropertyByTenantIdUseCase(
      tenantId,
      customProperty
    );
  }

  @Delete(':tenantId/custom-property')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete custom property from tenant' })
  async deleteCustomProperty(
    @Param('tenantId') tenantId: string,
    @Body('customProperty') customPropertyKey: string
  ) {
    return this.tenantUseCase.deleteCustomPropertyByTenantIdUseCase(
      tenantId,
      customPropertyKey
    );
  }
}
