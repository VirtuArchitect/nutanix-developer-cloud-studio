import { resolve } from "node:path";
import { createApiServer } from "./apiServer";
import { JsonFileStore, MemoryStore } from "./storage";

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? "0.0.0.0";
const dataFile = process.env.NDC_DATA_FILE;
const staticDir = process.env.NDC_STATIC_DIR ? resolve(process.env.NDC_STATIC_DIR) : undefined;

const store = dataFile ? new JsonFileStore(resolve(dataFile)) : new MemoryStore();
const server = createApiServer({ store, staticDir });

server.listen(port, host, () => {
  console.log(`NDC Studio API listening on http://${host}:${port}`);
  if (staticDir) {
    console.log(`Serving static frontend from ${staticDir}`);
  }
});
