const webpack = require('webpack')
const resolve = require("../utils/resolve");

module.exports = {
  mode: 'production', // 生产环境

 optimization: { // 优化项
   // sideEffects和usedExports是两种不同的优化方式。
   usedExports: true, // 识别无用代码 未使用的导出内容不会被生成 usedExports 依赖于 terser 去检测语句中的副作用。
    // sideEffects: true,  // 开启副作用标识功能 sideEffects更为有效是因为它允许跳过整个模块/文件和整个文件子树。
   //...
 },
  entry: {
    index: resolve('src/index.js'),
  },
  externals: {
    'react': "react",
    'react-dom': 'reactDOM'
  },
  
  output: {
    filename: '[name].js',
    path: resolve('dist'),
    publicPath: '/'
  },

  module: {
    rules: [
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
 
  devtool: 'source-map'


}