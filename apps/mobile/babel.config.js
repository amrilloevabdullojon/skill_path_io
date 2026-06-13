const path = require("path");

/**
 * The mobile app reuses the web project's portable API layer
 * (lib/contracts/*, lib/api/v1/client) via the same `@/...` alias the web app
 * uses. module-resolver rewrites `@/...` to the repo root at transform time;
 * metro.config.js exposes those folders to the bundler.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": path.resolve(__dirname, "../.."),
            "~": path.resolve(__dirname, "src"),
          },
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        },
      ],
    ],
  };
};
