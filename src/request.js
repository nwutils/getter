import fs from "node:fs";
import process from "node:process";
import http from "node:http";
import https from "node:https";
import stream from "node:stream";

/**
 * Download from `url`, save to `filePath`.
 *
 * @function
 * @param {string} url - Download server
 * @param {string} filePath - file path of downloaded content
 * @param {(error) => void} callback - callback function
 * @returns {void}
 */
export default function request(url, filePath, callback) {
  const writeStream = fs.createWriteStream(filePath);

  process.on("SIGINT", function () {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    process.exit();
  });

  // Choose correct client based on URL
  const client = url.startsWith("https:") ? https : http;

  const req = client.get(url, function (res) {
    if (res.statusCode !== 200) {
      writeStream.close();
      fs.unlink(filePath, function () {});
      return callback(new Error(`Request failed with status ${res.statusCode}`));
    }

    stream.pipeline(res, writeStream, function (err) {
      if (err) {
        fs.unlink(filePath, function () {});
        return callback(err);
      }
      return callback(null);
    });
  });

  req.on("error", function (err) {
    writeStream.close();
    fs.unlink(filePath, function () {});
    callback(err);
  });
}
