import * as Express from 'express';
import logger from 'winston';
import routes from './route.js';
import { EnvironmentConfig, Service } from '@microrealestate/typed-common';
import { Middlewares } from '@microrealestate/typed-common';

Main();

async function onStartUp(express: Express.Application) {
  express.use(
    Middlewares.needAccessToken(
      Service.getInstance().envConfig.getValues().ACCESS_TOKEN_SECRET
    )
  );
  express.use('/tenantapi', routes);
}

async function Main() {
  let service;
  try {
    service = Service.getInstance(
      new EnvironmentConfig({
        DEMO_MODE: process.env.DEMO_MODE
          ? process.env.DEMO_MODE.toLowerCase() === 'true'
          : undefined,
      })
    );

    await service.init({
      name: 'tenantapi',
      useRequestParsers: true,
      useMongo: true,
      onStartUp,
    });

    await service.startUp();
  } catch (error) {
    logger.error(String(error));
    service?.shutDown(-1);
  }
}
