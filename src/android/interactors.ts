import type { DeviceInteractors } from "../types";
import { runAdb } from "./helpers";

export const getInteractors = (uniqueId: string): DeviceInteractors => {
  return {
    async screenshot(destinationPath) {
      await runAdb(uniqueId, ["exec-out", `screencap -p > ${destinationPath}`], { shell: true });
    },
  };
};
