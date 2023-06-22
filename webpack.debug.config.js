const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const CopyWebpackPlugin = require('copy-webpack-plugin');

const nodeModules = {}

fs.readdirSync('node_modules')
  .filter(function (x) {
    return ['.bin'].indexOf(x) === -1
  })
  .forEach(function (mod) {
    nodeModules[mod] = 'commonjs ' + mod
  })

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/articleProcessorService.js',
  devtool: "cheap-source-map",
  output: {
    path: path.join(__dirname, 'dist/build'),
    filename: 'server.js',
  },
  externals: nodeModules,
  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: './server.js.map'
    }),
    new CopyWebpackPlugin([
      { from: './env', to: '../env'},
      { from: './swagger', to: '../swagger'},
      { from: './package.json', to: '../package.json'},
      { from: './package-lock.json', to: '../package-lock.json'},
      { from: './src/swagger_defination', to: '../src/swagger_defination'},
      { from: './src/repository/postgres/execute', to: '../src/repository/postgres/execute'},
      { from: './assets', to: '../assets'},
      { from: './ecosystem.config.js', to: '../ecosystem.config.js'},
      { from: './dockerCommands.sh', to: '../dockerCommands.sh'},
  ]),
  ],
  watchOptions: {
    ignored: [
      'logs', 
      'node_modules/**', 
      path.resolve(__dirname, 'assets/customersSwaggerDefinition.json'),
      path.resolve(__dirname, 'assets/swaggerDefinition.json')
    ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
}
