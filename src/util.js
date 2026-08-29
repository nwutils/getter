import path from "node:path";

/**
 * Get the platform dependant path of the NW.js or ChromeDriver binary.
 *
 * @param {"nwjs" | "chromedriver" | "all"} Path to NW.js or Chromedriver executable.
 * @param {object} options
 * @param {string} options.version
 * @param {string} options.flavor
 * @param {string} options.platform
 * @param {string} options.arch
 * @param {string} options.cacheDir
 * @return {Promise<string>}
 */
async function find(executable = "nwjs", options) {
  const nwDir = path.resolve(
    options.cacheDir,
    `nwjs${options.flavor === "sdk" ? "-sdk" : ""}-v${options.version}-${options.platform}-${options.arch}`,
  );

  /**
   * @type {Record<string, string>}
   */
  const EXE_NAME = {
    win: "nw.exe",
    osx: "nwjs.app/Contents/MacOS/nwjs",
    linux: "nw",
  };
  let binPath = "";

  if (executable === "nwjs") {
    binPath = path.resolve(nwDir, EXE_NAME[options.platform]);
  } else if (executable === "chromedriver") {
    binPath = path.resolve(
      nwDir,
      `chromedriver${process.platform === "win32" ? ".exe" : ""}`,
    );
  } else if (executable === "all") {
    binPath = nwDir;
  } else {
    console.error(
      `[ ERROR ] Expected nwjs or chromedriver, got ${executable}.`,
    );
  }

  return binPath;
}

export default { find };
