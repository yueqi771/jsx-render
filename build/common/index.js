const resolve = require('../utils/resolve')
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const copyPlugins = require('copy-webpack-plugin')

module.exports = {
  mode: 'development',
  target: 'web',
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.json'],
    alias: {
        "@src": path.resolve(__dirname, '../../src'),
        "@root": path.resolve(__dirname, '../../')
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
        }
      }
    ]
  },

  plugins: [
    new HTMLPlugin({
      template: resolve('public/index.html'),
      filename: 'index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
    }),
  ]
}