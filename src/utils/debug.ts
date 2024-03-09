import createDebugBase from "debug";

export const createDebug = (module: string) => {
  const debug = createDebugBase(`vzr:${module}`);

  debug.log = (...args) => {
    console.error(...args);
  };

  return debug;
};

export const createChildProcessDebug = (module: string) => {
  const debug = createDebugBase(`vzr-cp:${module}`);

  debug.log = (...args) => {
    console.error(...args);
  };

  return debug;
};
