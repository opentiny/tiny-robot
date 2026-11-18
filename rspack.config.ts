import path from "node:path";
import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import { VueLoaderPlugin } from "vue-loader";
export default defineConfig({
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: "./src/main.ts",
  output: {
    path: path.resolve("dist"),
    publicPath: "auto",
    filename: "assets/[name].[contenthash:8].js",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".js", ".vue"],
    fullySpecified: false,
    extensionAlias: { ".js": [".ts", ".js"] },
    alias: { vue$: "vue/dist/vue.runtime.esm-bundler.js" },
  },
  stats: "errors-only",
  module: {
    rules: [
      { test: /\.m?js$/, resolve: { fullySpecified: false } },
      { test: /\.vue$/, loader: "vue-loader", options: { experimentalInlineMatchResource: true } },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: "builtin:swc-loader",
        options: { jsc: { parser: { syntax: "typescript" }, target: "es2022" } },
        type: "javascript/auto",
      },
      { test: /\.css$/, type: "css/auto" },
      { test: /\.(woff2?|ttf|svg|png|jpe?g|gif|webp)$/, type: "asset/resource" },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new rspack.HtmlRspackPlugin({ template: "./src/index.html", scriptLoading: "defer" }),
    new rspack.DefinePlugin({
      __API_ORIGIN__: JSON.stringify(process.env.API_ORIGIN || "https://api.deepseek.com"),
      __VUE_OPTIONS_API__: "true",
      __VUE_PROD_DEVTOOLS__: "false",
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
    }),
    new rspack.CopyRspackPlugin({ patterns: [{ from: "LICENSE*", to: "[name][ext]" }] }),
  ],
  devServer: { host: "127.0.0.1", port: 8094 },
  performance: { hints: false },
});
