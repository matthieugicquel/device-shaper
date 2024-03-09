import { omitBy } from "remeda";
import * as simplePlist from "simple-plist";
import { promisify } from "util";

import { createDebug } from "#std/debug";

const debug = createDebug("plist");

/**
 * Ensures that the given key/values are in the plist at the given path.
 * - Create the plist if it doesn't exist
 * - Update the plist if it exists, adding the provided pairs, and removing any key that has undefined as its value
 *
 * @param plistPath
 * @param data
 */
export const ensureInPlistDict = async (
  plistPath: string,
  data: Record<string, string | string[] | undefined>,
) => {
  const existingPlist = await readPlistIfExists(plistPath);

  const newPlist = existingPlist ? { ...existingPlist, ...data } : data;

  // If a key is undefined, we want to force it to be removed from the plist
  const withoutUndefined = omitBy(newPlist, (value) => value === undefined);

  debug("writing to plist %p", plistPath);

  await writeBinaryPlist(plistPath, withoutUndefined);
};

const readPlistIfExists = async (filepath: string) => {
  try {
    return await promisify(simplePlist.readFile)(filepath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
};

const writeBinaryPlist = promisify(simplePlist.writeBinaryFile);
