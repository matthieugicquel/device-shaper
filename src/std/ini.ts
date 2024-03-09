import fs from "fs/promises";
import { parse } from "ini";

export const readIniIfExists = async (filepath: string) => {
  try {
    const text = await fs.readFile(filepath, "utf8");
    return parse(text);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
};
