# narrows

Super lean and simple object validation with TypeScript support. **narrows** is…

- composable: use any validator inside another
- extendable: validators are just functions — easily write your own
- tiny: no dependencies, fewer than 50 lines of code and less than 500b gzipped

## Examples

```javascript
import { number, record, string } from "narrows";

const validate = record({
  a: string,
  b: number
});

validate({ a: "abc", b: 123 }); // true
validate(42); // false
```

If you're using TypeScript, narrows is even **more** useful: it uses [type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) to pull static type information from your validators.

```typescript
import { number, record, string } from "narrows";

const validate = record({
  a: string,
  b: number
});

const foo: unknown = {
  a: "abc",
  b: 123
};

if (validate(foo)) {
  // true
  // { a: string; b: number; }
} else {
  // unknown
}
```

## Extending

It's super easy to write your own validators! They're just functions that return true or false. Check it out:

```javascript
import { all, number } from "narrows";

const positive = x => x > 0; // this is a validator!
const validate = all(number, positive);

validate(5); // true
validate(-1); // false
```

In TypeScript, your validators should be [user-defined type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards): functions in the form of `(x: unknown) => x is T`. This lets TypeScript extract static type information from your validators.

```typescript
import { record, number } from "narrows";

type Actions = "increment" | "decrement";
const action = (x: unknown): x is Actions =>
  x === "increment" || x === "decrement";

const validate = record({
  type: action,
  amount: number
});

const foo: unknown = {
  type: "increment",
  b: 1
};

if (validate(foo)) {
  // true
  // { type: "increment" | "decrement"; amount: number; }
} else {
  // unknown
}
```

## API

### Primitive Validators

Validate that a variable is a `boolean`, `number`, `string` or `null`/`undefined`.

#### boolean

Returns true if and only if the argument is a boolean.

```typescript
import { boolean } from "narrows";

boolean(false); // true
boolean(0); // false
```

#### number

Returns true if and only if the argument is a number.

```typescript
import { number } from "narrows";

number(0); // true
number("string"); // false
```

#### string

Returns true if and only if the argument is a string.

```typescript
import { string } from "narrows";

string("test"); // true
string(true); // false
```

#### empty

Returns true if and only if the argument is null or undefined.

```typescript
import { empty } from "narrows";

empty(null); // true
empty(undefined); //true
empty("string"); // false
```

### Complex Validators

Validate that all members of a variable match the given validator.

#### object

Returns true if and only if each property in an object matches the given validator.

```typescript
import { object, number } from "narrows";

const validate = object(number);

validate({ a: 1, b: 2 /* ... */ }); // true
validate({ a: "a", b: "b" /* ... */ }); // false

if (validate({ a: 1, b: 2 /* ... */ })) {
  // { [key: string]: number }
}
```

#### array

Returns true if and only if each element in an array matches the given validator.

```typescript
import { array, number } from "narrows";

const validate = array(number);

validate([1, 2 /* ... */]); // true
validate(["a", "b" /* ... */]); // false

if (validate([1, 2 /* ... */])) {
  // number[]
}
```

### Schema Validators

Validate that all members of a type match corresponding validators in the given schema.

#### record

Given an object of validators, returns true if and only if each validator in that object matches the corresponding property in the object being tested.

If extra properties are present, this function still returns true — but the extra properties won't be reflected in the narrowed type.

```typescript
import { number, record, string } from "narrows";

const validate = record({
  a: string,
  b: number
});

const foo: unknown = {
  a: "abc",
  b: 123,
  c: true
};

if (validate(foo)) {
  // true
  // { a: string; b: number; }
} else {
  // unknown
}
```

#### tuple

Given an array of validators, returns true if and only if each validator in that array matches the corresponding element in the array being tested.

If extra elements are present, this function still returns true — but the extra elements won't be reflected in the narrowed type.

```typescript
import { number, tuple, string } from "narrows";

const validate = tuple([string, number]);

const foo: unknown = ["abc", 123, true];

if (validate(foo)) {
  // true
  // [string, number]
} else {
  // unknown
}
```

### Combinators

Take in two or more validators and return a single validator that applies all of their rules.

#### any

Returns true if the argument matches any of the given validators.

Narrows to a union of the validator types.

```typescript
import { any, number, string } from "narrows";

const validate = any(number, string);

validate(0); // true
validate("one"); // true
validate(false); // false

if (validate(0)) {
  // number | string
}
```

#### all

Returns true if the argument matches any of the given validators.

Narrows to an intersection of the validator types.

```typescript
import { all, number, record, string } from "narrows";

const validate = all(record({ a: number }), record({ b: string }));

validate({ a: 1, b: "2" }); // true
validate({ a: 1 }); // false
validate({ b: "2" }); // false

if (validate({ a: 1, b: "2" })) {
  // { a: number; b: string; }
}
```

#### optional

Returns true if the argument matches the given validator, null or undefined.

Narrows to a union of the validator type, `null` and `undefined`.

```typescript
import { optional, number } from "narrows";

const validate = optional(number);

validate(0); // true
validate(null); // true
validate(undefined); // true
validate("string"); // false

if (validate(0)) {
  // number | null | undefined
}
```

### TypeOf

TypeScript type that extracts the validated type from a validator function.

```typescript
import { boolean, number, record, string, tuple, TypeOf } from "narrows";

const stringValidator = string;

type Foo = TypeOf<typeof stringValidator>; // string

const complexValidator = record({
  a: string,
  b: tuple(boolean, number)
});

type Bar = TypeOf<typeof complexValidator>; // { a: string; b: [boolean, number] }
```
