// type EnvSchema = {
//   [key: string]: "string" | "number" | "boolean";
// };

// type TypedEnv<T extends EnvSchema> = {
//   [K in keyof T]: T[K] extends "string"
//     ? string
//     : T[K] extends "number"
//       ? number
//       : T[K] extends "boolean"
//         ? boolean
//         : never;
// };

class EnvError extends Error {
  constructor({ message, key }: { message: string; key: string }) {
    super(`Env var ${key} ${message}`);
    this.name = 'EnvError';
  }
}

// function coerceValue({
//   key,
//   value,
//   type,
//   emptyStringAsUndefined,
// }: {
//   key: string;
//   value: string | undefined | null;
//   type: "string" | "number" | "boolean";
//   emptyStringAsUndefined?: boolean;
// }): string | number | boolean | undefined {
//   if (
//     value === undefined ||
//     value === null ||
//     (emptyStringAsUndefined && value === "")
//   ) {
//     throw new EnvError({ key, message: "is not defined" });
//   }

//   switch (type) {
//     case "string":
//       return value;
//     case "number": {
//       const number = Number(value);
//       if (Number.isNaN(number)) {
//         throw new EnvError({ key, message: `is not a number <${value}>` });
//       }
//       return number;
//     }
//     case "boolean":
//       if (value !== "true" && value !== "false") {
//         throw new EnvError({ key, message: `is not a boolean <${value}>` });
//       }
//       return value.toLowerCase() === "true";
//     default:
//       throw new EnvError({ key, message: `unsupported type ${type}` });
//   }
// }

// export function createEnv<SCHEMA extends EnvSchema>({
//   schema,
//   emptyStringAsUndefined = false,
// }: {
//   schema: SCHEMA;
//   emptyStringAsUndefined?: boolean;
// }) {
//   const env = {} as TypedEnv<SCHEMA>;

//   for (const [key, type] of Object.entries(schema)) {
//     const value = process.env[key];
//     const coercedValue = coerceValue({
//       key,
//       value,
//       type,
//       emptyStringAsUndefined,
//     });

//     // biome-ignore lint/suspicious/noExplicitAny: allowed
//     env[key as keyof SCHEMA] = coercedValue as any;
//   }

//   return Object.freeze(env);
// }
