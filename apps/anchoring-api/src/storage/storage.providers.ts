import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { CommonsModule } from '../commons/commons.module';
import { ConfigService } from '../commons/config.service';
import * as migrations from './migrations';

function connectionType(url: string): 'postgres' | 'mysql' | 'sqlite' {
  const schema = url.match(/^(postgres|mysql|sqlite):\/\/.+/);
  if (schema && schema[1]) {
    return schema[1] as 'postgres' | 'mysql' | 'sqlite';
  } else {
    throw new Error(`Unknown database protocol: ${url}`);
  }
}

export const storageProviders = [
  TypeOrmModule.forRootAsync({
    imports: [CommonsModule],
    useFactory: async (configService: ConfigService) => {
      return {
        type: connectionType(configService.current.DATABASE_URL),
        url: configService.current.DATABASE_URL,
        migrationsRun: true,
        migrations: Object.values(migrations),
        entities: [`${path.join(__dirname, '..')}/**/*.record.{ts,js}`],
        logging: false,
      };
    },
    inject: [ConfigService],
  }),
];
