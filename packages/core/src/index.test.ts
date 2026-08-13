import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import {
  TypenvError,
  asBoolean,
  asEnum,
  asNumber,
  asString,
  createEnv,
} from './index';

describe('createEnv', () => {
  beforeAll(() => {
    process.env.TEST_STRING = 'Hello';
    process.env.TEST_NUMBER = '42';
    process.env.TEST_BOOLEAN = 'true';
    process.env.TEST_ENUM = 'option1';
  });

  afterAll(() => {
    process.env.TEST_STRING = undefined;
    process.env.TEST_NUMBER = undefined;
    process.env.TEST_BOOLEAN = undefined;
    process.env.TEST_ENUM = undefined;
  });

  test('should validate and return environment variables correctly', () => {
    const env = createEnv({
      TEST_STRING: asString(),
      TEST_NUMBER: asNumber(),
      TEST_BOOLEAN: asBoolean(),
      TEST_ENUM: asEnum({ values: ['option1', 'option2', 'option3'] as const }),
    });

    expect(env.TEST_STRING).toBe('Hello');
    expect(env.TEST_NUMBER).toBe(42);
    expect(env.TEST_BOOLEAN).toBe(true);
    expect(env.TEST_ENUM).toBe('option1');
  });

  test('should throw TypenvError for undefined variables', () => {
    expect(() =>
      createEnv({
        UNDEFINED_VAR: asString(),
      }),
    ).toThrow(TypenvError);
  });

  test('should throw TypenvError for invalid number', () => {
    process.env.INVALID_NUMBER = 'not_a_number';

    expect(() =>
      createEnv({
        INVALID_NUMBER: asNumber(),
      }),
    ).toThrow(TypenvError);
  });

  test('should throw TypenvError for invalid boolean', () => {
    process.env.INVALID_BOOLEAN = 'not_a_boolean';

    expect(() =>
      createEnv({
        INVALID_BOOLEAN: asBoolean(),
      }),
    ).toThrow(TypenvError);
  });

  test('should throw TypenvError for invalid enum value', () => {
    process.env.TEST_ENUM = 'invalid_option';

    expect(() =>
      createEnv({
        TEST_ENUM: asEnum({ values: ['option1', 'option2', 'option3'] }),
      }),
    ).toThrow(TypenvError);
    // restore valid enum
    process.env.TEST_ENUM = 'option1';
  });

  // --- MODERNIZATION TESTS ---

  describe('Error Accumulation', () => {
    test('should accumulate all validation errors and throw a consolidated TypenvError', () => {
      let caughtError: TypenvError | null = null;
      try {
        createEnv(
          {
            PORT: asNumber(),
            DB_HOST: asString(),
            ENABLE_FEATURE: asBoolean(),
          },
          {
            env: { PORT: 'not-a-number', DB_HOST: '', ENABLE_FEATURE: 'maybe' },
          },
        );
      } catch (err) {
        if (err instanceof TypenvError) {
          caughtError = err;
        }
      }

      expect(caughtError).not.toBeNull();
      expect(caughtError?.errors.length).toBe(3);
      expect(caughtError?.errors[0].key).toBe('PORT');
      expect(caughtError?.errors[0].message).toBe('must be a number');
      expect(caughtError?.errors[1].key).toBe('DB_HOST');
      expect(caughtError?.errors[1].message).toBe('is not defined');
      expect(caughtError?.errors[2].key).toBe('ENABLE_FEATURE');
      expect(caughtError?.errors[2].message).toBe(
        'must be a boolean (true/false)',
      );
    });
  });

  describe('Optional Fields', () => {
    test('should allow optional fields to evaluate to undefined if not provided', () => {
      const env = createEnv(
        {
          OPTIONAL_STR: asString({ optional: true }),
          OPTIONAL_NUM: asNumber({ optional: true }),
          OPTIONAL_BOOL: asBoolean({ optional: true }),
          OPTIONAL_ENUM: asEnum({ values: ['x', 'y'], optional: true }),
        },
        { env: {} },
      );

      expect(env.OPTIONAL_STR).toBeUndefined();
      expect(env.OPTIONAL_NUM).toBeUndefined();
      expect(env.OPTIONAL_BOOL).toBeUndefined();
      expect(env.OPTIONAL_ENUM).toBeUndefined();
    });
  });

  describe('Default Fallbacks', () => {
    test('should return default values if missing or empty', () => {
      const env = createEnv(
        {
          PORT: asNumber({ default: 8080 }),
          DB_HOST: asString({ default: 'localhost' }),
          USE_SSL: asBoolean({ default: false }),
          ENV_MODE: asEnum({ values: ['dev', 'prod'], default: 'dev' }),
        },
        { env: { PORT: '', DB_HOST: undefined, USE_SSL: '  ' } },
      );

      expect(env.PORT).toBe(8080);
      expect(env.DB_HOST).toBe('localhost');
      expect(env.USE_SSL).toBe(false);
      expect(env.ENV_MODE).toBe('dev');
    });
  });

  describe('Range and Pattern Constraints', () => {
    test('should validate asNumber boundaries (min and max)', () => {
      expect(() =>
        createEnv(
          {
            PORT: asNumber({ min: 1024, max: 65535 }),
          },
          { env: { PORT: '80' } },
        ),
      ).toThrow();

      expect(() =>
        createEnv(
          {
            PORT: asNumber({ min: 1024, max: 65535 }),
          },
          { env: { PORT: '70000' } },
        ),
      ).toThrow();

      const env = createEnv(
        {
          PORT: asNumber({ min: 1024, max: 65535 }),
        },
        { env: { PORT: '3000' } },
      );
      expect(env.PORT).toBe(3000);
    });

    test('should validate asString regex pattern matching', () => {
      expect(() =>
        createEnv(
          {
            API_VERSION: asString({ pattern: /^v[0-9]+$/ }),
          },
          { env: { API_VERSION: 'version1' } },
        ),
      ).toThrow();

      const env = createEnv(
        {
          API_VERSION: asString({ pattern: /^v[0-9]+$/ }),
        },
        { env: { API_VERSION: 'v2' } },
      );
      expect(env.API_VERSION).toBe('v2');
    });
  });

  describe('Edge-Native Custom Env Source override', () => {
    test('should resolve from custom env parameter and bypass process.env', () => {
      const customEnvSource = {
        APP_TITLE: 'CustomEdgeApp',
        APP_THREADS: '8',
      };

      const env = createEnv(
        {
          APP_TITLE: asString(),
          APP_THREADS: asNumber(),
        },
        { env: customEnvSource },
      );

      expect(env.APP_TITLE).toBe('CustomEdgeApp');
      expect(env.APP_THREADS).toBe(8);
      expect(process.env.APP_TITLE).toBeUndefined();
    });
  });
});
