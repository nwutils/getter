import assert from "node:assert";
import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { after, before, describe, it } from "node:test";

import request from "../../src/request.js";
import testServer from "../fixtures/request.js";

describe("request test suite", function () {

    before(async function () {
        await new Promise(resolve => {
            testServer.listen(8080, resolve);
        });
        console.log("[ DEBUG ] Starting test server for request tests...");
    });

    it("downloads a file from a test server", async function () {
        const filePath = path.resolve("./tests/fixtures/cache/test.txt");

        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await request("http://localhost:8080/test.txt", filePath);

        assert.ok(fs.existsSync(filePath), "File should exist after download");
    });

    it("deletes partially downloaded file on SIGINT (Ctrl + C)", async function () {
        const filePath = path.resolve("./tests/fixtures/cache/partial.txt");

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        const child = child_process.spawn("node", ["./tests/fixtures/sigint.js"], {
            stdio: "ignore" // no logs needed
        });

        child.kill("SIGINT");

        await new Promise(resolve => child.on("exit", resolve));

        assert.strictEqual(fs.existsSync(filePath), false, "Partial file should be deleted on SIGINT");
    });

    after(async function () {
        await new Promise(resolve => testServer.close(resolve));
        console.log("[ DEBUG ] Stopping test server for request tests...");
    });
});
