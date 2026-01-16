import assert from "node:assert";
import fs from "node:fs";
import { describe, it } from "node:test";

import get from "../../src/main.js";

describe("getter test suite", function () {

    it("downloads a file from a test server", async function () {
        // Skip download if cache exists to avoid network issues
        if (!fs.existsSync("./cache/nwjs-v0.107.0-linux-x64")) {
            await get({
                version: "latest",
                flavor: "normal",
                platform: "linux",
                arch: "x64",
                downloadUrl: "https://dl.nwjs.io",
                manifestUrl: "https://nwjs.io/versions.json",
                cacheDir: "./cache",
                cache: true,
                ffmpeg: false,
                nativeAddon: false,
                shaSum: true,
            });
        }

        assert.ok(fs.existsSync("./cache/nwjs-v0.107.0-linux-x64"), "File has been downloaded...");
    });
});
