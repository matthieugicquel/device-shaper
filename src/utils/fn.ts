export const noop = () => {};

export const when = <In extends string, Out>(value: In, mapping: Record<In, Out>): Out => {
  return mapping[value];
};
