export interface Evolution<A> {
  doctype: string;
  data: A;
  log: History;
}
