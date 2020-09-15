import path from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApiModule } from './api/api.module';

export const appProviders = [
  ScheduleModule.forRoot(),
  GraphQLModule.forRoot({
    path: '/api/graphql',
    installSubscriptionHandlers: true,
    debug: true,
    playground: true,
    typePaths: [path.resolve(__dirname, '..', 'anchoring.graphql')],
    include: [ApiModule],
  }),
];
