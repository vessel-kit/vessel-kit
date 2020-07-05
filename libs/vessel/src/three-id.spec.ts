import { ThreeId } from "./three-id";

test("blank id", () => {
  const document = new ThreeId();
  expect(document.id).toEqual(undefined);
});

test("setup document", () => {
  const document = new ThreeId("foo");
  expect(document.id).toEqual("foo");
});
