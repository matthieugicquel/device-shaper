import type execa from "execa";
import { pathExists, readdir } from "fs-extra";
import os from "os";
import path from "path";
import { match } from "ts-pattern";

import { createDebug } from "#std/debug";
import { bug, todo } from "#std/error";
import { readIniIfExists } from "#std/ini";
import { createQuery } from "#std/query";
import { run, runToBuffer } from "#std/run";

const debug = createDebug("android:helpers");

export const getAndroidSdkRoot = createQuery(async (): Promise<string | undefined> => {
  // Inspired by https://github.com/expo/orbit/blob/main/packages/eas-shared/src/run/android/sdk.ts
  if (process.env.ANDROID_HOME && (await pathExists(process.env.ANDROID_HOME))) {
    debug("using $ANDROID_HOME as SDK root", process.env.ANDROID_HOME);
    return process.env.ANDROID_HOME;
  }

  if (process.env.ANDROID_SDK_ROOT && (await pathExists(process.env.ANDROID_SDK_ROOT))) {
    debug("using $ANDROID_SDK_ROOT as SDK root", process.env.ANDROID_SDK_ROOT);
    return process.env.ANDROID_SDK_ROOT;
  }

  const defaultLocation = match(process.platform)
    .with("darwin", () => path.join(os.homedir(), "Library", "Android", "sdk"))
    .with("win32", () => path.join(os.homedir(), "AppData", "Local", "Android", "Sdk"))
    .otherwise(() => path.join(os.homedir(), "Android", "Sdk")); // default to the linux location

  if (defaultLocation && (await pathExists(defaultLocation))) {
    debug("using default location as SDK root", process.env.ANDROID_SDK_ROOT);
    return defaultLocation;
  }

  return undefined;
});

export const getEmulatorExecutable = async () => {
  const sdkRoot = await getAndroidSdkRoot();
  return sdkRoot ? path.join(sdkRoot, "emulator", "emulator") : "emulator";
};

const getAdbExecutable = async () => {
  const sdkRoot = await getAndroidSdkRoot();
  return sdkRoot ? path.join(sdkRoot, "platform-tools", "adb") : "adb";
};

const getEmulatorAdvertisingDir = () => {
  return match(process.platform)
    .with("darwin", () => path.join(os.homedir(), "Library/Caches/TemporaryItems/avd/running"))
    .otherwise(() => {
      throw todo("getEmulatorAdvertisingDir for your platform");
    });
};

/**
 * On Android the `ids` we need to talk to `emulator` and `adb` are different.
 * - `emulator` uses a "virtual device id", that maps to the files in ~/.android/avd
 * - `adb` uses a "serial port", in the form of `emulator-<port>` for emulators
 *
 * In theory, 1 avd can be started multiple times, and each instance will have a different serial port.
 * But we'll handle this when we get there, the feature is experimental anyway
 */
const getAdbIdForAvd = async (avdId: string): Promise<string | undefined> => {
  // We can map an avd to a serial port by looking at the files in the emulator advertising directory
  const advertisingDir = getEmulatorAdvertisingDir();

  const filenames = (await pathExists(advertisingDir)) ? await readdir(advertisingDir) : [];

  debug(`scanned %p in emulator advertising dir: %o`, advertisingDir, filenames);

  for (const filename of filenames) {
    const config = await readIniIfExists(path.join(advertisingDir, filename));

    if (!config) continue;

    if (config["avd.id"] === avdId && config["port.serial"]) {
      debug("found serial port for avd", avdId, config["port.serial"]);

      return `emulator-${config["port.serial"]}`;
    }
  }
};

export const runAdb = async (avdId: string, args: string[], options?: execa.Options) => {
  const executable = await getAdbExecutable();

  const adbId = await getAdbIdForAvd(avdId);

  if (!adbId) {
    throw bug("Trying to run adb command for an AVD that is not running");
  }

  return run(executable, ["-s", adbId, ...args], options);
};

export const runAdbToBuffer = async (avdId: string, args: string[], options?: execa.Options) => {
  const executable = await getAdbExecutable();

  const adbId = await getAdbIdForAvd(avdId);

  if (!adbId) {
    throw bug("Trying to run adb command for an AVD that is not running");
  }

  return runToBuffer(executable, ["-s", adbId, ...args], options);
};
