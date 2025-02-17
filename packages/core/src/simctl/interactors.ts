import { runToBuffer } from "#std/run";

import { runSimctl } from "#src/simctl/helpers";
import type { DeviceInteractors } from "#src/types";

export const getInteractors = (uniqueId: string): DeviceInteractors => {
  return {
    // @ts-expect-error -- If some genius knows how to type this, please let me know
    async screenshot(destinationPath) {
      if (typeof destinationPath === "string") {
        await runSimctl(["io", uniqueId, "screenshot", destinationPath]);

        return;
      }

      return runToBuffer("xcrun", ["simctl", "io", uniqueId, "screenshot", "-"]);
    },

    async openURL(url) {
      await runSimctl(["openurl", uniqueId, url]);
    },
  };
};
