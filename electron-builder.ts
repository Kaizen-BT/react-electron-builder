import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import mapWorkspaces from "@npmcli/map-workspaces";
import type { Configuration } from "app-builder-lib";

// Root package.json
const pkg = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf-8")
);

// Configuration for Electron-builder
export default async (): Promise<Configuration> => {
  const workspaceFiles = await getListOfFilesFromEachWorkspace();

  return {
    directories: {
      output: "dist",
      buildResources: "buildResources",
    },
    extraResources: [
      {
        // Database migrations for prod
        from: resolve("packages/database/drizzle"),
        to: "drizzle",
      },
    ],

    artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
    generateUpdatesFilesForAllChannels: true,
    linux: {
      target: ["AppImage"],
    },
    files: [
      "LICENSE*",
      pkg.main,
      "!node_modules/@app/**",
      ...workspaceFiles,

      // bindings is needed by better-sqlite3 and a plethora of other native modules
      // see: https://www.npmjs.com/package/better-sqlite3?activeTab=dependencies
      {
        from: "node_modules/bindings",
        to: "node_modules/bindings",
      },

      // Needed by bindings to operate
      // see: https://www.npmjs.com/package/bindings?activeTab=dependencies
      {
        from: "node_modules/file-uri-to-path",
        to: "node_modules/file-uri-to-path",
      },
    ],
  };
};

/**
 * By default, electron-builder copies each package into the output compilation entirety,
 * including the source code, tests, configuration, assets, and any other files.
 *
 * So you may get compiled app structure like this:
 * ```
 * app/
 * ├── node_modules/
 * │   └── workspace-packages/
 * │       ├── package-a/
 * │       │   ├── src/            # Garbage. May be safely removed
 * │       │   ├── dist/
 * │       │   │   └── index.js    # Runtime code
 * │       │   ├── vite.config.js  # Garbage
 * │       │   ├── .env            # some sensitive config
 * │       │   └── package.json
 * │       ├── package-b/
 * │       ├── package-c/
 * │       └── package-d/
 * ├── packages/
 * │   └── entry-point.js
 * └── package.json
 * ```
 *
 * To prevent this, we read the “files”
 * property from each package's package.json
 * and add all files that do not match the patterns to the exclusion list.
 *
 * This way,
 * each package independently determines which files will be included in the final compilation and which will not.
 *
 * So if `package-a` in its `package.json` describes
 * ```json
 * {
 *   "name": "package-a",
 *   "files": [
 *     "dist/**\/"
 *   ]
 * }
 * ```
 *
 * Then in the compilation only those files and `package.json` will be included:
 * ```
 * app/
 * ├── node_modules/
 * │   └── workspace-packages/
 * │       ├── package-a/
 * │       │   ├── dist/
 * │       │   │   └── index.js    # Runtime code
 * │       │   └── package.json
 * │       ├── package-b/
 * │       ├── package-c/
 * │       └── package-d/
 * ├── packages/
 * │   └── entry-point.js
 * └── package.json
 * ```
 */
async function getListOfFilesFromEachWorkspace() {
  const workspaces: Map<string, string> = await mapWorkspaces({
    cwd: process.cwd(),
    pkg,
  });

  const allFilesToInclude: string[] = [];

  for (const [name, path] of workspaces) {
    const pkgPath = join(path, "package.json");

    const workspacePkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

    let patterns = workspacePkg.files || ["dist/**", "package.json"];
    patterns = patterns.map((p: string) => join("node_modules", name, p));
    allFilesToInclude.push(...patterns);
  }

  return allFilesToInclude;
}
