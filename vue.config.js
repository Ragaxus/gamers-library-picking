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