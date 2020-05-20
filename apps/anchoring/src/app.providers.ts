import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nJsonParser,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { ConfigService } from './commons/config.service';
import path from 'path';
import { FallbackLanguageResolver } from './commons/fallback-language-resolver';
import { CommonsModule } from './commons/commons.module';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';

export const appProviders = [
  I18nModule.forRootAsync({
    useFactory: async (configService: ConfigService) => {
      return {
        fallbackLanguage: 'en',
        parserOptions: {
          path: path.join(__dirname, '..', 'i18n'),
          watch: configService.current.NODE_ENV === 'development',
        },
      };
    },
    parser: I18nJsonParser,
    resolvers: [
      { use: QueryResolver, options: ['lang', 'locale', 'l'] },
      new HeaderResolver(['x-custom-lang']),
      AcceptLanguageResolver,
      new CookieResolver(['lang', 'locale', 'l']),
      new FallbackLanguageResolver('en'),
    ],
    inject: [ConfigService],
    imports: [CommonsModule],
  }),
  ScheduleModule.forRoot(),
  GraphQLModule.forRoot({
    path: "/api/graphql",
    installSubscriptionHandlers: true,
    debug: true,
    playground: true,
    typePaths: [path.resolve(__dirname, '..', 'anchoring.graphql')]
  }),
];
