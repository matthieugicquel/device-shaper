import { bug, fixYourInstall } from "#std/error";
import { run } from "#std/run";

import { listDevices } from "#src/android/queries/devices";
import { listRuntimes } from "#src/android/queries/runtimes";
import type { DeviceId, DeviceTarget } from "#src/types";

export const createDevice = async (target: DeviceTarget): Promise<DeviceId> => {
  if (target.platform !== "android") {
    throw bug("called android shaper to create non-Android device");
  }

  const name = target.name ?? target.model ?? "default";

  const availableRuntimes = await listRuntimes();

  const runtime = (() => {
    const bestRuntime = availableRuntimes.sort((a, b) => {
      if (a.osVersion < b.osVersion) return -1;
      if (a.osVersion > b.osVersion) return 1;

      return 0;
    })[0];

    if (!bestRuntime) {
      throw fixYourInstall("No Android runtimes found. Install some to create emulators");
    }

    if (target.osVersion) {
      const match = availableRuntimes.find((r) => r.osVersion === target.osVersion);

      if (!match) {
        throw fixYourInstall(`Runtime ${target.osVersion} was requested but is not installed`);
      }

      return match;
    }

    return bestRuntime;
  })();

  const modelArg = target.model ? `--device ${target.model}` : "";

  await run(
    // no to `Do you wish to create a custom hardware profile [no]`
    `echo no | avdmanager create avd --name ${name} --package "${runtime.runtimeId}" ${modelArg}`,
    [],
    { shell: true },
  );

  listDevices.invalidate();

  return { platform: "android", uniqueId: name };
};
