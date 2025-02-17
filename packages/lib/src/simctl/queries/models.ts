import { z } from "zod";

import { extractDeviceModel, simctlList } from "./all";

export const listModels = async () => {
  const { devicetypes } = await simctlList();

  return (
    DeviceTypesSchema.parse(devicetypes)
      .map((d) => extractDeviceModel(d.identifier))
      // TODO: support for the rest of the iOS family
      .filter((m) => m.startsWith("iPhone"))
  );
};

listModels.invalidate = simctlList.invalidate;

const DeviceTypesSchema = z.array(
  z.object({
    productFamily: z.union([z.literal("iPhone" /* for iPhones and iPod Touch */), z.unknown()]),
    identifier: z.string(),
  }),
);
