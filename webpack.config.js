const path = require('path')

module.exports = (env, argv) => {
  const config = {
    entry: {
      eventPage: './src/eventPage.js',
      options: './src/options.js',
      content: './src/content.js',
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'source-map-loader',
            },
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {targets: 'defaults'}],
                ]
              }
            },
          ],
        },
        {
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader'],
        }
      ],
    },
  }

  if (argv.mode === 'development') {
    config.devtool = 'source-map'
  }

  return config
}
