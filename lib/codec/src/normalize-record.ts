import CID from "cids";

export function normalizeRecord(record: any) {
  if (
    record.id &&
    typeof record.id === "object" &&
    typeof record.id["/"] === "string"
  ) {
    record.id = new CID(record.id["/"]);
  }
  if (
    record.prev &&
    typeof record.prev === "object" &&
    typeof record.prev["/"] === "string"
  ) {
    record.prev = new CID(record.prev["/"]);
  }
  return record;
}
