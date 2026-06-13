const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/**
 * Allow metro to bundle the shared API layer that lives outside apps/mobile
 * (the web project's lib/ and types/), while still resolving npm packages from
 * the app's own node_modules.
 */
const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [path.join(repoRoot, "lib"), path.join(repoRoot, "types")];

config.resolver.nodeModulesPaths = [path.join(projectRoot, "node_modules")];

module.exports = config;
