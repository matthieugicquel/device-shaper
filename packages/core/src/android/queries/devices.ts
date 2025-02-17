import os from "os";

import { createQuery } from "#std/query";
import { run } from "#std/run";

import { getEmulatorExecutable } from "#src/android/helpers";
import type { DeviceDefinition } from "#src/types";

export const listDevices = createQuery(async function listAndroidAvds() {
  const executable = await getEmulatorExecutable();

  const stdout = await run(executable, ["-list-avds"]);

  return parseAvdList(stdout);
});

const parseAvdList = (stdout: string): DeviceDefinition[] => {
  // From https://github.com/expo/orbit/blob/main/packages/eas-shared/src/run/android/emulator.ts

  return (
    stdout
      .split(os.EOL)
      .filter(Boolean)
      /**
       * AVD names cannot contain spaces. This removes extra info lines from the output. e.g.
       * "INFO    | Storing crashdata in: /tmp/android-brent/emu-crash-34.1.18.db
       */
      .filter((name) => !name.trim().includes(" "))
      .map((name) => ({
        platform: "android",
        uniqueId: name,
        name,
        model: "TODO",
        osVersion: "TODO",
      }))
  );
};
