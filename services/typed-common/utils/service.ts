import logger from 'winston';
import Express from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
/* @ts-ignore */
import expressWinston from 'express-winston'; // TODO bump to version 4
import MongoClient from './mongoclient.js';
import RedisClient from './redisclient.js';
import httpInterceptors from './httpinterceptors.js';
import EnvironmentConfig from './environmentconfig.js';
import { ServiceOptions } from '@microrealestate/types';

process.on('SIGINT', async () => {
  try {
    await Service.getInstance()?.shutDown(0);
  } catch (error) {
    console.error(error);
  }
});

export default class Service {
  private static instance: Service | null = null;
  static getInstance(envConfig?: EnvironmentConfig) {
    if (!Service.instance) {
      if (!envConfig) {
        throw new Error('envConfig is required');
      }
      Service.instance = new Service(envConfig);
    }
    return Service.instance;
  }

  name?: string;
  port?: number;
  useMongo?: boolean;
  useRedis?: boolean;
  useAxios?: boolean;
  useRequestParsers?: boolean;
  onStartUp?: (express: Express.Application) => Promise<void>;
  onShutDown?: () => Promise<void>;

  mongoClient?: MongoClient;
  redisClient?: RedisClient;

  envConfig: EnvironmentConfig;
  expressServer: Express.Application;

  private constructor(envConfig: EnvironmentConfig) {
    this.envConfig = envConfig;

    // configure default logger
    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, {
      level: envConfig.getValues().LOGGER_LEVEL,
      colorize: true,
    });

    this.expressServer = Express();
  }

  async init({
    name,
    useMongo,
    useRedis,
    useAxios,
    useRequestParsers = true,
    onStartUp,
    onShutDown,
  }: ServiceOptions) {
    this.name = name;
    this.port = this.envConfig.getValues().PORT;
    this.useAxios = useAxios;
    this.onStartUp = onStartUp;
    this.onShutDown = onShutDown;
    this.useMongo = useMongo;
    this.useRedis = useRedis;

    if (useMongo) {
      this.mongoClient = MongoClient.getInstance(this.envConfig);
    }

    if (useRedis) {
      this.redisClient = RedisClient.getInstance(this.envConfig);
    }

    if (this.useAxios) {
      httpInterceptors();
    }

    if (useRequestParsers) {
      this.expressServer.use(cookieParser());
      this.expressServer.use(Express.urlencoded({ extended: true }));
      this.expressServer.use(Express.json());
      this.expressServer.use(methodOverride());
    }

    this.expressServer.use(
      expressWinston.logger({
        transports: [
          new logger.transports.Console({
            json: false,
            colorize: true,
          }),
        ],
        meta: false, // optional: control whether you want to log the meta data about the request (default to true)
        msg: String, //'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
        expressFormat: true, // Use the default Express/morgan request formatting, with the same colors. Enabling this will override any msg and colorStatus if true. Will only output colors on transports with colorize set to true
        colorStatus: true, // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true
        //ignoreRoute: function( /*req, res*/ ) {
        //    return false;
        //} // optional: allows to skip some log messages based on request and/or response
      })
    );

    this.expressServer.use(
      expressWinston.errorLogger({
        transports: [
          new logger.transports.Console({
            json: false,
            colorize: true,
          }),
        ],
      })
    );
  }

  async startUp() {
    const startService = () =>
      new Promise<void>((resolve, reject) => {
        this.expressServer
          .listen(this.port, () => {
            logger.info(
              `Service ${this.name} ready and listening on port ${this.port}`
            );
            resolve();
          })
          .on('error', async (err) => {
            logger.error(String(err));
            if (this.mongoClient) {
              try {
                await this.mongoClient.disconnect();
              } catch (error) {
                logger.error(String(error));
              }
            }
            if (this.redisClient) {
              try {
                await this.redisClient.disconnect();
              } catch (error) {
                logger.error(String(error));
              }
            }
            reject(err);
          });
      });
    logger.info(`Starting service ${this.name}...`);
    this.envConfig.log();
    await this.onStartUp?.(this.expressServer);
    if (this.mongoClient) {
      await this.mongoClient.connect();
    }
    if (this.redisClient) {
      await this.redisClient.connect();
      // await this.redisClient.monitor();
    }
    await startService();
  }

  async shutDown(errCode: number) {
    if (this.mongoClient) {
      try {
        await this.mongoClient.disconnect();
      } catch (error) {
        logger.error(String(error));
      }
    }
    if (this.redisClient) {
      try {
        await this.redisClient.disconnect();
      } catch (error) {
        logger.error(String(error));
      }
    }
    await this.onShutDown?.();
    process.exit(errCode);
  }
}
