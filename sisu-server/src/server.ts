import errorHandler from "errorhandler";
import { createServer } from "./app";
import { MongoClient } from "mongodb";
import { MONGODB_URI, PORT } from "./util/secrets";

async function getDb() {
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: false,
    });

    return client.db("sisu");

    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
}

async function main() {
  const db = await getDb();
  const app = createServer(db);

  /**
   * Error Handler. Provides full stack - remove for production
   */
  app.use(errorHandler());

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