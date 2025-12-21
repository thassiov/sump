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
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { TenantUseCase } from '../core/use-cases/tenant.use-case';
import {
  CreateNewTenantUseCaseDto,
  IUpdateTenantNonSensitivePropertiesDto,
} from '../core/types/tenant/dto.type';
import { ITenant } from '../core/types/tenant/tenant.type';
import {
  CreateTenantDto,
  CreateTenantResponseDto,
  UpdateTenantDto,
  SetCustomPropertyDto,
  DeleteCustomPropertyDto,
  TenantResponseDto,
} from './dto';
import { TenantAccountResponseDto } from '../tenant-account/dto';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantUseCase: TenantUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new tenant with initial account and environment',
    description: 'Creates a new tenant along with an owner account and optionally an initial environment. If no environment is specified, a "default" environment will be created.',
  })
  @ApiBody({ type: CreateTenantDto })
  @ApiResponse({
    status: 201,
    description: 'Tenant created successfully',
    type: CreateTenantResponseDto,
  })
  async createTenant(@Body() dto: CreateNewTenantUseCaseDto) {
    return this.tenantUseCase.createNewTenant(dto);
  }

  @Get(':tenantId')
  @ApiOperation({
    summary: 'Get tenant by ID',
    description: 'Retrieves a tenant by its UUID, including all its environments.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant found',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getTenantById(@Param('tenantId') tenantId: string) {
    return this.tenantUseCase.getTenantById(tenantId);
  }

  @Delete(':tenantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete tenant by ID',
    description: 'Deletes a tenant and all associated data (accounts, environments, etc.).',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiResponse({ status: 204, description: 'Tenant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async deleteTenantById(@Param('tenantId') tenantId: string) {
    return this.tenantUseCase.deleteTenantById(tenantId);
  }

  @Patch(':tenantId')
  @ApiOperation({
    summary: 'Update tenant non-sensitive properties',
    description: 'Updates allowed tenant properties like name.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiBody({ type: UpdateTenantDto })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
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
  @ApiOperation({
    summary: 'Get all accounts for a tenant',
    description: 'Retrieves all accounts associated with the specified tenant.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiResponse({
    status: 200,
    description: 'List of accounts',
    type: [TenantAccountResponseDto],
  })
  async getAccountsByTenantId(@Param('tenantId') tenantId: string) {
    return this.tenantUseCase.getAccountsByTenantId(tenantId);
  }

  @Patch(':tenantId/custom-property')
  @ApiOperation({
    summary: 'Set custom property on tenant',
    description: 'Sets or updates a custom property on the tenant. Pass the property as a key-value pair in the body.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiBody({ type: SetCustomPropertyDto })
  @ApiResponse({ status: 200, description: 'Custom property set successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
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
  @ApiOperation({
    summary: 'Delete custom property from tenant',
    description: 'Removes a custom property from the tenant by its key.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiBody({ type: DeleteCustomPropertyDto })
  @ApiResponse({ status: 204, description: 'Custom property deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
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
