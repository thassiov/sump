import { Request } from 'express';
import { ISession } from './session.type';
import { ITenantAccount } from '../../core/types/tenant-account/tenant-account.type';
import { IEnvironmentAccount } from '../../core/types/environment-account/environment-account.type';

interface AuthContext {
  type: 'tenant' | 'environment';
  id: string; // tenant_id or environment_id
}

interface AuthenticatedRequest extends Request {
  session: ISession;
  account: ITenantAccount | IEnvironmentAccount;
  authContext: AuthContext;
}

interface TenantAuthenticatedRequest extends Request {
  session: ISession;
  account: ITenantAccount;
  authContext: AuthContext & { type: 'tenant' };
}

interface EnvironmentAuthenticatedRequest extends Request {
  session: ISession;
  account: IEnvironmentAccount;
  authContext: AuthContext & { type: 'environment' };
}

export type {
  AuthContext,
  AuthenticatedRequest,
  EnvironmentAuthenticatedRequest,
  TenantAuthenticatedRequest,
};
