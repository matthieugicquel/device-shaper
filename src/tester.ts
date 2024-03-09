import { shapeDevices } from "./shapeDevices";

shapeDevices({
  devices: [
    {
      platform: "ios",
      uniqueId: "8AA40160-430B-42F8-8A58-C45D3B1BD9C6",
      state: "booted",
      visibility: "visible",
      statusBar: {
        time: "9:41",
      },
    },
    {
      platform: "ios",
      name: "iPhone 14",
    },
    {
      platform: "ios",
      osVersion: "16.0",
      state: "booted",
      visibility: "visible",
      statusBar: {
        time: "9:41",
      },
    },
    {
      platform: "ios",
      uniqueId: "8AA40160-AAAA-AAAA-AAAA-C45D3B1BD9C6",
    },
    {
      platform: "ios",
      uniqueId: "8AA40160-430B-42F8-8A58-C45D3B1BD9C6",
      osVersion: "1.0",
    },
    {
      platform: "ios",
      osVersion: "16.2",
      name: "Hello",
      model: "iPhone-14",
    },
  ],
}).catch(console.error);
