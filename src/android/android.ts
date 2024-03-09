import type { DeviceShaper } from "../types";
import { createDevice } from "./createDevice";
import { getInteractors } from "./interactors";
import { getModifiers } from "./modifiers";
import { listDevices } from "./queries/devices";

export const android: DeviceShaper = {
  getDevices: listDevices,
  createDevice: createDevice,
  getModifiers,
  getInteractors,
};
