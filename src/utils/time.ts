export const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const waitFor = async <T>(
  condition: () => T | Promise<T>,
  { timeout = 1000, interval = 100 } = { timeout: 1000, interval: 100 },
) => {
  const startTime = Date.now();

  let savedError: unknown | undefined;

  while (Date.now() - startTime < timeout) {
    try {
      const result = await condition();

      return result;
    } catch (error) {
      savedError = error;
    }

    await sleep(interval);
  }

  throw savedError;
};
