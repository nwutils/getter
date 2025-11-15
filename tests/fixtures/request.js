import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const filePath = path.resolve("./tests/fixtures/test.txt"); // ensure this file exists

const server = http.createServer((req, res) => {
  if (req.url === "/test.txt") {
    fs.createReadStream(filePath)
      .on("open", () => {
        res.writeHead(200, { "Content-Type": "text/plain" });
      })
      .on("error", () => {
        res.writeHead(500);
        res.end("Could not read file");
      })
      .pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

export default server;
