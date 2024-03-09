import path from "path";
import { mapKeys } from "remeda";

import type { DeviceConfigOperations } from "../deviceShaper.types";
import { getSimulatorDataPath } from "./helpers";
import { ensureInPlistDict } from "./plist";
import { unimplemented } from "#vzr/utils/error";
import { when } from "#vzr/utils/fn";
import { isRunCommandError, run } from "#vzr/utils/run";

export const createSimctlDeviceOperations = (uniqueId: string): DeviceConfigOperations => {
  return {
    async state(targetValue) {
      const subcommand = when(targetValue, {
        booted: "boot",
        shutdown: "shutdown",
      });

      try {
        await run("xcrun", ["simctl", subcommand, uniqueId]);
      } catch (error) {
        if (!isRunCommandError(error)) throw error;

        if (error.exitCode === 149) return; // Unable to boot device in current state: Booted

        throw error;
      }
    },
    async visibility(targetValue) {
      const fn = when(targetValue, {
        visible: () => run("open", ["-a", "Simulator", "--background"]), // TODO: add currentDeviceUdid param
        headless: () => unimplemented(),
      });

      await fn();
    },
    async statusBar(targetValue) {
      const params: string[] = [];
      if (targetValue.time) params.push("--time", targetValue.time);

      // TODO: https://federated.saagarjha.com/notice/AUwNsSsOOCWFc8qCvY

      await run("xcrun", ["simctl", "status_bar", uniqueId, "override", ...params]);
    },
    async approvedSchemes(targetValue) {
      const plistPath = path.join(
        getSimulatorDataPath(uniqueId),
        "./Library/Preferences/com.apple.launchservices.schemeapproval.plist",
      );

      const plistData = mapKeys(targetValue, (key) => {
        return `com.apple.CoreSimulator.CoreSimulatorBridge-->${key}`;
      });

      await ensureInPlistDict(plistPath, plistData);
    },
  };
};

export const orderedSimctlOperations: (keyof DeviceConfigOperations)[] = [
  "approvedSchemes",
  "state",
  "visibility",
  "statusBar",
];
