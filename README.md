<h1 align="center">device-shaper 🏄‍♂️</h1>

<p align="center"><i>JS/TS APIs to manipulate iOS and Android simulators</i></p>

---

## Installation

You'll have to figure it out yourself, this package is not ready for serious usage 🙂.

## Creating or modifying devices

```ts
import { shapeDevice } from "@devices/shaper";

// Just boot some emulator, not worrying about the details
await shapeDevice({
  platform: "android",
  state: "booted",
});

// Or be very specific, the device will be created if necessary
await shapeDevice({
  platform: "ios",
  model: "iPhone-13-Pro",
  osVersion: "17.0",
});

// Modify characteristics of an existing device by specifying its id
await shapeDevice({
  platform: "ios",
  uniqueId: "A1B2C3D4-1234-5678-9ABC-1234567890AB",
  locale: "fr-FR",
  approvedSchemes: {
    example: "com.example.app",
  },
  statusBar: {
    time: "12:34",
  },
});
```

### Matching rules

The `shapeDevice` function will try to match the provided characteristics to an existing device

Some characteristics are "immutable": a mismatch will result in creating a new device:

- `platform`
- `model`
- `osVersion`
- `uniqueId`
- `name`

The other characteristcs will be modified on the first matching device.

In any case, the resulting situation will be devices that match the input (or an error if you request something impossible).

## Interacting with devices

```ts
// Example: take a screenshot of all booted devices

import { listDevices, interactWith } from "@devices/shaper";

const devices = await listDevices({ state: "booted" });

await Promise.all(
  devices.map((device) => interactWith(device).screenshot(`./${device.platform}.png`)),
);
```

## Why?

There are [already](https://github.com/react-native-community/cli/blob/54d48a4e08a1aef334ae6168788e0157a666b4f5/packages/cli-platform-android/src/commands/runAndroid/adb.ts) [dozens](https://github.com/expo/orbit/blob/main/packages/eas-shared/src/run/android/adb.ts) [of](https://github.com/wix/Detox/blob/f32a16c0ba884cf7256317671c72e16a293ed30b/detox/src/devices/common/drivers/android/exec/ADB.js#L13) JS implementations of these features, so I figured ["why not one more?"](https://xkcd.com/927/).

More seriously, the difference is that this lib is focused on providing these APIs instead of including this code in some higher-level project (CLI, test runner, etc...). Maybe it will be used by those other projects one day.

## Roadmap

There is no delivery date for any of these features, but reach out if you want to help!

- [ ] A full test suite
- [ ] Support for all the platforms you can imagine (browser, TV, watches, VR, etc.)
- [ ] Physical devices when it makes sense (android for starters, it shouldn't be too complicated)
- [ ] More characteristics to shape (network, GPS, sensors, etc.)
- [ ] More interactions (swipe, tap, etc.)
