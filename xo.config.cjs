/** @typedef {import("xo").Options} XoOptions */

/** @type {import("@yoursunny/xo-config")} */
const { js, ts, literate, web, pptr, merge } = require("@yoursunny/xo-config");

/**
 * @param {string[]} pkgs
 * @param {XoOptions} config
 * @returns {XoOptions[]}
 */
function makePackageOverrides(config, ...pkgs) {
  return [
    {
      files: [
        pkgs.map((pkg) => `**${pkg}/**/*.{ts,cts,mts}`),
      ],
      ...config,
    },
    {
      files: [
        pkgs.map((pkg) => `**${pkg}/**/*_browser.{ts,cts,mts}`),
      ],
      ...merge(config, web),
    },
    {
      files: [
        pkgs.flatMap((pkg) => [`**${pkg}/test-fixture/**/*.{ts,cts,mts}`, `**${pkg}/tests/**/*.{ts,cts,mts}`]),
      ],
      ...merge(config, {
        rules: {
          "import/no-extraneous-dependencies": "off",
        },
      }),
    },
  ];
}

/** @type {XoOptions} */
const tsdoc = {
  plugins: ["tsdoc"],
  rules: {
    "tsdoc/syntax": "warn",
  },
};

/** @type {XoOptions} */
module.exports = {
  ...js,
  overrides: [
    ...makePackageOverrides(merge(js, ts, tsdoc), ""),
    ...makePackageOverrides(merge(js, ts, tsdoc, web),
      "/pkg/quic-transport",
      "/pkg/web-bluetooth-transport",
      "/pkg/ws-transport",
    ),
    {
      files: [
        "**/integ/browser-tests/**/*.{ts,cts,mts}",
      ],
      ...merge(js, ts, tsdoc, web, pptr),
    },
    {
      files: [
        "**/README.md.ts",
      ],
      ...merge(js, ts, tsdoc, literate, {
        rules: {
          "unicorn/no-process-exit": "off",
        },
      }),
    },
  ],
};
