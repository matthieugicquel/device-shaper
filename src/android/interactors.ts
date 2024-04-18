import type { DeviceInteractors } from "../types";
import { runAdb, runAdbToBuffer } from "./helpers";

export const getInteractors = (uniqueId: string): DeviceInteractors => {
  return {
    // @ts-expect-error -- If some genius knows how to type this, please let me know
    async screenshot(destinationPath) {
      if (typeof destinationPath === "string") {
        await runAdb(uniqueId, ["exec-out", `screencap -p > ${destinationPath}`], { shell: true });
        return;
      }

      return runAdbToBuffer(uniqueId, ["exec-out", "screencap -p"]);
    },
  };
};
