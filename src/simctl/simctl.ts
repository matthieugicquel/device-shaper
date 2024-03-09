import type { DeviceShaper } from "../deviceShaper.types";
import { createDevice } from "./createDevice";
import { fetchState } from "./fetchState";
import { findBestAvailableRuntime } from "./helpers";
import {
  createSimctlDeviceOperations,
  orderedSimctlOperations,
} from "./operations";
import { createDebug } from "#vzr/utils/debug";
import { unimplemented } from "#vzr/utils/error";

const debug = createDebug("device-shaper:simctl");

export const createSimctlShaper = (): DeviceShaper => {
  return {
    fetchState,
    async createDevice(target) {
      const model = target.model;

      if (!model) {
        throw unimplemented(); // TODO: pick a default model
      }

      const definition = {
        model: model,
        name: target.name ?? model,
        osVersion:
          target.osVersion ?? findBestAvailableRuntime((await fetchState()).runtimes).osVersion,
      };

      const { uniqueId } = await createDevice(definition);

      return { ...target, ...definition, uniqueId };
    },
    async shapeDevice(target) {
      const uniqueId = target.uniqueId;

      const modifiedConfig = structuredClone(target);

      const operations = createSimctlDeviceOperations(uniqueId);

      for (const operationKey of orderedSimctlOperations) {
        const targetValue = target[operationKey];
        if (!targetValue) continue;

        const operation = operations[operationKey];
        if (!operations[operationKey]) {
          debug(`unimplemented operation ${operationKey} -> %o`, targetValue);
          continue;
        }

        debug(`applying operation ${operationKey} -> %o`, targetValue);

        // @ts-expect-error - Not sure how to handle that with TS
        await operation(targetValue);

        // @ts-expect-error - Not sure how to handle that with TS
        modifiedConfig[operationKey] = targetValue;
      }

      return modifiedConfig;
    },
  };
};
