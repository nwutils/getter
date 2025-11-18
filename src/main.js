import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import url from "node:url";

import axios from "axios";
import semver from "semver";

import decompress from "./decompress.js";
import ffmpeg from "./ffmpeg.js";
import node from "./node.js";
import nw from "./nw.js";
import verify from "./verify.js";

/**
 * @typedef {object} Options
 * @property {string | "latest" | "stable" | "lts"} [version = "latest"]                            Runtime version
 * @property {"normal" | "sdk"}                     [flavor = "normal"]                             Build flavor
 * @property {"linux" | "osx" | "win"}              [platform]                                      Target platform
 * @property {"ia32" | "x64" | "arm64"}             [arch]                                          Target arch
 * @property {string}                               [downloadUrl = "https://dl.nwjs.io"]            Download server
 * @property {string}                               [manifestUrl = "https://nwjs.io/versions.json"] Manifest URL
 * @property {string}                               [cacheDir = "./cache"]                          Cache directory
 * @property {boolean}                              [cache = true]                                  If false, remove cache and redownload.
 * @property {boolean}                              [ffmpeg = false]                                If true, ffmpeg is not downloaded.
 * @property {boolean}                              [nativeAddon = false]                           If true, download node headers.
 * @property {boolean}                              [shaSum = true]                                 If true shasum is enabled, otherwise disabled.
 */

/**
 * Get NW.js and related binaries for Linux, MacOS and Windows.
 * @async
 * @function
 * @param  {Options}    options  Get mode options
 * @returns {Promise<void>}
 */
async function get(options) {

  const manifestResponse = await axios.get(options.manifestUrl);
  const manifestData = manifestResponse.data;

  if (options.version === "latest" | options.version === "stable" | options.version === "lts") {
    options.version = manifestData[options.version];
  } else if (semver.valid(semver.coerce(options.version))) {
    options.version = semver.coerce(options.version).version;
  }

  if (!options.flavor === "normal" && !options.flavor === "sdk") {
    options.flavor = "normal";
  }

  const PLATFORM_KV = {
    darwin: "osx",
    linux: "linux",
    win32: "win",
  };
  options.platform = PLATFORM_KV[process.platform];

  const ARCH_KV = {
    x64: "x64",
    ia32: "ia32",
    arm64: "arm64",
  };
  options.arch = ARCH_KV[process.arch];

  const uri = new url.URL(options.downloadUrl);

  /* Download server is the cached directory. */
  if (uri.protocol === "file:") {
    options.cacheDir = path.resolve(decodeURIComponent(options.downloadUrl.slice("file://".length)));
  }

  /* If `options.cacheDir` exists, then `true`. Otherwise, it is `false`. */
  if (fs.existsSync(options.cacheDir) === false) {
    await fs.promises.mkdir(options.cacheDir, { recursive: true });
  }

  /**
   * File path to compressed binary.
   * @type {string}
   */
  let nwFilePath = path.resolve(
    options.cacheDir,
    `nwjs${options.flavor === "sdk" ? "-sdk" : ""}-v${options.version}-${options.platform}-${options.arch}.${options.platform === "linux" ? "tar.gz" : "zip"
    }`,
  );

  /**
   * File path to directory which contains NW.js and related binaries.
   * @type {string}
   */
  let nwDirPath = path.resolve(
    options.cacheDir,
    `nwjs${options.flavor === "sdk" ? "-sdk" : ""}-v${options.version}-${options.platform}-${options.arch}`,
  );

  // If `options.cache` is false, then remove the compressed binary.
  if (options.cache === false) {
    await fs.promises.rm(nwFilePath, {
      recursive: true,
      force: true,
    });
  }

  // We remove the nwDir to prevent the edge case where you download with ffmpeg flag enabled
  // but want a subsequent build with ffmpeg flag disabled. By removing the directory and
  // decompressing it again, we prevent the community ffmpeg files from being left over.
  // This is important since the community ffmpeg builds have specific licensing constraints.
  await fs.promises.rm(nwDirPath, { recursive: true, force: true });

  /* If the compressed binary exists, then `true`. Otherwise, it is `false`. */
  if (fs.existsSync(nwFilePath) === false) {
    nwFilePath = await nw(options.downloadUrl, options.version, options.flavor, options.platform, options.arch, options.cacheDir);
  }

  await decompress(nwFilePath, options.cacheDir);

  await verify(
    `${options.downloadUrl}/v${options.version}/SHASUMS256.txt`,
    `${options.cacheDir}/shasum/${options.version}.txt`,
    options.cacheDir,
    options.ffmpeg,
    options.shaSum,
  );

  if (options.ffmpeg === true) {

    /**
     * File path to compressed binary which contains community FFmpeg binary.
     * @type {string}
     */
    let ffmpegFilePath = path.resolve(
      options.cacheDir,
      `ffmpeg-${options.version}-${options.platform}-${options.arch}.zip`,
    );

    // If `options.cache` is false, then remove the compressed binary.
    if (options.cache === false) {
      await fs.promises.rm(ffmpegFilePath, {
        recursive: true,
        force: true,
      });
    }

    /* If the compressed binary exists, then `true`. Otherwise, it is `false`. */
    if (fs.existsSync(ffmpegFilePath) === false) {
      // Do not update the options.downloadUrl with the ffmpeg URL here. Doing so would lead to error when options.ffmpeg and options.nativeAddon are both enabled.
      const downloadUrl =
        "https://github.com/nwjs-ffmpeg-prebuilt/nwjs-ffmpeg-prebuilt/releases/download";
      ffmpegFilePath = await ffmpeg(downloadUrl, options.version, options.platform, options.arch, options.cacheDir);
    }

    await decompress(ffmpegFilePath, options.cacheDir);

    /**
     * Platform dependant file name of FFmpeg binary.
     * @type {string}
     */
    let ffmpegFileName = "";

    if (options.platform === "linux") {
      ffmpegFileName = "libffmpeg.so";
    } else if (options.platform === "win") {
      ffmpegFileName = "ffmpeg.dll";
    } else if (options.platform === "osx") {
      ffmpegFileName = "libffmpeg.dylib";
    }

    /**
     * File path to platform specific FFmpeg file.
     * @type {string}
     */
    let ffmpegBinaryPath = path.resolve(options.cacheDir, ffmpegFileName);

    /**
     * File path of where FFmpeg will be copied to.
     * @type {string}
     */
    let ffmpegBinaryDest = "";

    if (options.platform === "linux") {
      ffmpegBinaryDest = path.resolve(nwDirPath, "lib", ffmpegFileName);
    } else if (options.platform === "win") {
      ffmpegBinaryDest = path.resolve(nwDirPath, ffmpegFileName);
    } else if (options.platform === "osx") {
      ffmpegBinaryDest = path.resolve(
        nwDirPath,
        "nwjs.app",
        "Contents",
        "Frameworks",
        "nwjs Framework.framework",
        "Versions",
        "Current",
        ffmpegFileName,
      );
    }

    await fs.promises.copyFile(ffmpegBinaryPath, ffmpegBinaryDest);

  }

  if (options.nativeAddon === true) {

    /**
     * File path to NW"js Node headers tarball.
     * @type {string}
     */
    let nodeFilePath = path.resolve(
      options.cacheDir,
      `headers-v${options.version}.tar.gz`,
    );

    // If `options.cache` is false, then remove the compressed binary.
    if (options.cache === false) {
      await fs.promises.rm(nodeFilePath, {
        recursive: true,
        force: true,
      });
    }

    /* If the compressed binary exists, then `true`. Otherwise, it is `false`. */
    if (fs.existsSync(nodeFilePath) === false) {
      nodeFilePath = await node(options.downloadUrl, options.version, options.cacheDir);
    }

    await decompress(nodeFilePath, options.cacheDir);

  }
}

export default get;
