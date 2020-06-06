const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/client/index.ts',
  output: {
    path: path.resolve(__dirname, './dist/client'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
  plugins: [new HtmlWebpackPlugin({ template: './src/client/index.html' })],
}
