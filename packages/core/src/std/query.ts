import { createDebug } from "#std/debug";

import type { Awaitable } from "#src/std/types";

type Query<TData> = {
  (): Promise<TData>;
  invalidate: () => void;
  setData: (data: TData) => void;
};

type QueryState<TData> =
  | { status: "success"; data: TData }
  | { status: "error"; error: unknown }
  | { status: "pending"; promise: Awaitable<TData> }
  | { status: "idle" };

export const createQuery = <TData>(queryFn: () => Awaitable<TData>): Query<TData> => {
  const debug = createDebug(`std:query:${queryFn.name || "anonymous"}`);

  let cache: QueryState<TData> = { status: "idle" };

  const query: Query<TData> = async () => {
    if (cache.status === "success") {
      debug("returning cached data");

      return cache.data;
    }

    if (cache.status === "pending") {
      debug("was already fetching, returning promise");

      return cache.promise;
    }

    try {
      debug("fetching");

      const promise = queryFn();
      cache = { status: "pending", promise };

      const newData = await promise;

      debug("fetched");

      cache = { status: "success", data: newData };

      return newData;
    } catch (error) {
      debug("errored");
      cache = { status: "error", error };
      throw error;
    }
  };

  query.invalidate = () => {
    cache = { status: "idle" };
  };

  query.setData = (data: TData) => {
    cache = { status: "success", data };
  };

  return query;
};
