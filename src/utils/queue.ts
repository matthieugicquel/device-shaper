// A very simple message queue with 2 functions: enqueing and dequeing
// Dequeing is done by awaiting a promise

export const createQueue = <T>() => {
  const queue: T[] = [];

  let resolve: ((value: T) => void) | null = null;

  return {
    enqueue: (value: T) => {
      if (resolve) {
        resolve(value);
        resolve = null;

        return;
      }

      queue.push(value);
    },
    dequeue: () => {
      if (!queue.length) {
        return new Promise<T>((r) => {
          resolve = r;
        });
      }

      return queue.shift() as T;
    },
  };
};

export type Queue<T> = ReturnType<typeof createQueue<T>>;
