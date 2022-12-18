import { build } from "esbuild";
import { rmSync } from "node:fs";

const args = process.argv.slice(2);

const watch = args.some((p) => p == "--watch");

console.log("cleaning output directory");
rmSync("./dist", { recursive: true, force: true });

console.log("starting build for extension");
build({
    entryPoints: ["src/extension.ts"],
    platform: "node",
    external: ["vscode"],
    bundle: true,
    sourcemap: true,
    outfile: "dist/extension.js",
    watch: watch && {
        onRebuild(error, result) {
            if (error) console.error("watch build for extension failed:", error);
            else console.log("watch build for extension succeeded!");
        },
    },
})
    .then(() => {
        console.log("finished build for extension.");
    })
    .catch(() => process.exit(1));

console.log("starting build for server");
build({
    entryPoints: ["src/metrics/server/server.ts"],
    platform: "node",
    external: ["vscode"],
    bundle: true,
    sourcemap: true,
    outfile: "dist/server.js",
    watch: watch && {
        onRebuild(error, result) {
            if (error) console.error("watch build for server failed:", error);
            else console.log("watch build for server succeeded.");
        },
    },
})
    .then(() => {
        console.log("finished build for server.");
    })
    .catch(() => process.exit(1));
