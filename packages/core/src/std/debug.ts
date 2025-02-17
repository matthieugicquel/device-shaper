import createDebugBase from "debug";

createDebugBase.formatters.p = (v: string) => {
  if (v.startsWith(process.cwd())) {
    return v.replace(`${process.cwd()}/`, "");
  }

  const home = process.env.HOME;

  if (typeof home === "string" && v.startsWith(home)) {
    return v.replace(`${home}/`, "~/");
  }

  return v;
};

export const createDebug = (module: string) => {
  const debug = createDebugBase(`devices:${module}`);

  debug.log = (...args) => {
    console.error(...args);
  };

  return debug;
};

export const createChildProcessDebug = (module: string) => {
  const debug = createDebugBase(`devices-cp:${module}`);

  debug.log = (...args) => {
    console.error(...args);
  };

  return debug;
};
