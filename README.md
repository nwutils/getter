# @nwutils/getter

## Usage

```js
import get from "@nwutils/getter";

get({
    ...
});

```

## API Reference

Options

| Name | Type    | Default   | Description |
| ---- | ------- | --------- | ----------- |
| mode | `"get" \| "run" \| "build"` | `"build"` | Choose between get, run or build mode |
| version | `string \| "latest" \| "stable"` | `"latest"` | Runtime version |
| flavor | `"normal" \| "sdk"` | `"normal"` | Runtime flavor |
| platform | `"linux" \| "osx" \| "win"` | | Host platform |
| arch | `"ia32" \| "x64" \| "arm64"` | | Host architecture |
| downloadUrl | `"https://dl.nwjs.io" \| "https://npm.taobao.org/mirrors/nwjs" \| https://npmmirror.com/mirrors/nwjs \| "https://github.com/corwin-of-amber/nw.js/releases/"` | `"https://dl.nwjs.io"` | Download server. Supports file systems too (for example `file:///home/localghost/nwjs_mirror`) |
| manifestUrl | `"https://nwjs.io/versions.json" \| "https://raw.githubusercontent.com/nwutils/nw-builder/main/src/util/osx.arm.versions.json"` | `"https://nwjs.io/versions.json"` | Versions manifest |
| cacheDir | `string` | `"./cache"` | Directory to cache NW binaries |
| cache | `boolean` | `true`| If true the existing cache is used. Otherwise it removes and redownloads it. |
| ffmpeg | `boolean` | `false`| If true the chromium ffmpeg is replaced by community version with proprietary codecs. |
| logLevel | `"error" \| "warn" \| "info" \| "debug"` | `"info"`| Specify level of logging. |
| shaSum | `boolean` | `true` | Flag to enable/disable shasum checks. |
