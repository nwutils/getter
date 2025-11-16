# @nwutils/getter

[![npm](https://img.shields.io/npm/v/@nwutils/getter/latest)](https://www.npmjs.com/package/@nwutils/getter/v/latest)

Download NW.js and related binaries for Linux, MacOS and Windows.

## Getting Started

1. Install [Volta](https://volta.sh)
1. `npm i` to install third party dependencies

## Usage

```js
import get from "@nwutils/getter";

await get({
    ...
});
```

## API Reference

Options

| Name | Type    | Default   | Description |
| ---- | ------- | --------- | ----------- |
| version | `string \| "latest" \| "stable"` | `"latest"` | Runtime version |
| flavor | `"normal" \| "sdk"` | `"normal"` | Runtime flavor |
| platform | `"linux" \| "osx" \| "win"` | | Host platform |
| arch | `"ia32" \| "x64" \| "arm64"` | | Host architecture |
| downloadUrl | `"https://dl.nwjs.io" \| "https://npm.taobao.org/mirrors/nwjs" \| https://npmmirror.com/mirrors/nwjs \| "https://github.com/corwin-of-amber/nw.js/releases/"` | `"https://dl.nwjs.io"` | Download server. Supports file systems too (for example `file:///home/localghost/nwjs_mirror`) |
| manifestUrl | `"https://nwjs.io/versions.json" \| "https://raw.githubusercontent.com/nwutils/nw-builder/main/src/util/osx.arm.versions.json"` | `"https://nwjs.io/versions.json"` | Versions manifest |
| cacheDir | `string` | `"./cache"` | Directory to cache NW binaries |
| cache | `boolean` | `true`| If true the existing cache is used. Otherwise it removes and redownloads it. |
| ffmpeg | `boolean` | `false`| If true the chromium ffmpeg is replaced by community version with proprietary codecs. |
| shaSum | `boolean` | `true` | Flag to enable/disable shasum checks. |

## Contributing

### External contributor

- Use Node.js standard libraries whenever possible.
- Prefer to use syncronous APIs over modern APIs which have been introduced in later versions.

### Maintainer

- npm trusted publishing is used for releases
- a package is released when a maintainer creates a release note for a specific version
