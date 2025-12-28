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
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { TenantUseCase } from '../core/use-cases/tenant.use-case';
import { CreateNewTenantUseCaseDto, IUpdateTenantNonSensitivePropertiesDto } from '../core/types/tenant/dto.type';
import { ITenant } from '../core/types/tenant/tenant.type';
import {
  CreateTenantDto,
  CreateTenantResponseDto,
  UpdateTenantDto,
  DeleteCustomPropertyDto,
  TenantResponseDto,
} from './dto';
import { TenantAccountResponseDto } from '../tenant-account/dto';
import { AuthGuard, RolesGuard } from '../auth/guards';
import { RequireRoles, TenantResource } from '../auth/decorators';
import { AuthService } from '../auth/services';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly tenantUseCase: TenantUseCase,
    private readonly authService: AuthService
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new tenant with initial account and environment',
    description:
      'Creates a new tenant along with an owner account and optionally an initial environment. ' +
      'If no environment is specified, a "default" environment will be created. ' +
      'Returns a session for the newly created owner account.',
  })
  @ApiBody({ type: CreateTenantDto })
  @ApiResponse({
    status: 201,
    description: 'Tenant created successfully with session',
    type: CreateTenantResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or weak password' })
  @ApiResponse({ status: 409, description: 'Email/username already exists' })
  async createTenant(
    @Body() dto: CreateTenantDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<CreateTenantResponseDto> {
    // Hash the password
    const passwordHash = await this.authService.hashPassword(dto.account.password);

    // Prepare use case DTO - replace password with passwordHash
    // Note: customProperties from Swagger DTO is Record<string, unknown>, but use case expects JSON-compatible types
    // We use type assertion since the Swagger validation ensures JSON-compatible values at runtime
    const { password: _, ...accountWithoutPassword } = dto.account;
    const useCaseDto = {
      tenant: {
        name: dto.tenant.name,
        customProperties: dto.tenant.customProperties ?? {},
      },
      account: {
        ...accountWithoutPassword,
        passwordHash,
        // Note: roles are added by the use case after tenant creation
      },
      environment: dto.environment
        ? {
            name: dto.environment.name,
            customProperties: dto.environment.customProperties ?? {},
          }
        : undefined,
    } as CreateNewTenantUseCaseDto & { account: { passwordHash: string } };

    // Create tenant, account, and environment
    const result = await this.tenantUseCase.createNewTenant(useCaseDto);

    // Create session for the new owner account
    const ipAddress = this.authService.getIpAddress(req);
    const userAgent = this.authService.getUserAgent(req);

    const session = await this.authService.createSession(res, {
      accountType: 'tenant_account',
      accountId: result.accountId,
      contextType: 'tenant',
      contextId: result.tenantId,
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
    });

    return {
      tenantId: result.tenantId,
      accountId: result.accountId,
      environmentId: result.environmentId,
      session: {
        id: session.id,
        accountType: session.accountType,
        accountId: session.accountId,
        contextType: session.contextType,
        contextId: session.contextId,
        expiresAt: session.expiresAt,
      },
    };
  }

  @Get(':tenantId')
  @UseGuards(AuthGuard, RolesGuard)
  @TenantResource('tenantId')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' },
    { role: 'user', target: 'tenant', targetId: ':tenantId' }
  )
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getTenantById(@Param('tenantId') tenantId: string) {
    return this.tenantUseCase.getTenantById(tenantId);
  }

  @Delete(':tenantId')
  @UseGuards(AuthGuard, RolesGuard)
  @TenantResource('tenantId')
  @RequireRoles({ role: 'owner', target: 'tenant', targetId: ':tenantId' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete tenant by ID',
    description: 'Deletes a tenant and all associated data (accounts, environments, etc.).',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiResponse({ status: 204, description: 'Tenant deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - owner role required' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async deleteTenantById(@Param('tenantId') tenantId: string) {
    return this.tenantUseCase.deleteTenantById(tenantId);
  }

  @Patch(':tenantId')
  @UseGuards(AuthGuard, RolesGuard)
  @TenantResource('tenantId')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Update tenant non-sensitive properties',
    description: 'Updates allowed tenant properties like name.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiBody({ type: UpdateTenantDto })
  @ApiResponse({ status: 204, description: 'Tenant updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or owner role required' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async updateTenant(
    @Param('tenantId') tenantId: string,
    @Body() dto: IUpdateTenantNonSensitivePropertiesDto
  ): Promise<void> {
    await this.tenantUseCase.updateNonSensitivePropertiesByIdUseCase(
      tenantId,
      dto
    );
  }

  @Get(':tenantId/accounts')
  @UseGuards(AuthGuard, RolesGuard)
  @TenantResource('tenantId')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' },
    { role: 'user', target: 'tenant', targetId: ':tenantId' }
  )
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getAccountsByTenantId(@Param('tenantId') tenantId: string) {
    return this.tenantUseCase.getAccountsByTenantId(tenantId);
  }

  @Patch(':tenantId/custom-property')
  @UseGuards(AuthGuard, RolesGuard)
  @TenantResource('tenantId')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Set custom property on tenant',
    description: 'Sets or updates a custom property on the tenant. Pass the property as a key-value pair in the body.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiBody({
    description: 'A key-value pair to set as a custom property',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { tier: 'enterprise' },
    },
  })
  @ApiResponse({ status: 204, description: 'Custom property set successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or owner role required' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async setCustomProperty(
    @Param('tenantId') tenantId: string,
    @Body() customProperty: ITenant['customProperties']
  ): Promise<void> {
    await this.tenantUseCase.setCustomPropertyByTenantIdUseCase(
      tenantId,
      customProperty
    );
  }

  @Delete(':tenantId/custom-property')
  @UseGuards(AuthGuard, RolesGuard)
  @TenantResource('tenantId')
  @RequireRoles(
    { role: 'owner', target: 'tenant', targetId: ':tenantId' },
    { role: 'admin', target: 'tenant', targetId: ':tenantId' }
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete custom property from tenant',
    description: 'Removes a custom property from the tenant by its key.',
  })
  @ApiParam({ name: 'tenantId', description: 'UUID of the tenant' })
  @ApiBody({ type: DeleteCustomPropertyDto })
  @ApiResponse({ status: 204, description: 'Custom property deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin or owner role required' })
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
