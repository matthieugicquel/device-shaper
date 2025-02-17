import { createDevice } from "#src/simctl/createDevice";
import { getInteractors } from "#src/simctl/interactors";
import { getModifiers } from "#src/simctl/modifiers";
import { listSimulators } from "#src/simctl/queries/devices";
import type { DeviceShaper } from "#src/types";

export const simctl: DeviceShaper = {
  getDevices: listSimulators,
  createDevice,
  getModifiers,
  getInteractors,
};
