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
import { EnvironmentUseCase } from '../core/use-cases/environment.use-case';
import {
  ICreateEnvironmentDto,
  IUpdateEnvironmentNonSensitivePropertiesDto,
} from '../core/types/environment/dto.type';
import { IEnvironment } from '../core/types/environment/environment.type';
import {
  CreateEnvironmentDto,
  CreateEnvironmentResponseDto,
  UpdateEnvironmentDto,
  SetEnvironmentCustomPropertyDto,
  DeleteEnvironmentCustomPropertyDto,
  EnvironmentResponseDto,
} from './dto';
import { AuthGuard, RolesGuard } from '../auth/guards';
import { RequireRoles, TenantResource } from '../auth/decorators';

@ApiTags('Environments')
@Controller('tenants/:tenantId/environments')
@UseGuards(AuthGuard, RolesGuard)
@TenantResource('tenantId')
export class EnvironmentController {
  constructor(private readonly environmentUseCase: EnvironmentUseCase) {}

  @Post()
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @ApiOperation({
    summary: 'Create a new environment for a tenant',
    description: 'Creates a new environment associated with the specified tenant.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiBody({ type: CreateEnvironmentDto })
  @ApiResponse({
    status: 201,
    description: 'Environment created successfully',
    type: CreateEnvironmentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or owner role required' })
  async createEnvironment(
    @Param('tenantId') tenantId: string,
    @Body() dto: ICreateEnvironmentDto
  ) {
    return this.environmentUseCase.createNewEnvironment(tenantId, dto);
  }

  @Get(':environmentId')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' },
    { role: 'user', target: 'tenant', targetId: ':tenantId' }
  )
  @ApiOperation({
    summary: 'Get environment by ID and tenant ID',
    description: 'Retrieves an environment by its UUID within the specified tenant.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiResponse({
    status: 200,
    description: 'Environment found',
    type: EnvironmentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Environment not found' })
  async getEnvironmentById(
    @Param('tenantId') tenantId: string,
    @Param('environmentId') environmentId: string
  ) {
    const environment =
      await this.environmentUseCase.getEnvironmentByIdAndTenantId(
        environmentId,
        tenantId
      );
    if (!environment) {
      throw new NotFoundException('Environment not found');
    }
    return environment;
  }

  @Delete(':environmentId')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete environment by ID and tenant ID',
    description: 'Deletes an environment and all its associated accounts.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiResponse({ status: 204, description: 'Environment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or owner role required' })
  @ApiResponse({ status: 404, description: 'Environment not found' })
  async deleteEnvironment(
    @Param('tenantId') tenantId: string,
    @Param('environmentId') environmentId: string
  ) {
    return this.environmentUseCase.deleteEnvironmentByIdAndTenantId(
      environmentId,
      tenantId
    );
  }

  @Patch(':environmentId')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @ApiOperation({
    summary: 'Update environment non-sensitive properties',
    description: 'Updates allowed environment properties like name.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiBody({ type: UpdateEnvironmentDto })
  @ApiResponse({ status: 200, description: 'Environment updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or owner role required' })
  @ApiResponse({ status: 404, description: 'Environment not found' })
  async updateEnvironment(
    @Param('tenantId') tenantId: string,
    @Param('environmentId') environmentId: string,
    @Body() dto: IUpdateEnvironmentNonSensitivePropertiesDto
  ) {
    return this.environmentUseCase.updateEnvironmentNonSensitivePropertiesByIdAndTenantId(
      environmentId,
      tenantId,
      dto
    );
  }

  @Patch(':environmentId/custom-property')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @ApiOperation({
    summary: 'Set custom property on environment',
    description: 'Sets or updates a custom property on the environment.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiBody({ type: SetEnvironmentCustomPropertyDto })
  @ApiResponse({ status: 200, description: 'Custom property set successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or owner role required' })
  @ApiResponse({ status: 404, description: 'Environment not found' })
  async setCustomProperty(
    @Param('tenantId') tenantId: string,
    @Param('environmentId') environmentId: string,
    @Body() customProperty: IEnvironment['customProperties']
  ) {
    return this.environmentUseCase.setEnvironmentCustomPropertyByIdAndTenantId(
      environmentId,
      tenantId,
      customProperty
    );
  }

  @Delete(':environmentId/custom-property')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete custom property from environment',
    description: 'Removes a custom property from the environment by its key.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiBody({ type: DeleteEnvironmentCustomPropertyDto })
  @ApiResponse({ status: 204, description: 'Custom property deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or owner role required' })
  @ApiResponse({ status: 404, description: 'Environment not found' })
  async deleteCustomProperty(
    @Param('tenantId') tenantId: string,
    @Param('environmentId') environmentId: string,
    @Body('customProperty') customPropertyKey: string
  ) {
    return this.environmentUseCase.deleteEnvironmentCustomPropertyByIdAndTenantId(
      environmentId,
      tenantId,
      customPropertyKey
    );
  }
}
