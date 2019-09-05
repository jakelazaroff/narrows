# narrows

Super lean and simple object validation with TypeScript support.

[![NPM version](https://badgen.net/npm/dm/narrows?color=red&icon=npm)](https://www.npmjs.com/package/narrows) [![Build status](https://badgen.net/circleci/github/jakelazaroff/narrows?icon=circleci)](https://circleci.com/gh/jakelazaroff/narrows) [![Bundle size](https://badgen.net/bundlephobia/minzip/narrows)](https://bundlephobia.com/result?p=narrows@latest)

**narrows** is…

- composable: use any validator inside another
- extendable: validators are simple functions — easily write your own
- safe: in TypeScript, validators turn your variables into static types
- tiny: no dependencies, fewer than 50 lines of code and less than 500b gzipped

## Examples

Easily validate complex types by using simple validators together:

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
  foo; // type narrowed to { a: string; b: number; }
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

It's also common to write validator creators: functions that return validators. This lets you apply custom behavior when you use them.

```javascript
import { all, number } from "narrows";

const greaterThan = x => y => x > y;
const validate = all(number, greaterThan(10));

validate(11); // true
validate(5); // false
```

In TypeScript, your validators should be [user-defined type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards): functions in the form of `(x: unknown) => x is T`. This lets TypeScript extract static type information.

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
  foo; // type narrowed to { type: "increment" | "decrement"; amount: number; }
}
```

## API

### Primitive Validators

Validate that a variable is a `boolean`, `number`, `string`, `null`/`undefined` or a literal value.

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

Returns true if and only if the argument is undefined.

```typescript
import { empty } from "narrows";

empty(undefined); // true
empty("string"); // false
```

#### nil

Returns true if and only if the argument is null.

```typescript
import { nil } from "narrows";

nil(null); // true
nil("string"); // false
```

#### literal

Returns true if and only if the argument is [strictly equal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators) to the given value. Two values are strictly equal if they are primitives with the same value, or references to the same object.

```javascript
import { literal } from "narrows";

const validate = literal(5);

validate(5); // true
validate(6); // false
```

In TypeScript, this will narrow to the widened type instead of the constant (e.g. `number` instead of `5`). To fix this, you can [assert the type manually](https://www.typescriptlang.org/docs/handbook/basic-types.html#type-assertions):

```typescript
import { literal } from "narrows";

let validate = literal(5 as 5); // TypeScript 3.3 and below
validate = literal(5 as const); // TypeScript 3.4 and above

const foo: unknown = 5;

if (validate(foo)) {
  foo; // type narrowed to 5
}
```

### Complex Validators

Validate that a variable conforms to a certain shape, or is an instance of a constructor.

#### object

Returns true if and only if each property in an object matches the given validator.

```typescript
import { object, number } from "narrows";

const validate = object(number);

validate({ a: 1, b: 2 /* ... */ }); // true
validate({ a: "a", b: "b" /* ... */ }); // false

const foo: unknown = {
  a: 1,
  b: 2
  // ...
};

if (validate(foo)) {
  foo; // type narrowed to { [key: string]: number }
}
```

#### array

Returns true if and only if each element in an array matches the given validator.

```typescript
import { array, number } from "narrows";

const validate = array(number);

validate([1, 2 /* ... */]); // true
validate(["a", "b" /* ... */]); // false

const foo: unknown = [1, 2 /* ... */];

if (validate(foo)) {
  foo; // type narrowed to number[]
}
```

#### instance

Returns true if and only if a variable matches the given constructor.

```typescript
import { instance } from "narrows";

const validate = instance(Date);

validate(new Date()); // true
validate({ a: 1 }); // false

const foo: unknown = new Date();

if (validate(foo)) {
  foo; // type narrowed to Date
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
  foo; // type narrowed to { a: string; b: number; }
}
```

#### tuple

Given an array of validators, returns true if and only if each validator in that array matches the corresponding element in the array being tested.

If extra elements are present, this function still returns true — but the extra elements won't be reflected in the narrowed type.

```typescript
import { number, string, tuple } from "narrows";

const validate = tuple([string, number]);

const foo: unknown = ["abc", 123, true];

if (validate(foo)) {
  foo; // type narrowed to[string, number]
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

const foo: unknown = 0;

if (validate(foo)) {
  foo; // type narrowed to number | string
}
```

#### all

Returns true if the argument matches all of the given validators.

Narrows to an intersection of the validator types.

```typescript
import { all, number, record, string } from "narrows";

const validate = all(record({ a: number }), record({ b: string }));

validate({ a: 1, b: "2" }); // true
validate({ a: 1 }); // false
validate({ b: "2" }); // false

const foo: unknown = {
  a: 1,
  b: "2"
};

if (validate(foo)) {
  foo; // type narrowed to { a: number; b: string; }
}
```

#### optional

Returns true if the argument matches the given validator or is undefined.

Narrows to a union of the validator type and `undefined`.

```typescript
import { optional, number } from "narrows";

const validate = optional(number);

validate(0); // true
validate(undefined); // true
validate("string"); // false

const foo: unknown = undefined;
if (validate(foo)) {
  foo; // type narrowed to number | undefined
}
```

#### nullable

Returns true if the argument matches the given validator or is null.

Narrows to a union of the validator type and `null`.

```typescript
import { nullable, number } from "narrows";

const validate = nullable(number);

validate(0); // true
validate(null); // true
validate("string"); // false

const foo: unknown = null;
if (validate(foo)) {
  foo; // type narrowed to number | null
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
