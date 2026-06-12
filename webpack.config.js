// This project is built using Vite (react + vite + tailwind css) as per the framework requirements.
// vite.config.js is the active bundler configuration.
// If you specifically need Webpack in the future, compile with the configurations below.

module.exports = {
  mode: 'production',
  entry: {
    popup: './src/popup/main.jsx',
    options: './src/options/main.jsx',
    newtab: './src/newtab/main.jsx',
    background: './src/background/background.js',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
