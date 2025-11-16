import assert from "node:assert";
import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { after, before, describe, it } from "node:test";

import get from "../../src/main.js";

describe("getter test suite", function () {

    it("downloads a file from a test server", async function () {

        await get({
            version: "0.105.0",
            flavor: "sdk",
            platform: "linux",
            arch: "x64",
            downloadUrl: "https://dl.nwjs.io",
            cacheDir: "cache",
            cache: true,
            ffmpeg: false,
            shaSum: true,
        });

        assert.ok(fs.existsSync("./cache"), "File has been downloaded...");
    });
});
