/**
 * Compare 2 strings handling some unicode problems
 * sensitivity is set to "accent" to do case insensitive comparison
 * Using case-insensitive as the default because React Native `textTransform: uppercase` shows up as uppercase in the a11y tree
 *
 * TODO: use the configured locale
 */
const collator = new Intl.Collator(undefined, { sensitivity: "accent" });

export const areStringsEqual = (a: string, b: string) => {
  return collator.compare(a, b) === 0;
};
