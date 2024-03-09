import execa from "execa";
import kleur from "kleur";
import type { SetNonNullable } from "type-fest";

import { reporter } from "#vzr/reporter/reporter";
import type { ReportChildProcessParams } from "#vzr/reporter/reporter.types";
import { createDebug } from "./debug";
import { knownErrorWithoutStack, knownErrorWithStack } from "./error";
import { sleep } from "./time";

const debug = createDebug("utils:run");

export const run = async (
  file: string,
  args: string[],
  options?: execa.Options,
): Promise<string> => {
  const commandString = [file, ...(args ?? [])].join(" ");

  debug("running %s", commandString);
  const result = await execa(file, args, options);
  debug("ran     %s", commandString);

  return result.stdout;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isRunCommandError = (error: any): error is execa.ExecaError => {
  return "stderr" in error;
};

type SpawnedProcess = SetNonNullable<execa.ExecaChildProcess, "stdout" | "stderr">;

export const runProcess = (
  file: string,
  args: string[],
  options?: execa.Options,
  reporterParams?: Partial<ReportChildProcessParams>,
) => {
  const spawnedProcess = execa(file, args, {
    preferLocal: true,
    cleanup: false, // Not sure about this, it seems to cleanup anyway
    ...options,
    env: {
      DEBUG_COLORS: "1",
      VZR: "1", // For our expo config plugin
      // CI: "1",
      ...process.env,
      ...options?.env,
    },
  });

  if (!spawnedProcess.stderr || !spawnedProcess.stdout) {
    throw knownErrorWithStack(`Could not spawn process ${file}`);
  }

  reporter.childProcess({
    prefix: file,
    color: kleur.bgCyan,
    stderr: spawnedProcess.stderr,
    stdout: spawnedProcess.stdout,
    logWithoutDebug: "stderr",
    ...reporterParams,
  });

  void spawnedProcess.on("exit", () => {
    debug("process %s exited", file);
  });

  return spawnedProcess as SpawnedProcess;
};

export const waitForStdoutContent = async (
  proc: SpawnedProcess,
  content: string,
  timeout = 10000,
) => {
  let isReady = false;

  proc.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    if (text.includes(content)) {
      isReady = true;
    }
  });

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (isReady) return;

    if (proc.killed) {
      try {
        await proc;
      } catch (error) {
        if (!isRunCommandError(error)) throw error;
        throw knownErrorWithoutStack(
          `Process "${proc.spawnfile}" was killed before "${content}" was found`,
          undefined,
          error,
        );
      }
    }

    await sleep(100);
  }

  throw new Error(`Timed out waiting for "${content}" from process "${proc.spawnfile}"`);
};
