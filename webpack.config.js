const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ThreadsPlugin = require("threads-plugin");
const WebpackModules = require("webpack-modules");

module.exports = {
  entry: "./src/page.js",
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "bundle.js"
  },
  devServer: {
    stats: {
      children: false, // Hide children information
      maxModules: 0 // Set the maximum number of modules to be shown
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader"
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader" // creates style nodes from JS strings
          },
          {
            loader: "css-loader" // translates CSS into CommonJS
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html"
    }),
    new ThreadsPlugin(),
    new WebpackModules()
  ]
};
