const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    content: './src/content/content.ts',
    background: './src/background/background.ts',
    popup: './src/popup/popup.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  watch: true,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@content': path.resolve(__dirname, 'src/content'),
      '@background': path.resolve(__dirname, 'src/background'),
    },
  },
  devtool: 'source-map',
  watch: false,
};
