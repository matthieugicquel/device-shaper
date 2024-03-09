class CleanError extends Error {
  override name = "CleanError";
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    this.stack = cleanStack(this.stack, ["utils/error.ts"]);
  }
}

const cleanStack = (stack: string | undefined, exclude: string[] = []) => {
  if (!stack) return;

  return stack
    .split("\n")
    .filter((line) => {
      return ![...exclude, "node_modules", "node:"].some((exclusion) => line.includes(exclusion));
    })
    .map((line) => line.replaceAll(process.cwd() + "/", ""))
    .join("\n");
};

class Bug extends CleanError {
  override name = "Bug";
}

export const bug = (comment: string) => {
  throw new Bug(`You encountered an impossible situation, report a bug: ${comment}`);
};

class Todo extends CleanError {
  override name = "Todo";
}

export const todo = (comment: string) => {
  throw new Todo(`TODO: ${comment}`);
};

class EnvError extends CleanError {
  override name = "EnvError";
}

export const fixYourInstall = (message: string, error?: Error) => {
  throw new EnvError(`There's an issue with your system/env: ${message}`, { cause: error });
};

class UsageError extends CleanError {
  override name = "UsageError";
}

export const usageError = (message: string) => {
  throw new UsageError(message);
};

class UnknownError extends CleanError {
  override name = "UnknownError";
}

export const unknownError = (message: string, error: Error) => {
  throw new UnknownError(message, { cause: error });
};
