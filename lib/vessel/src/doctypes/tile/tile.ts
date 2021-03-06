import { IDocument } from "../../document/document.interface";
import { TileState } from "./tile-doctype";
import { TileShape, TileShapeBase } from "./tile-shape";
import produce from "immer";
import jsonPatch from "fast-json-patch";
import { UpdateRecordWaiting } from "../../util/update-record.codec";
import { IContext } from "../../context";

function isTileDocument(
  document: unknown
): document is IDocument<TileState, TileShape> {
  return (
    document &&
    typeof document === "object" &&
    (document as any).state?.doctype === "tile"
  );
}

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

  static async fromDocument(document: IDocument<unknown, unknown>) {
    if (isTileDocument(document)) {
      const d: IDocument<TileState, TileShape> = document;
      const canonical = await d.canonical();
      return new Tile(document, canonical);
    } else {
      throw new Error(
        `Invalid doctype: expected tile, got ${document.state.doctype}`
      );
    }
  }

  static async create(
    create: (payload: any) => Promise<IDocument<unknown, unknown>>,
    context: IContext,
    shape: Omit<TileShapeBase, "doctype">
  ) {
    const payload = Object.assign({ doctype: "tile" }, shape);
    const signature = await context.sign(payload);
    const document = await create(Object.assign(payload, { signature }));
    return this.fromDocument(document);
  }

  async change(
    mutation: (t: TileShapeBase) => Promise<TileShapeBase> | TileShapeBase
  ): Promise<void> {
    const next = await produce(this.#canonical, mutation);
    const patch = jsonPatch.compare(this.#canonical, next);
    const payloadToSign = UpdateRecordWaiting.encode({
      patch: patch,
      prev: this.#document.log.last,
      id: this.#document.id,
    });
    const signature = await this.#document.context.sign(payloadToSign);
    await this.#document.update(Object.assign(payloadToSign, { signature }));
  }
}
