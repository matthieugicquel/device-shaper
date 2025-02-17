import { createDevice } from "#src/android/createDevice";
import { getInteractors } from "#src/android/interactors";
import { getModifiers } from "#src/android/modifiers";
import { listDevices } from "#src/android/queries/devices";
import type { DeviceShaper } from "#src/types";

export const android: DeviceShaper = {
  getDevices: listDevices,
  createDevice: createDevice,
  getModifiers,
  getInteractors,
};
