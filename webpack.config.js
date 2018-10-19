const path = require('path');
const { AngularCompilerPlugin } = require('@ngtools/webpack');
const ScriptExtPlugin = require('script-ext-html-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/app/main.ts',
  module: {
    rules: [
      {
        test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
        loader: '@ngtools/webpack'
      },
      { test: /\.css$/, loader: 'raw-loader' },
      { test: /\.html$/, loader: 'raw-loader' }
    ]
  },
  plugins: [
    new AngularCompilerPlugin({
      tsConfigPath: './src/app/tsconfig.json',
      entryModule: './src/app/app.module#AppModule',
      sourceMap: true
    }),
    new HtmlWebpackPlugin({
      template: __dirname + '/src/views/index.html',
      output: __dirname + '/dist/views',
      inject: 'head'
    }),
    new ScriptExtPlugin({
      defaultAttribute: 'defer'
    })
  ],
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/views')
  },
  devtool: "source-map",
  mode: "development"
};
