import glob from "fast-glob";

import { createDebug } from "#std/debug";
import { bug, fixYourInstall } from "#std/error";
import { createQuery } from "#std/query";
import { readXmlIfExists } from "#std/xml";

import { getAndroidSdkRoot } from "../helpers";

const debug = createDebug("android:runtimes");

export const listRuntimes = createQuery(async function listAndroidRuntimes() {
  const sdkRoot = await getAndroidSdkRoot();

  if (!sdkRoot) {
    throw fixYourInstall(
      "Could not find Android SDK. Install it and/or set ANDROID_HOME env var properly",
    );
  }

  // An alternative approach would be to parse the output of `sdkmanager --list_installed --verbose`
  // But it feels simpler and more robust to read the definition files ourselves

  const systemImageXmlPaths = await glob(`${sdkRoot}/system-images/**/package.xml`);

  debug("Found %d android system images", systemImageXmlPaths.length);

  return systemImageXmlPaths.map((xmlPath) => {
    const parsedXml = readXmlIfExists(xmlPath);

    const systemImage = parsedXml["ns2:repository"]["localPackage"]["@_path"];

    const apiLevel = parsedXml["ns2:repository"]["localPackage"]["type-details"]["api-level"];

    if (typeof systemImage !== "string") {
      throw bug("Expected systemImage in package.xml to be a string");
    }

    if (typeof apiLevel !== "number" && typeof apiLevel !== "string") {
      throw bug("Expected apiLevel in package.xml to be a string");
    }

    return {
      osVersion: String(apiLevel),
      runtimeId: systemImage,
    };
  });
});
