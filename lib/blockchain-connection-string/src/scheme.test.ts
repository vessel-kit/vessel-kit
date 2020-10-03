import {
  InvalidSchemeError,
  MissedDefaultsError,
  Scheme,
  SchemeCase,
} from "./scheme";

describe(".fromString", () => {
  test("correct full scheme", () => {
    const result = Scheme.fromString("eip155+openrpc+https");
    expect(result.chain).toEqual("eip155");
    expect(result.messaging).toEqual("openrpc");
    expect(result.transport).toEqual("https");
  });
  test("correct full scheme with full character set", () => {
    const result = Scheme.fromString("eip-155+open.rpc+https");
    expect(result.chain).toEqual("eip-155");
    expect(result.messaging).toEqual("open.rpc");
    expect(result.transport).toEqual("https");
  });
  test("two-part incorrect scheme", () => {
    expect(() => {
      Scheme.fromString("eip155+openrpc");
    }).toThrow(InvalidSchemeError);
  });
  test("four-part incorrect scheme", () => {
    expect(() => {
      Scheme.fromString("eip155+openrpc+https+blah");
    }).toThrow(InvalidSchemeError);
  });
  test("known transport", () => {
    const result = Scheme.fromString("https", {
      chain: "eip155",
      messaging: "openrpc",
    });
    expect(result.chain).toEqual("eip155");
    expect(result.messaging).toEqual("openrpc");
    expect(result.transport).toEqual("https");
  });
  test("known transport with no defaults", () => {
    expect(() => {
      Scheme.fromString("https");
    }).toThrow(MissedDefaultsError);
  });
  test("unknown transport", () => {
    expect(() => {
      Scheme.fromString("pigeon", { chain: "eip155", messaging: "openrpc" });
    }).toThrow(InvalidSchemeError);
  });
});

test("#toString", () => {
  const original = "eip155+openrpc+https";
  const scheme = Scheme.fromString(original);
  expect(scheme.toString()).toEqual(original);
});

describe(".schemeCase", () => {
  test("full scheme", () => {
    const result = Scheme.case("eip155+openrpc+https");
    expect(result[0]).toEqual(SchemeCase.FULL_SCHEME);
  });
  test("known transport", () => {
    const result = Scheme.case("https");
    expect(result[0]).toEqual(SchemeCase.KNOWN_TRANSPORT);
  });
  test("invalid input", () => {
    expect(Scheme.case("foo")).toBeNull();
  });
});

describe(".isValid", () => {
  test("full scheme", () => {
    expect(Scheme.isValid("eip155+openrpc+https")).toBeTruthy();
  });
  test("known transport", () => {
    expect(Scheme.isValid("https")).toBeTruthy();
  });
  test("invalid input", () => {
    expect(Scheme.isValid("foo")).toBeFalsy();
  });
});
