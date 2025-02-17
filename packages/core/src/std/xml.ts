import { XMLParser } from "fast-xml-parser";
import fs from "fs";

export const readXmlIfExists = (filepath: string) => {
  try {
    const text = fs.readFileSync(filepath, "utf8");

    return new XMLParser({ ignoreAttributes: false }).parse(text);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
};
