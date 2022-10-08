const webpack = require('webpack')
const resolve = require("../utils/resolve");

module.exports = {
  entry: {
    app: resolve('src/index.js'),
  },
  output: {
    filename: '[name].js',
    path: resolve('output'),
    publicPath: '/'
  },

  module: {
    rules: [
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    open: true,
    host: '0.0.0.0',
    port: 8007,
    https: false,
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    proxy: {
    },
  },
  devtool: 'source-map'


}