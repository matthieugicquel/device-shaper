import { statSync } from "node:fs";

export const pathExists = (path: string) => {
  try {
    statSync(path);

    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
};
