/**
 * Typenv Error Details for individual environment variable validation failures.
 */
export interface TypenvErrorDetail {
  key: string;
  message: string;
}

/**
 * Typenv Error for environment variable validation errors.
 */
export class TypenvError extends Error {
  public errors: TypenvErrorDetail[];

  /**
   * Creates an instance of TypenvError.
   * Supports both a single error object (backwards-compatible) and an array of error objects.
   * @param {TypenvErrorDetail | TypenvErrorDetail[]} input - The error or list of errors.
   */
  constructor(input: TypenvErrorDetail | TypenvErrorDetail[]) {
    if (Array.isArray(input)) {
      const summary = input.map((e) => `  - ${e.key}: ${e.message}`).join('\n');
      super(`Environment validation failed:\n${summary}`);
      this.errors = input;
    } else {
      super(`Env var ${input.key} ${input.message}`);
      this.errors = [input];
    }
    this.name = 'TypenvError';
  }
}

/**
 * Base options for all schema validators.
 */
export interface BaseSchemaOptions<T> {
  default?: T;
  optional?: boolean;
}

/**
 * Options for the string schema validator.
 */
export interface StringSchemaOptions extends BaseSchemaOptions<string> {
  pattern?: RegExp;
}

/**
 * Options for the number schema validator.
 */
export interface NumberSchemaOptions extends BaseSchemaOptions<number> {
  min?: number;
  max?: number;
}

/**
 * Options for the boolean schema validator.
 */
export interface BooleanSchemaOptions extends BaseSchemaOptions<boolean> {}

/**
 * Options for the enum schema validator.
 */
export interface EnumSchemaOptions<T> extends BaseSchemaOptions<T> {
  values: readonly T[] | T[];
}

/**
 * Helper type to determine the precise return type of a validator based on its options.
 */
export type DetermineReturnType<T, OPTIONS> = OPTIONS extends { optional: true }
  ? OPTIONS extends { default: T }
    ? T
    : T | undefined
  : T;

/**
 * Validates and returns a string environment variable.
 * @param {StringSchemaOptions} [options] - Optional configurations (default, optional, pattern).
 * @returns {Function} A function that takes an object with key and value, returning the parsed/validated string.
 */
export const asString = <
  OPTIONS extends StringSchemaOptions | undefined = undefined,
>(
  options?: OPTIONS,
) => {
  return ({
    key,
    value,
  }: {
    key: string;
    value: string | undefined;
  }): DetermineReturnType<string, OPTIONS> => {
    if (value === undefined || value.trim() === '') {
      if (options?.default !== undefined) {
        return options.default as DetermineReturnType<string, OPTIONS>;
      }
      if (options?.optional) {
        return undefined as DetermineReturnType<string, OPTIONS>;
      }
      throw new TypenvError({ key, message: 'is not defined' });
    }
    if (options?.pattern && !options.pattern.test(value)) {
      throw new TypenvError({
        key,
        message: `must match pattern ${options.pattern}`,
      });
    }
    return value as DetermineReturnType<string, OPTIONS>;
  };
};

/**
 * Validates and returns an environment variable that must be one of the specified enum values.
 * @template T
 * @param {EnumSchemaOptions<T>} options - Configuration options containing allowed values, default value, and optional flag.
 * @returns {Function} A function that takes an object with key and value, returning the value if valid.
 */
export const asEnum = <
  T,
  OPTIONS extends EnumSchemaOptions<T> | undefined = undefined,
>(
  options: OPTIONS & EnumSchemaOptions<T>,
) => {
  return ({
    key,
    value,
  }: {
    key: string;
    value: string | undefined;
  }): DetermineReturnType<T, OPTIONS> => {
    if (value === undefined || value.trim() === '') {
      if (options?.default !== undefined) {
        return options.default as DetermineReturnType<T, OPTIONS>;
      }
      if (options?.optional) {
        return undefined as DetermineReturnType<T, OPTIONS>;
      }
      throw new TypenvError({ key, message: 'is not defined' });
    }
    if (!options.values.includes(value as unknown as T)) {
      throw new TypenvError({
        key,
        message: `must be one of ${options.values.join('/')}`,
      });
    }
    return value as unknown as T as DetermineReturnType<T, OPTIONS>;
  };
};

/**
 * Validates and returns a boolean environment variable.
 * @param {BooleanSchemaOptions} [options] - Optional configurations (default, optional).
 * @returns {Function} A function that takes an object with key and value, returning the boolean value.
 */
export const asBoolean = <
  OPTIONS extends BooleanSchemaOptions | undefined = undefined,
>(
  options?: OPTIONS,
) => {
  return ({
    key,
    value,
  }: {
    key: string;
    value: string | undefined;
  }): DetermineReturnType<boolean, OPTIONS> => {
    if (value === undefined || value.trim() === '') {
      if (options?.default !== undefined) {
        return options.default as DetermineReturnType<boolean, OPTIONS>;
      }
      if (options?.optional) {
        return undefined as DetermineReturnType<boolean, OPTIONS>;
      }
      throw new TypenvError({ key, message: 'is not defined' });
    }
    const normalized = value.toLowerCase();
    if (normalized !== 'true' && normalized !== 'false') {
      throw new TypenvError({ key, message: 'must be a boolean (true/false)' });
    }
    return (normalized === 'true') as DetermineReturnType<boolean, OPTIONS>;
  };
};

/**
 * Validates and returns a number environment variable.
 * @param {NumberSchemaOptions} [options] - Optional configurations (default, optional, min, max).
 * @returns {Function} A function that takes an object with key and value, returning the number value.
 */
export const asNumber = <
  OPTIONS extends NumberSchemaOptions | undefined = undefined,
>(
  options?: OPTIONS,
) => {
  return ({
    key,
    value,
  }: {
    key: string;
    value: string | undefined;
  }): DetermineReturnType<number, OPTIONS> => {
    if (value === undefined || value.trim() === '') {
      if (options?.default !== undefined) {
        return options.default as DetermineReturnType<number, OPTIONS>;
      }
      if (options?.optional) {
        return undefined as DetermineReturnType<number, OPTIONS>;
      }
      throw new TypenvError({ key, message: 'is not defined' });
    }
    const numValue = Number(value);
    if (Number.isNaN(numValue)) {
      throw new TypenvError({ key, message: 'must be a number' });
    }
    if (options?.min !== undefined && numValue < options.min) {
      throw new TypenvError({
        key,
        message: `must be at least ${options.min}`,
      });
    }
    if (options?.max !== undefined && numValue > options.max) {
      throw new TypenvError({
        key,
        message: `must be at most ${options.max}`,
      });
    }
    return numValue as DetermineReturnType<number, OPTIONS>;
  };
};

/**
 * Defines the generic Schema mapping of keys to validator functions.
 */
export type Schema = Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: generic validation function return can be any type
  (input: { key: string; value: string | undefined }) => any
>;

/**
 * Defines the typed environment variables based on the provided schema.
 * @template SCHEMA
 */
export type TypedEnv<SCHEMA> = SCHEMA extends Record<string, unknown>
  ? {
      // biome-ignore lint/suspicious/noExplicitAny: needs any signature to infer the return type of variable schema functions
      [K in keyof SCHEMA]: SCHEMA[K] extends (...args: any[]) => infer RETURN
        ? RETURN
        : never;
    }
  : never;

/**
 * Options configuration for creating the environment.
 */
export interface CreateEnvOptions {
  /**
   * Optional custom environment source to read variables from.
   * Useful for serverless handlers, edge environments, or test runners.
   */
  env?: Record<string, string | undefined>;
}

/**
 * Creates and validates environment variables based on the provided schema.
 * @template SCHEMA
 * @param {SCHEMA} schema - The schema defining the environment variables.
 * @param {CreateEnvOptions} [options] - Configuration options (such as custom env source).
 * @returns {Readonly<TypedEnv<SCHEMA>>} An object containing the validated environment variables.
 * @throws {TypenvError} If any environment variable validation fails, compiling all errors.
 */
export const createEnv = <SCHEMA extends Schema>(
  schema: SCHEMA,
  options?: CreateEnvOptions,
): Readonly<TypedEnv<SCHEMA>> => {
  const envSource = options?.env ?? process.env;
  const env = {} as TypedEnv<SCHEMA>;
  const errors: TypenvErrorDetail[] = [];

  for (const key in schema) {
    const value = envSource[key];
    try {
      env[key] = schema[key]({ key, value }) as TypedEnv<SCHEMA>[typeof key];
    } catch (err) {
      if (err instanceof TypenvError) {
        errors.push(...err.errors);
      } else if (err instanceof Error) {
        errors.push({ key, message: err.message });
      } else {
        errors.push({ key, message: String(err) });
      }
    }
  }

  if (errors.length > 0) {
    throw new TypenvError(errors);
  }

  return Object.freeze(env);
};
