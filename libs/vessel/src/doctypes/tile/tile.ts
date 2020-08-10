import {IDocument} from '../../document/document.interface';
import { TileState } from './tile-doctype';
import { TileShape } from './tile-shape';

export class Tile {
  readonly #document: IDocument<TileState, TileShape>;
  #canonical: TileShape

  constructor(document: IDocument<TileState, TileShape>, canonical: TileShape) {
    this.#document = document;
    this.#canonical = canonical;
    this.#document.state$.subscribe(async () => {
      this.#canonical = await this.#document.canonical()
    })
  }

  static async fromDocument(document: IDocument<TileState, TileShape>) {
    const canonical = await document.canonical()
    return new Tile(document, canonical)
  }

  static async create(create: (payload: any) => Promise<IDocument<unknown, unknown>>, shape: TileShape) {
    const document = await create(shape)
    return this.fromDocument(document as IDocument<TileState, TileShape>)
  }
}
