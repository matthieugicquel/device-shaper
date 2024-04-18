import type { PartialDeep } from "type-fest";

import type { Awaitable } from "#std/types";

export type DeviceId = { platform: "ios" | "android"; uniqueId: string };

export type DeviceTarget = PartialDeep<DeviceDefinition> & PartialDeep<DeviceConfig>;

/**
 * The base definition of a device, things we can't change but can just match against
 */
export type DeviceDefinition =
  | {
      platform: "ios";
      uniqueId: string;
      name: string;
      model: DeviceModel;
      osVersion: OsVersion;
    }
  | {
      platform: "android";
      uniqueId: string;
      name: string;
      model: string;
      osVersion: string;
    };

export type DeviceModel = `iPhone-${string}` | `iPad-${string}`;
export type OsVersion = `${number}.${number}`;

/**
 * Things we can change on an existing/created device
 */
export type DeviceConfig = {
  state: "booted" | "shutdown";
  visibility: "visible" | "headless";
  statusBar: {
    time: string;
  };
  /**
   * A list of schemes and the target bundle id
   * @example `{ "my-app": "com.my-app.app" }`
   */
  approvedSchemes: Record<string, string>;
  locale: `${string}-${string}`;
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

export type RuntimeDefinition = {
  osVersion: OsVersion;
};

/**
 * Note that key order is significant. It will be the order in which the modifiers are applied
 */
export type DeviceModifiers = {
  [key in keyof DeviceConfig]: DeviceModifier<PartialDeep<DeviceConfig[key]>>;
};

export type DeviceModifier<T> = {
  requiresBoot?: boolean;
  getCurrent: () => Awaitable<T | undefined>;
  apply: (targetValue: T) => Promise<void>;
};

type ScreenhotFn = {
  (destinationPath: string): Promise<void>;
  (destinationPath?: undefined): Promise<Buffer>;
};

export type DeviceInteractors = {
  screenshot: ScreenhotFn;
};

export type DeviceShaper = {
  getDevices: () => Promise<DeviceDefinition[]>;
  createDevice: (config: DeviceTarget) => Promise<DeviceId>;
  getModifiers: (uniqueId: string) => DeviceModifiers;
  getInteractors: (uniqueId: string) => DeviceInteractors;
};
