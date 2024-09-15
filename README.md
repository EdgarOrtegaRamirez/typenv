# 🛠️ typenv

`typenv` is a lightweight TypeScript library for managing environment variables with type safety.
This package is intended to be used in a JavaScript server environment.

It allows you to define and validate environment variables in a structured way, ensuring that your application has the correct configuration.

## 🚀 Features

- **Type Safety**: Leverage TypeScript to ensure your environment variables are of the expected types.
- **Validation**: Automatically validate environment variables against defined schemas.
- **zero dependencies**: making it efficient and easy to integrate into your projects.
- **Custom Error Handling**: Get clear error messages when environment variables are missing or invalid.

## 📦 Installation

You can install `typenv` via npm:

```sh
npm install typenv
bun add typenv
```

## 📖 Usage

Here's how to use `typenv` in your project:

```ts
import { createEnv, asString, asEnum, asBoolean, asNumber } from "typenv";
// Define your environment variables schema
export const env = createEnv({
  schema: {
    URL: asString(), // Must be a string
    NODE_ENV: asEnum({ values: ["dev", "PROD"] as const }), // Must be one of the specified values
    FEATURE_FLAG: asBoolean(), // Must be a boolean
    MAX_RETRIES: asNumber(), // Must be a number
  },
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
- `asEnum(values: string[])`: Validates and returns an environment variable that must be one of the specified enum values.
- `asBoolean()`: Validates and returns a boolean environment variable.
- `asNumber()`: Validates and returns a number environment variable.

## ⚠️ Error Handling

If an environment variable is missing or invalid, `typenv` will throw a `TypenvError` with a descriptive message, helping you quickly identify configuration issues.

## ⚠️ Limitations

This package does not support optional environment variables nor variables with default values.
All variables defined in the schema must be defined.

## 📝 License

This project is licensed under the X License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## 📞 Contact

For any inquiries, please reach out to [your-email@example.com](mailto:your-email@example.com).

---

Happy coding! 🎉
