/**
 * Typenv Error for environment variable validation errors.
 */
export class TypenvError extends Error {
  /**
   * Creates an instance of TypenvError.
   * @param {Object} params - The parameters for the error.
   * @param {string} params.message - The error message.
   * @param {string} params.key - The environment variable key that caused the error.
   */
  constructor({ message, key }: { message: string; key: string }) {
    super(`Env var ${key} ${message}`);
    this.name = 'TypenvError';
  }
}

type SchemaFunction<VALUE, RETURN> = (input: {
  key: string;
  value: VALUE;
}) => RETURN;
type StringSchema = SchemaFunction<string, string>;
type BooleanSchema = SchemaFunction<string, boolean>;
type NumberSchema = SchemaFunction<string, number>;
type EnumSchema<T> = SchemaFunction<T, T>;

/**
 * Validates and returns a string environment variable.
 * @returns {Function} A function that takes an object with key and value, returning the value.
 */
export const asString = (): StringSchema => {
  return ({ key, value }) => {
    return value;
  };
};

/**
 * Validates and returns an environment variable that must be one of the specified enum values.
 * @template T
 * @param {Object} params - The parameters for the enum validation.
 * @param {T[]} params.values - The allowed values for the enum.
 * @returns {Function} A function that takes an object with key and value, returning the value if valid.
 * @throws {TypenvError} If the environment variable value is not one of the allowed values.
 */
export const asEnum = <T>({ values }: { values: T[] }): EnumSchema<T> => {
  return ({ key, value }) => {
    if (!values.includes(value)) {
      throw new TypenvError({
        key,
        message: `must be one of ${values.join('/')}`,
      });
    }
    return value;
  };
};

/**
 * Validates and returns a boolean environment variable.
 * @returns {Function} A function that takes an object with key and value, returning the boolean value.
 * @throws {TypenvError} If the environment variable is not a boolean.
 */
export const asBoolean = (): BooleanSchema => {
  return ({ key, value }) => {
    value = value.toLowerCase();
    if (value !== 'true' && value !== 'false') {
      throw new TypenvError({ key, message: 'must be a boolean (true/false)' });
    }
    return value === 'true';
  };
};

/**
 * Validates and returns a number environment variable.
 * @returns {Function} A function that takes an object with key and value, returning the number value.
 * @throws {TypenvError} If the environment variable is not a number.
 */
export const asNumber = (): NumberSchema => {
  return ({ key, value }) => {
    const numValue = Number(value);
    if (Number.isNaN(numValue)) {
      throw new TypenvError({ key, message: 'must be a number' });
    }
    return numValue;
  };
};

/**
 * Defines the schema for environment variable.
 */
type Schema = Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: allowedy-
  StringSchema | EnumSchema<any> | NumberSchema | BooleanSchema
>;

/**
 * Defines the typed environment variables based on the provided schema.
 * @template SCHEMA
 */
type TypedEnv<SCHEMA> = SCHEMA extends Record<string, unknown>
  ? {
      // biome-ignore lint/suspicious/noExplicitAny: allowed
      [K in keyof SCHEMA]: SCHEMA[K] extends (...args: any[]) => infer RETURN
        ? RETURN
        : never;
    }
  : never;

/**
 * Creates and validates environment variables based on the provided schema.
 * @template SCHEMA
 * @param {Object} params - The parameters for creating the environment.
 * @param {SCHEMA} params.schema - The schema defining the environment variables.
 * @returns {TypedEnv<SCHEMA>} An object containing the validated environment variables.
 * @throws {TypenvError} If any environment variable is not defined or invalid.
 */
export const createEnv = <SCHEMA extends Schema>(
  schema: SCHEMA,
): Readonly<TypedEnv<SCHEMA>> => {
  const env = {} as TypedEnv<SCHEMA>;
  for (const key in schema) {
    const value = process.env[key as string];
    if (value === undefined || value.trim() === '') {
      throw new TypenvError({ key, message: 'is not defined' });
    }
    env[key] = schema[key]({ key, value }) as TypedEnv<SCHEMA>[typeof key];
  }
  return Object.freeze(env);
};
