type Validator<T = unknown> = (x: unknown) => x is T;

// https://stackoverflow.com/a/50375286/1486679
type UnionToIntersection<U> = (U extends any
  ? (k: U) => void
  : never) extends ((k: infer I) => void)
  ? I
  : never;

type InstanceOf<T> = T extends { new (...args: any[]): infer U } ? U : never;

const isObject = (x: unknown): x is { [key: string]: unknown } =>
  typeof x === "object" && x !== null;

/** Type for which a validator matches. */
export type TypeOf<T> = T extends (x: unknown) => x is infer U ? U : never;

// -------------------------------- //
// - - - PRIMITIVE VALIDATORS - - - //
// -------------------------------- //

/** Returns true if and only if x is a boolean. */
export const boolean = (x: unknown): x is boolean => typeof x === "boolean";

/** Returns true if and only if x is a string. */
export const string = (x: unknown): x is string => typeof x === "string";

/** Returns true if and only if x is a number. */
export const number = (x: unknown): x is number => typeof x === "number";

/** Returns true if and only if x is null or undefined. */
export const empty = (x: unknown): x is null | undefined =>
  x === null || x === undefined;

// ------------------------------ //
// - - - COMPLEX VALIDATORS - - - //
// ------------------------------ //

/** Returns true if and only if x is an object where each value matches the given validator. */
export const object = <T extends Validator>(validator: T) => (
  x: unknown
): x is { [K in keyof T]: TypeOf<T[K]> } =>
  isObject(x) && Object.values<unknown>(x).every(validator);

/** Returns true if and only if x is an array where each element matches the given validator. */
export const array = <T extends Validator>(validator: T) => (
  x: unknown
): x is Array<TypeOf<T>> => Array.isArray(x) && x.every(validator);

/** Returns true if and only if x is an instance of the given type. */
export const instance = <T extends Function>(base: T) => (
  x: unknown
): x is InstanceOf<T> => x instanceof base;

// ------------------------------//
// - - - SCHEMA VALIDATORS - - - //
// ------------------------------//

/** Returns true if and only if x is an object where each value matches the validator at the corresponding key in the schema. */
export const record = <T extends { [key: string]: Validator }>(schema: T) => (
  x: unknown
): x is { [K in keyof T]: TypeOf<T[K]> } =>
  isObject(x) && Object.keys(schema).every(key => schema[key](x[key]));

/** Returns true if and only if x is an array where each element matches the validator at the corresponding index in the schema. */
export const tuple = <T extends Validator[]>(...schema: T) => (
  x: unknown
): x is { [K in keyof T]: TypeOf<T[K]> } =>
  schema.every((validator, i) => Array.isArray(x) && validator(x[i]));

// ----------------------- //
// - - - COMBINATORS - - - //
// ----------------------- //

/** Returns true if and only if x matches any of the given validators. */
export const any = <T extends Validator[]>(...validators: T) => (
  x: unknown
): x is TypeOf<T[keyof T]> => validators.some(validator => validator(x));

/** Returns true if and only if x matches all of the given validators. */
export const all = <T extends Validator[]>(...validators: T) => (
  x: unknown
): x is UnionToIntersection<TypeOf<T[keyof T]>> =>
  validators.every(validator => validator(x));

/** Returns true if and only if x matches the given validator, is null or is undefined. */
export const optional = <T>(validator: Validator<T>) => any(empty, validator);
