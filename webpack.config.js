const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { minify } = require("csso");
const { extname } = require("path");

const transformCss = (content, file) => {
  if (process.env.PROD && extname(file) === ".css") {
    const res = minify(content.toString());
    return res.css;
  } else {
    return content;
  }
};

module.exports = {
  context: path.resolve(__dirname),
  mode : "production",
  entry: {
    script: "./src/UI/script.ts",
    background: "./src/background/host.ts",
    popup: "./src/popup.ts",
    content: "./src/content/contentScript.ts",
  },
  output: {
    path: path.resolve("dist"),
    filename: "js/[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./public/css/*", to: "css/[name][ext]", transform: transformCss },
        { from: "./public/icons", to: "icons/[name][ext]" },
        { from: "./src/*.html", to: "[name][ext]" },
        { from: "node_modules/webextension-polyfill/dist/browser-polyfill.min.js", to: "js" },
        { from: "./manifest.json", to: "manifest.json" },
      ],
    }),
  ],
  devtool: "inline-source-map",
  mode: process.env.PROD ? "production" : "development",
};
