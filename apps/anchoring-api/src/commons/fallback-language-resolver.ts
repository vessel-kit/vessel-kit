import { Injectable } from '@nestjs/common';
import { I18nResolver } from 'nestjs-i18n';

@Injectable()
export class FallbackLanguageResolver implements I18nResolver {
  constructor(private readonly fallback: string) {}

  resolve() {
    return this.fallback;
  }
}
