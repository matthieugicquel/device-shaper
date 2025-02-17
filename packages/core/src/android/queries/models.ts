import { createDebug } from "#std/debug";
import { createQuery } from "#std/query";
import { run } from "#std/run";

const debug = createDebug("android:models");

export const listModels = createQuery(async function listAvdModels() {
  const output = await run("avdmanager", ["list", "device", "--compact"]);

  const models = output.trim().split("\n");

  debug("Found %d android models", models.length);

  return models;
});
