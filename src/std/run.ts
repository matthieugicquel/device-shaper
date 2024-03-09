import execa from "execa";

import { sleep } from "./async";
import { createDebug } from "./debug";
import { bug } from "./error";

const debug = createDebug("utils:run");

export const run = async (
  file: string,
  args: string[],
  options?: execa.Options,
): Promise<string> => {
  debug("running %s", [file, ...(args ?? [])].join(" "));
  const result = await execa(file, args, options);
  debug("ran     %s", result.command);

  return result.stdout;
};

type RunDetachedOptions = {
  readyString: string;
  timeout: number;
};

export const runDetached = async (
  file: string,
  args: string[],
  options: RunDetachedOptions,
): Promise<void> => {
  const commandString = [file, ...(args ?? [])].join(" ");

  debug("starting detached %s", commandString);

  const subprocess = execa(file, args, {
    stdio: "pipe",
    // Running detached on Windows causes a CMD window to popup. windowsHide:true does not work. Check https://github.com/nodejs/node/issues/21825
    detached: process.platform !== "win32",
  });

  subprocess.unref();

  if (!subprocess.stderr || !subprocess.stdout) {
    throw bug(`Could not spawn process ${file}`);
  }

  let isReady = false;

  subprocess.stdout.on("data", (chunk: unknown) => {
    const text = String(chunk);
    if (text.includes(options.readyString)) {
      isReady = true;
      debug("found %s for %s in stdout", options.readyString, file);
    }
  });

  subprocess.stderr.on("data", (chunk: unknown) => {
    const text = String(chunk);
    if (text.includes(options.readyString)) {
      isReady = true;
      debug("found %s for %s in stderr", options.readyString, file);
    }
  });

  const startTime = Date.now();

  while (Date.now() - startTime < options.timeout) {
    if (isReady) {
      return;
    }

    if (subprocess.killed) {
      await subprocess; // Just throw the error
    }

    await sleep(100);
  }

  throw new Error(`Timed out waiting for "${options.readyString}" from process "${file}"`);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isRunCommandError = (error: any): error is execa.ExecaError => {
  return "stderr" in error;
};
