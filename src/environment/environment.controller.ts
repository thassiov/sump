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
import { EnvironmentUseCase } from '../core/use-cases/environment.use-case';
import {
  ICreateEnvironmentDto,
  IUpdateEnvironmentNonSensitivePropertiesDto,
} from '../core/types/environment/dto.type';
import { IEnvironment } from '../core/types/environment/environment.type';

@ApiTags('Environments')
@Controller('tenants/:tenantId/environments')
export class EnvironmentController {
  constructor(private readonly environmentUseCase: EnvironmentUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new environment for a tenant' })
  @ApiResponse({ status: 201, description: 'Environment created successfully' })
  async createEnvironment(
    @Param('tenantId') tenantId: string,
    @Body() dto: ICreateEnvironmentDto
  ) {
    return this.environmentUseCase.createNewEnvironment(tenantId, dto);
  }

  @Get(':environmentId')
  @ApiOperation({ summary: 'Get environment by ID and tenant ID' })
  @ApiResponse({ status: 200, description: 'Environment found' })
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
  @ApiOperation({ summary: 'Delete environment by ID and tenant ID' })
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
  @ApiOperation({ summary: 'Update environment non-sensitive properties' })
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
  @ApiOperation({ summary: 'Set custom property on environment' })
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
  @ApiOperation({ summary: 'Delete custom property from environment' })
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
