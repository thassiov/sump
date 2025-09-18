import express, { Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';
import { EndpointHandler } from '../../../lib/types';
import { IUpdateAccountNonSensitivePropertiesDto } from '../../../services/account/types/dto.type';
import { UseCaseCaller } from '../../types/business.type';
import { UpdateNonSensitivePropertiesByIdAndTenantIdUseCase } from './types/use-case.type';

const router = express.Router({ mergeParams: true });

function makeServiceEndpoints(
  useCase: UseCaseCaller<UpdateNonSensitivePropertiesByIdAndTenantIdUseCase>
): express.Router {
  router.patch(
    '/:id',
    updateNonSensitivePropertiesByIdEndpointFactory(useCase)
  );

  return router;
}

function updateNonSensitivePropertiesByIdEndpointFactory(
  useCase: UseCaseCaller<UpdateNonSensitivePropertiesByIdAndTenantIdUseCase>
): EndpointHandler {
  return async function (req: Request, res: Response): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const accountId = req.params['id']!;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tenantId = req.params['tenantId']!;

    const dto = req.body as IUpdateAccountNonSensitivePropertiesDto;

    const result = await useCase(accountId, tenantId, dto);

    if (!result) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    res.status(StatusCodes.OK).send();
    return;
  };
}

export { makeServiceEndpoints };
