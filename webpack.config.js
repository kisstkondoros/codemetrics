//@ts-check
"use strict";
const path = require("path");

/**@type {import('webpack').Configuration}*/
const config = {
    target: "node",
    entry: {
        extension: "./src/extension.ts",
        server: "./src/metrics/server/server.ts"
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../[resource-path]"
    },
    devtool: "source-map",
    externals: {
        vscode: "commonjs vscode"
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            deepmerge$: path.resolve(__dirname, "node_modules/deepmerge/dist/umd.js")
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            }
        ]
    }
};

module.exports = config;
