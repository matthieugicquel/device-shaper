import type { PartialDeep } from "type-fest";

export type PlatformState = {
  devices: DeviceDefinition[];
  runtimes: RuntimeDefinition[];
};

export type RuntimeDefinition = {
  osVersion: OsVersion;
};

/**
 * The base definition of a device, things we can't change but can just match against
 */
export type DeviceDefinition = {
  platform: "ios";
  /**
   * udid on ios
   */
  uniqueId: string;
  /**
   * The "user-facing" device name
   */
  name: string;
  model: DeviceModel;
  osVersion: OsVersion;
};

export type DeviceModel = `iPhone-${string}` | `iPad-${string}`; // TODO
export type OsVersion = `${number}.${number}`;

/**
 * Thing we can change on an existing/created device
 */
export type DeviceConfig = {
  state: "booted" | "shutdown";
  visibility: "visible" | "headless";
  statusBar: {
    time: string;
  };
  /**
   * A list of schemes and the target bundle id
   * @example `{ "vzr": "com.vzr.app" }`
   */
  approvedSchemes: Record<string, string>;
  // locale: unknown; // https://www.npmjs.com/package/set-ios-simulator-language?activeTab=explore
  // installedApps: AppTarget[];
  // permissions: unknown;
  // location: unknown;
  // network: unknown;
  // appearance: "light" | "dark";
  // ui: {
  //   statusBar: unknown;
  //   increaseContrast: boolean;
  //   contentSize: unknown;
  // };
};

export type OperationKey = keyof DeviceConfig;

export type DeviceConfigOperations = {
  [key in OperationKey]: (targetValue: PartialDeep<DeviceConfig[key]>) => Promise<void>;
};

export type DeviceTarget = { platform: "ios" } & PartialDeep<DeviceDefinition> &
  PartialDeep<DeviceConfig>;

export type MatchedDeviceTarget = DeviceDefinition & PartialDeep<DeviceConfig>;

export type AppTarget = {
  bundleId: string;
  buildNumber: string;
  version: string;
  state: "foreground" | "background" | "notRunning";
};

export type ToTargetConfig = {
  devices: DeviceTarget[];
  destructivity?: "allow-recreate" | "allow-reboot" | "none";
  /**
   * Helpers that you can provide and will be called when useful to reach the target
   */
  helpers?: {
    /**
     * Build or download the app when needed
     * @returns a filepath to the apk/ipa to install
     */
    getAppPath: (deviceTarget: DeviceTarget, appTarget: AppTarget) => Promise<string> | string;
  };
};

export type DeviceShaper = {
  fetchState: () => Promise<PlatformState>;
  createDevice: (config: DeviceTarget) => Promise<MatchedDeviceTarget>;
  shapeDevice: (config: MatchedDeviceTarget) => Promise<MatchedDeviceTarget>;
};
