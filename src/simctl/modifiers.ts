import { mapKeys } from "remeda";
import { match } from "ts-pattern";

import { bug, todo } from "#std/error";
import { ensureInPlistDict } from "#std/plist";
import { isRunCommandError, run } from "#std/run";

import type { DeviceModifiers } from "../types";
import { getSimulatorDataFilePath } from "./helpers";
import { listSimulators } from "./queries/devices";

export const getModifiers = (uniqueId: string): DeviceModifiers => {
  return {
    approvedSchemes: {
      getCurrent() {
        return undefined;
      },
      async apply(targetValue) {
        const plistPath = getSimulatorDataFilePath(
          uniqueId,
          "./Library/Preferences/com.apple.launchservices.schemeapproval.plist",
        );

        const plistData = mapKeys(targetValue, (key) => {
          return `com.apple.CoreSimulator.CoreSimulatorBridge-->${key}`;
        });

        await ensureInPlistDict(plistPath, plistData);
      },
    },

    locale: {
      getCurrent() {
        return undefined;
      },
      async apply(targetValue) {
        // NOTE: this file doesn't exist before first boot, but pre-writing the file with only necessary keys seems to work
        const plistPath = getSimulatorDataFilePath(
          uniqueId,
          "./Library/Preferences/.GlobalPreferences.plist",
        );

        const plistData = {
          AppleLocale: targetValue.replace("-", "_"), // TODO: clarify the expected format/allowed values
          AppleLanguages: [targetValue],
        };

        await ensureInPlistDict(plistPath, plistData);

        console.warn(
          "TODO: manage rebooting (the locale won't be taken into account until the device is rebooted)",
        );
      },
      requiresBoot: true,
    },

    state: {
      async getCurrent() {
        const simulators = await listSimulators();
        const sim = simulators.find((simulator) => simulator.uniqueId === uniqueId);
        if (!sim) throw bug(`Simulator ${uniqueId} not found`);
        return sim.state;
      },
      async apply(targetValue) {
        const subcommand = match(targetValue)
          .with("booted", () => "boot")
          .with("shutdown", () => "shutdown")
          .exhaustive();

        try {
          await run("xcrun", ["simctl", subcommand, uniqueId]);
        } catch (error) {
          if (!isRunCommandError(error)) throw error;

          if (error.exitCode === 149) return; // Unable to boot device in current state: Booted

          throw error;
        } finally {
          listSimulators.invalidate();
        }
      },
    },

    statusBar: {
      getCurrent() {
        // xcrun simctl status_bar <device> list
        throw todo("statusBar getCurrent");
      },
      async apply(targetValue) {
        const params: string[] = [];
        if (targetValue.time) params.push("--time", targetValue.time);

        // TODO: warnings on broken versions https://federated.saagarjha.com/notice/AUwNsSsOOCWFc8qCvY

        await run("xcrun", ["simctl", "status_bar", uniqueId, "override", ...params]);
      },
    },

    visibility: {
      getCurrent() {
        return undefined;
      },
      async apply(targetValue) {
        await match(targetValue)
          .with("visible", () =>
            run("open", [
              "-a",
              "Simulator",
              "--background", // Don't steal focus
              "--args",
              "CurrentDeviceUDID",
              uniqueId,
            ]),
          )
          .with("headless", () => todo("visibility: headless"))
          .exhaustive();
      },
    },
  };
};
