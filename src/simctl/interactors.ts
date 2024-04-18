import { run, runToBuffer } from "#std/run";

import type { DeviceInteractors } from "../types";

export const getInteractors = (uniqueId: string): DeviceInteractors => {
  return {
    // @ts-expect-error -- If some genius knows how to type this, please let me know
    async screenshot(destinationPath) {
      if (typeof destinationPath === "string") {
        await run("xcrun", ["simctl", "io", uniqueId, "screenshot", destinationPath]);
        return;
      }

      return runToBuffer("xcrun", ["simctl", "io", uniqueId, "screenshot", "-"]);
    },
  };
};
