import fs from "fs";
import path from "path";
import chalk from "chalk";
import { mkdir } from "fs/promises";

export const JSON_DATA_PATH = path.join(process.cwd(), "assets", "json-data");