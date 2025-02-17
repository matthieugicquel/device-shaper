import { match } from "ts-pattern";

import { getInteractors as getInteractors_Android } from "#src/android/interactors";
import { getInteractors as getInteractors_iOS } from "#src/simctl/interactors";

export const interact = (id: { platform: "ios" | "android"; uniqueId: string }) => {
  return match(id.platform)
    .with("ios", () => getInteractors_iOS(id.uniqueId))
    .with("android", () => getInteractors_Android(id.uniqueId))
    .exhaustive();
};
