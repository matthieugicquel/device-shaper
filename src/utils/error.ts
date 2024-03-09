import { createDebug } from "./debug";

const debug = createDebug("vzr:utils:error");

/**
 * Try to preserve and show a clean and useful stack trace.
 */
export const knownErrorWithStack = (message: string, help?: unknown) => {
  const error = new KnownError(message, help);

  if (!debug.enabled) {
    error.stack = cleanStack(error.stack) ?? "";
  }

  return error;
};

/**
 * There's no way to point the user to code of his that caused the error.
 */
export const knownErrorWithoutStack = (message: string, help?: unknown, cause?: Error) => {
  const error = new KnownError(message, help);

  error.cause = cause;

  if (!debug.enabled) delete error.stack;

  return error;
};

export class KnownError extends Error {
  help: unknown;

  constructor(message: string, help: unknown, cause?: Error) {
    super(message);
    this.help = help;
    this.cause = cause;
  }
}

export const isKnownError = (error: unknown): error is KnownError => {
  return error instanceof KnownError;
};

const cleanStack = (stack: string | undefined, exclude: string[] = []) => {
  if (!stack) return;

  return stack
    .split("\n")
    .filter((line) => {
      return ![...exclude, "node_modules", "vzr/src/", "node:"].some((exclusion) =>
        line.includes(exclusion),
      );
    })
    .map((line) => line.replaceAll(process.cwd() + "/", ""))
    .join("\n");
};

export const fixYourInstall = (message: string) => {
  throw new Error(message);
};

export const impossible = (comment?: string) => {
  throw new Error(`${comment ?? ""} - This should never happen. Please report this as a bug`);
};

export const unimplemented = (comment?: string) => {
  throw new Error(`This is not implemented yet. ${comment ?? ""}`);
};
