const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HappyPack = require('happypack');
const devMode = process.env.NODE_ENV === 'development';

const config = {
  watch: devMode,
  mode: devMode ? 'development' : 'production',
  entry: {
    'game': './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, './'),
    libraryTarget: 'commonjs',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      'three': path.join(__dirname, 'node_modules/three/build/three.min.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: 'happypack/loader?id=ts',
      },
      {
        include: path.resolve('node_modules', 'three'),
        sideEffects: false
      }
    ],
  },
  devtool: 'none',
  performance: {
    hints: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new ForkTsCheckerWebpackPlugin({
      tslint: path.resolve(__dirname, 'tslint.json'),
      memoryLimit: '4056',
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }),
    new HappyPack({
      id: 'ts',
      threads: 4,
      use: [
        'babel-loader',
      ],
    }),
  ],
};
module.exports = config;