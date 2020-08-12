import { IDocument } from '../../document/document.interface';
import { TileState } from './tile-doctype';
import { TileShape, TileShapeBase } from './tile-shape';
import produce from 'immer';
import jsonPatch from 'fast-json-patch';
import { UpdateRecordWaiting } from '../../util/update-record.codec';
import { IContext } from '../../context';

export class Tile {
  readonly #document: IDocument<TileState, TileShape>;
  #canonical: TileShape;

  constructor(document: IDocument<TileState, TileShape>, canonical: TileShape) {
    this.#document = document;
    this.#canonical = canonical;
    this.#document.state$.subscribe(async () => {
      this.#canonical = await this.#document.canonical();
    });
  }

  get document(): IDocument<TileState, TileShape> {
    return this.#document;
  }

  static async fromDocument(document: IDocument<TileState, TileShape>) {
    const canonical = await document.canonical();
    return new Tile(document, canonical);
  }

  static async create(
    create: (payload: any) => Promise<IDocument<unknown, unknown>>,
    context: IContext,
    shape: Omit<TileShapeBase, 'doctype'>,
  ) {
    const payload = Object.assign({ doctype: 'tile' }, shape);
    const signed = await context.sign(payload);
    const document = await create(signed);
    return this.fromDocument(document as IDocument<TileState, TileShape>);
  }

  async change(mutation: (t: TileShapeBase) => Promise<TileShapeBase> | TileShapeBase): Promise<void> {
    const next = await produce(this.#canonical, mutation);
    const patch = jsonPatch.compare(this.#canonical, next);
    const payloadToSign = UpdateRecordWaiting.encode({
      patch: patch,
      prev: this.#document.log.last,
      id: this.#document.id,
    });
    const signed = await this.#document.context.sign(payloadToSign);
    console.log('signed payload', signed)
    await this.#document.update(signed);
  }
}
