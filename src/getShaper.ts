import type { DeviceTarget } from "./deviceShaper.types";
import { createSimctlShaper } from "./simctl/simctl";
import { unimplemented } from "#vzr/utils/error";

export const getShaper = (target: DeviceTarget) => {
  if (target.platform === "ios") {
    return createSimctlShaper();
  }

  throw unimplemented();
};
