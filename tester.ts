/* eslint-disable @typescript-eslint/no-floating-promises */

import assert from "node:assert";
import { test } from "node:test";

import { interactWith, listDevices, shapeDevice } from "./src/index";

test("shutdown all running devices", async () => {
  const devices = await listDevices({ state: "booted" });

  await Promise.all(
    devices.map((device) =>
      shapeDevice({ platform: device.platform, uniqueId: device.uniqueId, state: "shutdown" }),
    ),
  );

  const devicesAfterShutdown = await listDevices({ state: "booted" });

  assert(
    devicesAfterShutdown.length === 0,
    `All devices should have been shutdown, found ${JSON.stringify(devicesAfterShutdown)}`,
  );
});

test("boot 2 devices, no conditions", async () => {
  await Promise.all([
    shapeDevice({
      platform: "ios",
      state: "booted",
      visibility: "visible",
    }),
    shapeDevice({
      platform: "android",
      state: "booted",
      visibility: "visible",
    }),
  ]);

  const devices = await listDevices({ state: "booted" });

  assert(
    devices.length >= 2,
    `2 devices should have been booted, found ${JSON.stringify(devices)}`,
  );
});

test("opens url", async () => {
  const devices = await listDevices({ state: "booted" });

  await Promise.all(devices.map((device) => interactWith(device).openURL("http://info.cern.ch")));
});

test("set status bar", async () => {
  const devices = await listDevices({ state: "booted" });

  await Promise.all(
    devices.map((device) =>
      shapeDevice({
        platform: device.platform,
        uniqueId: device.uniqueId,
        statusBar: {
          time: "05:42",
        },
      }),
    ),
  );
});

test("take screenshots", async () => {
  const devices = await listDevices({ state: "booted" });

  await Promise.all(
    devices.map((device) => interactWith(device).screenshot(`./${device.platform}.png`)),
  );
});

test.skip("screenshot all already booted device to buffer", async () => {
  const device = await shapeDevice({
    platform: "ios",
    state: "booted",
  });

  const buffer = await interactWith(device).screenshot();

  assert(buffer instanceof Buffer);
  assert(buffer.length > 1000);
});

test.skip("create iOS device - default model", async () => {
  const randomString = Math.random().toString(36).substring(2, 6);

  const result = await shapeDevice({
    platform: "ios",
    state: "booted",
    visibility: "visible",
    name: `iPhone-${randomString}`,
  });

  console.log("result", result);
});

test.skip("create Android device", async () => {
  const randomString = Math.random().toString(36).substring(2, 6);

  const result = await shapeDevice({
    platform: "android",
    state: "booted",
    model: "pixel_7_pro",
    name: `Pixel-${randomString}`,
  });

  console.log("result", result);
});

test.skip("list all devices", async () => {
  const devices = await listDevices({});

  console.log("Devices", devices);
});
