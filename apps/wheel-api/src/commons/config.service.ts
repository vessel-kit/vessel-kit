import { Injectable } from '@nestjs/common';
import Joi, { CustomHelpers } from '@hapi/joi';
import dotenv from 'dotenv';
import cronParser from 'cron-parser';

export interface Config {
  PORT: number;
  HOST: string;
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'test' | 'production';
  IPFS_URL: string;
  ANCHORING_URL: string;
}

const schema = Joi.object<Config>({
  PORT: Joi.number()
    .default(3000)
    .description('Port to listen to'),
  HOST: Joi.string()
    .default('0.0.0.0')
    .description('Host to listen to'),
  DATABASE_URL: Joi.string()
    .uri()
    .required()
    .description('Database connection url'),
  NODE_ENV: Joi.string()
    .default('development')
    .allow('development', 'test', 'production'),
  IPFS_URL: Joi.string()
    .uri()
    .required()
    .description('IPFS endpoint'),
  ANCHORING_URL: Joi.string()
    .uri()
    .required()
    .description('Anchoring endpoint'),
});

@Injectable()
export class ConfigService {
  readonly current: Config;

  constructor() {
    dotenv.config();
    const result = schema.validate(process.env, { allowUnknown: true });
    if (result.error) {
      throw new Error(`Config validation error: ${result.error.message}`);
    }
    this.current = result.value as Config;
  }
}
