// load path module from nodejs 
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

const VENDOR_LIBS = [
  "@uirouter/angularjs",
  "angular",
  "angular-animate",
  "angular-aria",
  "angular-cookies",
  "angular-loader",
  "angular-mocks",
  "angular-resource",
  "angular-route",
  "angular-sanitize",
  "angular-socket-io",
  "angular-validation-match",
  'popper.js',
  'bootstrap',
  "d3-selection",
  "fast-json-patch",
  "jquery-knob",
  "lodash",
  "moment",
  "noty",
  "numeral",
  /* below package is declared in entry.js for exposing */
  // 'jquery',
  // "d3",
]

const config = {
    entry: {
      bundle : './client/app.module.js',
      vendor : VENDOR_LIBS,
    },
    output: {
        path: path.resolve(__dirname, '../dist/client'), // absolute path with Path module, path.resolve() return correct path whatever on mac and window
        filename: '[name].[chunkhash].js',
    },
    module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
            }
          },
          {
            test : /\.css$/,
            use : [
              'style-loader', 
              'css-loader',
              // { loader: 'css-loader', options: { importLoaders: 1 } }, 
              // 'postcss-loader'
            ]
          },
          {
            // HTML LOADER
            // Reference: https://github.com/webpack/raw-loader
            // Allow loading html through js
            test: /\.html$/,
            loader: 'raw-loader'
          },
          {
            // ASSET LOADER
            // Reference: https://github.com/webpack/file-loader
            // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
            // Rename the file using the asset hash
            // Pass along the updated reference to your code
            // You can add here any file extension you want to get copied to your output
            test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)([\?]?.*)$/,
            use : {
              loader : 'file-loader'
            }
          },
        ]
      },
      plugins: [
        new HtmlWebpackPlugin({
          title: 'My App',
          template : 'client/index-template.html',
          filename: 'index.html', // default is index.html
          alwaysWriteToDisk: false,
        }),
        // new HtmlWebpackHarddiskPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
          name : ['vendor', 'manifest']
        }),
        // new webpack.NamedModulesPlugin(),
        // new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery',
          'window.jQuery': 'jquery', // for angularjs
          Popper: ['popper.js', 'default'],
          Tether : 'tether'
        })
      ]
};

module.exports = config;