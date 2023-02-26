module.exports = {
    devServer: {
      proxy: {
        '^/api': {
          target: 'http://localhost:8080/',
          changeOrigin: true,
          logLevel: "debug",
        },
      }
    },
    configureWebpack: {
      devtool: "source-map"
    }
  }