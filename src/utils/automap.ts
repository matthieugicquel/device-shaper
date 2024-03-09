export const createAutoMap = <T>(initializer: () => T) => {
  const map = new Map<string, T>();

  return {
    get: (key: string) => {
      const item = map.get(key) ?? initializer();

      map.set(key, item);

      return item;
    },
  };
};
