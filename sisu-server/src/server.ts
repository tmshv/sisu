import { MongoClient } from "mongodb";
import { createServer } from "./app";
import logger from "./util/logger";
import { MONGODB_URI, PORT } from "./util/secrets";

async function getDb() {
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
    });

    return client.db("sisu");

    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error(error);

    process.exit(1);
  }
}

async function main() {
  const db = await getDb();
  const app = createServer(db);

  /**
   * Start Express server.
   */
  const server = app.listen(PORT, () => {
    console.log(
      "  App is running at http://localhost:%d in %s mode",
      PORT,
      app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
  });
}

main();