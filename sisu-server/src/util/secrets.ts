import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
    logger.info("using environment variables from .env file");

    dotenv.config({ path: ".env" });
}

export const ENVIRONMENT = process.env.NODE_ENV;
export const PORT = process.env.PORT;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const UPLOAD_DIR = process.env.UPLOAD_DIR;
export const UPLOAD_PUBLIC_PATH = process.env.UPLOAD_PUBLIC_PATH;
export const IMGPROXY_KEY = process.env.IMGPROXY_KEY;
export const IMGPROXY_SALT = process.env.IMGPROXY_SALT;
export const IMGPROXY_BASE_URL = process.env.IMGPROXY_BASE_URL;
export const DATA_TOKEN = process.env.DATA_TOKEN;
export const DATA_URL_BASE = process.env.DATA_URL_BASE;

if (!MONGODB_URI) {
    logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
    process.exit(1);
}

if (!PORT) {
    logger.error("No port specified. Set PORT environment variable.");
    process.exit(1);
}

if (!JWT_SECRET) {
    logger.error("Set JWT_SECRET environment variable.");
    process.exit(1);
}
