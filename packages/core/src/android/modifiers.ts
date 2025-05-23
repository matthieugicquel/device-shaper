/* eslint-disable require-await */
import { doNothing } from "remeda";
import { match } from "ts-pattern";

import { todo, usageError } from "#std/error";
import { isRunCommandError, runDetached } from "#std/run";

import { getEmulatorExecutable, runAdb } from "#src/android/helpers";
import type { DeviceModifiers } from "#src/types";

// READING: https://dev.to/larsonzhong/most-complete-adb-commands-4pcg

export const getModifiers = (uniqueId: string): DeviceModifiers => {
  const bootArgs: string[] = [];

  return {
    approvedSchemes: {
      async getCurrent() {
        return undefined;
      },
      async apply(_targetValue) {
        // Somewhere to start: `adb shell dumpsys package domain-preferred-apps` and `adb shell pm set-app-links`
        // https://developer.android.com/tools/adb
        throw todo("Android approvedSchemes");
      },
    },

    locale: {
      requiresState: "shutdown",
      // https://developer.android.com/guide/topics/resources/localization#creating-and-using-a-custom-locale
      // https://stackoverflow.com/questions/2417427/changing-the-android-emulator-locale-automatically
      // emulator -avd <avd-name> -change-language fr -change-country CA -change-locale fr-CA (when booting) -> causes boot cycle even when the locale is already the right one
      async getCurrent() {
        return undefined;
      },
      async apply(targetValue) {
        const [language, country] = targetValue.split("-");
        if (!language || !country) {
          throw usageError(`Locale must be in the format "language-country" (got ${targetValue})`);
        }

        bootArgs.push(
          "-change-locale",
          targetValue,
          "-change-language",
          language,
          "-change-country",
          country,
        );
      },
    },

    visibility: {
      requiresState: "shutdown",
      async getCurrent() {
        return undefined;
      },
      async apply(targetValue) {
        match(targetValue)
          .with("visible", doNothing) // this is the default
          .with("headless", () => {
            bootArgs.push("-no-window");
          })
          .exhaustive();
      },
    },

    state: {
      async getCurrent() {
        try {
          const stdout = await runAdb(uniqueId, ["shell", "getprop", "sys.boot_completed"]);
          if (stdout.trim() === "1") return "booted";

          return "shutdown";
        } catch {
          // adb: device 'emulator-5554' not found
          return "shutdown";
        }
      },
      async apply(targetValue) {
        await match(targetValue)
          .with("shutdown", async () => {
            // https://android.stackexchange.com/questions/47989/how-can-i-shutdown-my-android-phone-using-an-adb-command
            // https://stackoverflow.com/questions/20155376/android-stop-emulator-from-command-line#20155436
            try {
              await runAdb(uniqueId, ["emu", "kill"], {
                env: {
                  /*
                   * Reasons for a "force kill" to be necessary:
                   * - The "do you want to save a snpashot dialog"
                   * - probably others
                   * The default time is 20 seconds, we're keeping it but documenting
                   */
                  ANDROID_EMULATOR_WAIT_TIME_BEFORE_KILL: "20", // in seconds
                },
              });
            } catch (error) {
              if (isRunCommandError(error) && error.stderr.includes(": Connection refused")) {
                // emulator not booted -> error: could not connect to TCP port 5554: Connection refused
                // emulator is already shutdown
                return;
              }

              throw error;
            }
          })
          .with("booted", async () => {
            const executable = await getEmulatorExecutable();

            await runDetached(
              executable,
              [
                "-avd",
                uniqueId,
                "-no-audio",
                "-no-boot-anim",
                "-no-snapshot",
                "-no-snapshot-save",
                ...bootArgs,
              ],
              {
                readyString: "| Boot completed",
                timeout: 1000 * 60,
              },
            );
            // TODO: Interesting errors
            // ERROR   | Running multiple emulators with the same AVD
          })
          .exhaustive();
      },
    },

    statusBar: {
      requiresState: "booted",
      // https://android.googlesource.com/platform/frameworks/base/+/master/packages/SystemUI/docs/demo_mode.md
      async getCurrent() {
        return undefined;
      },
      async apply(targetValue) {
        await runAdb(uniqueId, ["shell", "settings", "put", "global", "sysui_demo_allowed", "1"]);

        if (targetValue.time) {
          await runAdb(uniqueId, [
            "shell",
            "am",
            "broadcast",
            "-a",
            "com.android.systemui.demo",
            "-e",
            "command",
            "clock",
            "-e",
            "hhmm",
            targetValue.time,
          ]);
        }
      },
    },
  };
};
