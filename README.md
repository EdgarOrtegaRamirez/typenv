# 🛠️ typenv

`typenv` is a lightweight TypeScript library designed for managing environment variables with type safety in JavaScript server environments.
It enables developers to define, validate, and access environment variables in a structured manner, ensuring that applications are configured correctly.

## 🚀 Features

- **Type Safety**: Leverage TypeScript to enforce expected types for environment variables, reducing runtime errors.
- **Validation**: Automatically validate environment variables against defined schemas, ensuring correctness.
- **Zero Dependencies**: Efficient and easy to integrate into your projects without external libraries.
- **Custom Error Handling**: Receive clear and descriptive error messages when environment variables are missing or invalid.

## Design Decisions

- Focused on JavaScript server environments.
- No reliance on external schema validation libraries.
- Does not support environment variable loading, nesting, grouping, or transformations.
- No default values or optional environment variables.
- Empty string variables (e.g., `AN_API_URL=` or `AN_API_URL=  `) are treated as `undefined`.

## 📦 Installation

You can install `typenv` via:

```sh
npm install --save @edgarortega/typenv
bun add @edgarortega/typenv
```

## 📖 Usage

Here's how to use `typenv` in your project:

```ts
// create a env.ts file in your root
import { createEnv, asString, asEnum, asBoolean, asNumber } from "@edgarortega/typenv";
// Define your environment variables schema
export const env = createEnv({
  URL: asString(), // Must be a string
  NODE_ENV: asEnum({ values: ["dev", "PROD"] as const }), // Must be one of the specified values
  FEATURE_FLAG: asBoolean(), // Must be a boolean
  MAX_RETRIES: asNumber(), // Must be a number
});
// inferred type for the `env` variable
const env: {
  URL: string;
  NODE_ENV: "dev" | "PROD";
  FEATURE_FLAG: boolean;
  MAX_RETRIES: number;
};
// Access your validated environment variables
console.log({ env });
```

## 🛠️ API

### `createEnv(schema: Schema)`

Creates and validates environment variables based on the provided schema.

- **Parameters**:
  - `schema`: An object defining the expected environment variables and their types.
- **Returns**: An object containing the validated environment variables.

- **Throws**: `TypenvError` if any environment variable is not defined or invalid.

### Validation Functions

- `asString()`: Validates and returns a string environment variable.
- `asEnum(values: string[] as const)`: Validates and returns an environment variable that must be one of the specified enum values.
- `asBoolean()`: Validates and returns a boolean environment variable.
- `asNumber()`: Validates and returns a number environment variable.

## ⚠️ Error Handling

If an environment variable is missing or invalid, `typenv` will throw a `TypenvError` with a descriptive message, helping you quickly identify configuration issues.

## 📝 License

This project is licensed under the X License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## 📞 Contact

For any inquiries, please reach out to [your-email@example.com](mailto:your-email@example.com).

---

Happy coding! 🎉
