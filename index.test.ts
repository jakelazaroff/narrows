import {
  all,
  any,
  array,
  boolean,
  empty,
  instance,
  literal,
  nil,
  object,
  optional,
  nullable,
  number,
  record,
  string,
  tuple
} from "./index";

describe("boolean", () => {
  it("should return true for booleans", () => {
    expect(boolean(true)).toBe(true);
  });

  it("should return false for other types", () => {
    expect(boolean(1)).toBe(false);
    expect(boolean("test")).toBe(false);
    expect(boolean(Symbol())).toBe(false);
    expect(boolean(null)).toBe(false);
    expect(boolean(undefined)).toBe(false);
    expect(boolean({})).toBe(false);
  });
});

describe("number", () => {
  it("should return true for numbers", () => {
    expect(number(0)).toBe(true);
  });

  it("should return false for other types", () => {
    expect(number(true)).toBe(false);
    expect(number("test")).toBe(false);
    expect(number(Symbol())).toBe(false);
    expect(number(null)).toBe(false);
    expect(number(undefined)).toBe(false);
    expect(number({})).toBe(false);
  });
});

describe("string", () => {
  it("should return true for strings", () => {
    expect(string("test")).toBe(true);
  });

  it("should return false for other types", () => {
    expect(string(true)).toBe(false);
    expect(string(1)).toBe(false);
    expect(string(Symbol())).toBe(false);
    expect(string(null)).toBe(false);
    expect(string(undefined)).toBe(false);
    expect(string({})).toBe(false);
  });
});

describe("empty", () => {
  it("should return true for undefined", () => {
    expect(empty(undefined)).toBe(true);
  });

  it("should return false for other types", () => {
    expect(empty(null)).toBe(false);
    expect(empty("test")).toBe(false);
    expect(empty(true)).toBe(false);
    expect(empty(1)).toBe(false);
    expect(empty(Symbol())).toBe(false);
    expect(empty({})).toBe(false);
  });
});

describe("nil", () => {
  it("should return true for null", () => {
    expect(nil(null)).toBe(true);
  });

  it("should return false for other types", () => {
    expect(nil(undefined)).toBe(false);
    expect(nil("test")).toBe(false);
    expect(nil(true)).toBe(false);
    expect(nil(1)).toBe(false);
    expect(nil(Symbol())).toBe(false);
    expect(nil({})).toBe(false);
  });
});

describe("literal", () => {
  it("should return true for the same literal", () => {
    const validate = literal(1);

    expect(validate(1)).toBe(true);
  });

  it("should return false for other values", () => {
    const validate = literal(1);

    expect(validate(2)).toBe(false);
    expect(validate("test")).toBe(false);
    expect(validate(true)).toBe(false);
    expect(validate(Symbol())).toBe(false);
    expect(validate({})).toBe(false);
  });
});

describe("object", () => {
  it("should return true if all properties match the given validator", () => {
    const validate = object(number);

    expect(
      validate({
        a: 1,
        b: 2
      })
    ).toBe(true);
  });

  it("should return false if any property doesn't match the given validator", () => {
    const validate = object(number);

    expect(
      validate({
        a: 1,
        b: "2"
      })
    ).toBe(false);
  });
});

describe("array", () => {
  it("should return true if all elements match the given validator", () => {
    const validate = array(string);

    expect(validate(["one", "two"])).toBe(true);
  });

  it("should return false if any element doesn't match the given validator", () => {
    const validate = array(string);

    expect(validate(["one", 2])).toBe(false);
  });

  it("should return false if not passed an array", () => {
    const validate = array(string);

    expect(validate({ 0: "one", 1: "two" })).toBe(false);
  });
});

describe("instance", () => {
  it("should return true if the value is an instance of the given class", () => {
    const validate = instance(Date);

    expect(validate(new Date())).toBe(true);
  });

  it("should return false if the value is not an instance of the given class", () => {
    const validate = instance(string);

    expect(validate({})).toBe(false);
  });
});

describe("record", () => {
  it("should return true if all properties match the schema", () => {
    const validate = record({
      a: string,
      b: number
    });

    expect(validate({ a: "one", b: 2 })).toBe(true);
  });

  it("should return true even if extra properties exist in the object", () => {
    const validate = record({
      a: string,
      b: number
    });

    expect(validate({ a: "one", b: 2, c: true })).toBe(true);
  });

  it("should return false if any property doesn't match the schema", () => {
    const validate = record({
      a: string,
      b: number
    });

    expect(validate({ a: "one", b: "two" })).toBe(false);
  });
});

describe("tuple", () => {
  it("should return true if all elements match the schema", () => {
    const validate = tuple(string, number);

    expect(validate(["one", 2])).toBe(true);
  });

  it("should return true even if extra elements exist in the object", () => {
    const validate = tuple(string, number);

    expect(validate(["one", 2, true])).toBe(true);
  });

  it("should return false if any element doesn't match the schema", () => {
    const validate = tuple(string, number);

    expect(validate(["one", "two"])).toBe(false);
  });
});

describe("optional", () => {
  it("should return true if the value matches the given validator", () => {
    const validate = optional(number);

    expect(validate(1)).toBe(true);
  });

  it("should return true if the value is undefined", () => {
    const validate = optional(number);

    expect(validate(undefined)).toBe(true);
  });

  it("should return false if the value doesn't match the given validator", () => {
    const validate = optional(number);

    expect(validate("test")).toBe(false);
  });
});

describe("nullable", () => {
  it("should return true if the value matches the given validator", () => {
    const validate = nullable(number);

    expect(validate(1)).toBe(true);
  });

  it("should return true if the value is null", () => {
    const validate = nullable(number);

    expect(validate(null)).toBe(true);
  });

  it("should return false if the value doesn't match the given validator", () => {
    const validate = nullable(number);

    expect(validate("test")).toBe(false);
  });
});

describe("any", () => {
  it("should return true if the value matches any given validator", () => {
    const validate = any(number, string);

    expect(validate(1)).toBe(true);
    expect(validate("two")).toBe(true);
  });

  it("should return false if the value doesn't match any given validator", () => {
    const validate = any(number, string);

    expect(validate(true)).toBe(false);
  });
});

describe("all", () => {
  it("should return true if the value matches all given validators", () => {
    const validate = all(record({ a: string }), record({ b: number }));

    expect(validate({ a: "one", b: 2 })).toBe(true);
  });

  it("should return false if the value doesn't match all given validators", () => {
    const validate = all(record({ a: string }), record({ b: number }));

    expect(validate({ a: "one", b: "two" })).toBe(false);
  });
});
