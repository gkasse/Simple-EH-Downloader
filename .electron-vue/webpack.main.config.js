'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const BabiliWebpackPlugin = require('babili-webpack-plugin')

let mainConfig = {
  entry: {
    main: path.join(__dirname, '../src/main/index.ts')
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  output: {
    filename: 'main.js',
    path: path.join(__dirname, '../dist/electron')
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json', '.node']
  },
  target: 'electron-main'
}

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`,
      'process.env.WINDOW_URL': '"http://localhost:9080"'
    })
  )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  mainConfig.plugins.push(
    new BabiliWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      'process.env.SENTRY_URL': `"${process.env.SENTRY_DSN}"`
      // WINDOW_URLは実行時に解決するため設定しない
    })
  )
}

module.exports = mainConfig
