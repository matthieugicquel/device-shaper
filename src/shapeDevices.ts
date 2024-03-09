import * as R from "remeda";

import type { DeviceDefinition, ToTargetConfig } from "./deviceShaper.types";
import type { MatchSuccessResult } from "./match";
import { matchTargetToExisting } from "./match";
import { createSimctlShaper } from "./simctl/simctl";
import { reporter } from "#vzr/reporter/reporter";
import { createDebug } from "#vzr/utils/debug";
import { impossible, knownErrorWithoutStack } from "#vzr/utils/error";

const debug = createDebug("device-shaper");

export const shapeDevices = async (config: ToTargetConfig) => {
  // const byPlatform = R.groupBy(config.devices, R.prop("platform"));
  // const iosTargets = byPlatform["ios"] ?? [];

  const simctl = createSimctlShaper();

  const { devices: existingDevices } = await simctl.fetchState();

  const matchResults = config.devices.map((device) => {
    return matchTargetToExisting(device, existingDevices);
  });

  const validExistingTargets = R.filter(
    matchResults,
    (matchResult): matchResult is MatchSuccessResult => matchResult.result === "match",
  );

  const impossibleTargets = R.filter(
    matchResults,
    (matchResult) => matchResult.result === "impossible",
  );

  if (impossibleTargets.length) {
    reporter.error(
      knownErrorWithoutStack(
        "Some targets are impossible to reach",
        R.map(impossibleTargets, R.prop("problem")),
      ),
    );
  }

  // 3. Create the missing devices

  const toCreate = R.filter(
    matchResults,
    (matchResult) => matchResult.result === "must-create-device",
  );

  debug("creating devices", R.map(toCreate, R.prop("target")));

  const creationResults = await Promise.allSettled(
    R.map(toCreate, (matchResult) => {
      return simctl.createDevice({ ...matchResult.target });
    }),
  );

  const [validCreations, creationErrors] = R.partition(
    creationResults,
    (creation): creation is PromiseFulfilledResult<DeviceDefinition> =>
      creation.status === "fulfilled",
  );

  debug("created devices", validCreations);

  if (creationErrors.length) {
    reporter.error(knownErrorWithoutStack("Some devices could not be created", creationErrors));
  }

  const validResults = [...validExistingTargets, ...validCreations.map(R.prop("value"))];

  // 4. Apply "mutable" changes to the devices

  const shapingResults = await Promise.all(
    validResults.map((validResult) => {
      if (!("device" in validResult)) throw impossible();

      return simctl.shapeDevice(validResult.target);
    }),
  );

  return shapingResults;
};
