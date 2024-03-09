import createDebugBase from "debug";

if (process.env.DEBUG) {
  // This is replaced by VZR's babel plugin
  createDebugBase.enable(process.env.DEBUG);
}

export const createDebug = (module: string) => {
  return createDebugBase(`vzr:${module}`);
};
