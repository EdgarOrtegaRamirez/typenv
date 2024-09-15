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
  });
});
