type Query<TData> = {
  (): Promise<TData>;
  invalidate: () => void;
};

type QueryState<TData> =
  | { status: "success"; data: TData }
  | { status: "error"; error: unknown }
  | { status: "pending"; promise: Promise<TData> }
  | { status: "idle" };

export const createQuery = <TData>(queryFn: () => Promise<TData>): Query<TData> => {
  let cache: QueryState<TData> = { status: "idle" };

  const query: Query<TData> = async () => {
    if (cache.status === "success") {
      return cache.data;
    }

    if (cache?.status === "pending") {
      return cache.promise;
    }

    try {
      const promise = queryFn();
      cache = { status: "pending", promise };

      const newData = await promise;

      cache = { status: "success", data: newData };

      return newData;
    } catch (error) {
      cache = { status: "error", error };
      throw error;
    }
  };

  query.invalidate = () => {
    cache = { status: "idle" };
  };

  return query;
};
