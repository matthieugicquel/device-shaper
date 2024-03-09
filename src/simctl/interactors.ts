import { run } from "#std/run";

import type { DeviceInteractors } from "../types";

export const getInteractors = (uniqueId: string): DeviceInteractors => {
  return {
    async screenshot(destinationPath) {
      await run("xcrun", ["simctl", "io", uniqueId, "screenshot", destinationPath]);
    },
  };
};
