import { createServer } from "node:http";
import {
  createMockPrismState,
  handleMockPrismRequest,
  loadMockPrismFixture,
} from "./mockPrismCentralHarness";

const port = Number(process.env.MOCK_PRISM_PORT ?? process.env.PORT ?? 9440);
const host = process.env.MOCK_PRISM_HOST ?? process.env.HOST ?? "0.0.0.0";
const state = createMockPrismState(loadMockPrismFixture());

const server = createServer((request, response) => {
  const chunks: Buffer[] = [];
  request.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
  request.on("end", () => {
    try {
      const text = Buffer.concat(chunks).toString("utf8");
      const body = text ? (JSON.parse(text) as Record<string, unknown>) : undefined;
      const result = handleMockPrismRequest(state, {
        method: request.method ?? "GET",
        path: request.url ?? "/",
        authorization: request.headers.authorization,
        body,
      });
      response.writeHead(result.statusCode, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      response.end(JSON.stringify(result.body));
    } catch (error) {
      response.writeHead(500, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          error: "Mock Prism failure",
          message: error instanceof Error ? error.message : "Unknown error.",
        })
      );
    }
  });
});

server.listen(port, host, () => {
  console.log(`Mock Prism Central listening on http://${host}:${port}`);
});
