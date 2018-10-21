import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (!fs.existsSync(".env")) {
    logger.error(".env file not found");

    process.exit(1);
}

dotenv.config({ path: ".env" });

export const ENVIRONMENT = process.env.NODE_ENV;
export const PORT = process.env.PORT;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI) {
    logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
    process.exit(1);
}
