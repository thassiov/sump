import { randomUUID } from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import pinoHttp from 'pino-http';

function setupExpressRestApi(routes: express.Router[]) {
  const api = express();

  api.use(helmet());
  api.use(
    pinoHttp({
      genReqId: function (req, res) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const existingID = req.id ?? req.headers['x-request-id'];
        if (existingID) {
          return existingID;
        }
        const id = randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
      },
    })
  );
  api.use(express.json());
  api.use(express.urlencoded({ extended: true }));
  api.use(errorHandler);

  api.use('/v1', routes);
}

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: NextFunction
) {
  req.log.error(err);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'Internal Server Error',
  });
}

export { setupExpressRestApi };
