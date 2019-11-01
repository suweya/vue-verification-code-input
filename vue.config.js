const isDev = process.env.NODE_ENV === "development";

module.exports = {
  css: { extract: false },
  configureWebpack: {
    externals: isDev
      ? {}
      : {
          vue: "Vue",
          "core-js": "core-js"
        }
  }
};
