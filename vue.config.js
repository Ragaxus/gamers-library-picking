module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://127.0.0.1:8080/',
        changeOrigin: true,
        logLevel: "debug",
      },
    }
  },
  runtimeCompiler: true,
  configureWebpack: {
    devtool: "source-map",
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js'
      }
    }
  }
}