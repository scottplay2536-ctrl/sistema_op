const assert = require("assert");
const http = require("http");
const test = require("node:test");
const { handleRequest } = require("../src/server");

test("health endpoint returns healthy status", async () => {
  const server = http.createServer(handleRequest);

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/health`);
  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(body, { status: "healthy" });

  await new Promise((resolve) => server.close(resolve));
});
