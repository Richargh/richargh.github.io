import { createServer } from "node:http";
import { render } from "./routes/index.server.ts";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "127.0.0.1";

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(render());
    return;
  }

  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("Not Found");
});

server.listen(port, host, () => {
  console.log(`Mastro bootstrap server listening at http://${host}:${port}/`);
});
