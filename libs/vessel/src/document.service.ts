import { ILogger } from './logger/logger.interface';

export class DocumentService {
  #logger: ILogger
  constructor(logger: ILogger) {
    this.#logger = logger
    this.#logger.log(`Constructed DocumentService instance`)
  }
}
