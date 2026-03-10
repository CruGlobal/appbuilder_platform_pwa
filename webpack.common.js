const path = require("path");
const APP = path.resolve(__dirname);
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
   context: APP,
   entry: {
      app: path.join(APP, "src", "js", "app.js"),
   },
   output: {
      path: path.join(APP, "..", "web", "assets", "mobile"),
      filename: "mobile_[name].js",
   },
   module: {
      rules: [
         {
            test: /\.less$/i,
            use: [
               // compiles Less to CSS
               "style-loader",
               "css-loader",
               "less-loader",
            ],
         },
         {
            test: /\.css$/,
            use: ["style-loader", "css-loader?url=false"],
         },
         {
            test: /\.(eot|woff|woff2|svg|ttf)([?]?.*)$/,
            use: ["url-loader?limit=10000000"],
         },
         {
            test: /\.(f7|jsx)$/,
            use: ["babel-loader", "framework7-loader"],
         },
      ],
   },
   plugins: [
      new HtmlWebpackPlugin({
         template: path.join(APP, "webpack", "index.ejs"),
         filename: path.join(
            APP,
            "..",
            "web",
            "assets",
            "mobile",
            "index.html"
         ),
         inject: "body",
         publicPath: "/assets/mobile",
      }),
      new CleanWebpackPlugin({
         cleanOnceBeforeBuildPatterns: ["*.js", "*.js.map"],
      }),
      new CopyWebpackPlugin({
         patterns: [
            {
               from: "*.{woff,woff2}",
               context: path.join(APP, "node_modules", "material-icons", "iconfont"),
               to: "fonts",
               noErrorOnMissing: true,
            },
            {
               from: "*.{woff,woff2}",
               context: path.join(APP, "node_modules", "framework7-icons", "fonts"),
               to: "fonts",
               noErrorOnMissing: true,
            },
         ],
      }),
   ],
   resolve: {
      alias: {
         assets: path.resolve(__dirname, "..", "web", "assets", "mobile"),
      },
   },
   optimization: {
      moduleIds: "deterministic",
      runtimeChunk: "single",
      splitChunks: {
         cacheGroups: {
            main: {
               test: /[\\/]src[\\/]/,
               name: "app",
               chunks: "all",
            },
            vendor: {
               test: /[\\/]node_modules[\\/]/,
               name: "vendors",
               chunks: "all",
            },
         },
      },
   },
};
