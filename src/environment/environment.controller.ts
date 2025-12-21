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

@ApiTags('Environments')
@Controller('tenants/:tenantId/environments')
export class EnvironmentController {
  constructor(private readonly environmentUseCase: EnvironmentUseCase) {}

  @Post()
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
  async createEnvironment(
    @Param('tenantId') tenantId: string,
    @Body() dto: ICreateEnvironmentDto
  ) {
    return this.environmentUseCase.createNewEnvironment(tenantId, dto);
  }

  @Get(':environmentId')
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete environment by ID and tenant ID',
    description: 'Deletes an environment and all its associated accounts.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiResponse({ status: 204, description: 'Environment deleted successfully' })
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
  @ApiOperation({
    summary: 'Update environment non-sensitive properties',
    description: 'Updates allowed environment properties like name.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiBody({ type: UpdateEnvironmentDto })
  @ApiResponse({ status: 200, description: 'Environment updated successfully' })
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
  @ApiOperation({
    summary: 'Set custom property on environment',
    description: 'Sets or updates a custom property on the environment.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiBody({ type: SetEnvironmentCustomPropertyDto })
  @ApiResponse({ status: 200, description: 'Custom property set successfully' })
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete custom property from environment',
    description: 'Removes a custom property from the environment by its key.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiParam({ name: 'environmentId', description: 'UUID of the environment' })
  @ApiBody({ type: DeleteEnvironmentCustomPropertyDto })
  @ApiResponse({ status: 204, description: 'Custom property deleted successfully' })
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
