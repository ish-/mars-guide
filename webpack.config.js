var path = require('path');

const IS_DEV = (process.env.NODE_ENV === 'development')
const DEV_SERVER_IP = getLocalIP()

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var ExtractStyle = new ExtractTextPlugin("css", "./dist/bundle.css");
var ExtractHtml = new ExtractTextPlugin("html", "./dist/index.html");
var webpack = require("webpack");

module.exports = {
  entry: ['./src/main.js', './src/index.pug'],
  output: {
    path: __dirname,
    filename: './dist/bundle.js'
  },
  // devtool: 'cheap-module-source-map',
  devtool: 'source-map',
  module: {
    loaders: [
      { test: /\.vue$/, loader: 'vue'},
      { test: /\.json$/, loader: 'json'},
      { test: /\.js$/, exclude: /(node_modules|assets)/, loader: 'babel-loader' },
      // { test: /\.styl$/, loader: 'style-loader!css-loader!stylus-loader'},
      { test: /\.styl$/, loader: ExtractStyle.extract("css!stylus")},
      { test: /\.pug$/, loader: "pug" },
      { test: /index.pug$/, loader: ExtractHtml.extract("apply?config=applyIndex!pug") },
      { test: /\.svg/, loader: 'svg-url-loader'},
    ]
  },
  babel: {
    presets: ['es2015', 'stage-0'],
    plugins: ['transform-runtime'],
  },
  resolve: {
    // extensions: ['es6']
    extensions: ['', '.js', '.vue', '.styl'],
    fallback: [path.join(__dirname, './node_modules')],
    root: [
      path.join(__dirname, './src'),
      // path.join(__dirname, '../node_modules')
    ]
  },
  // resolve: {
  //   modulesDirectories: ['bower_components'],
  // },
  // resolve: {
  //       root: [path.join(__dirname, "bower_components")]
  //   },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'DEV_SERVER_IP': JSON.stringify(DEV_SERVER_IP)
      },
    }),
    new webpack.ProvidePlugin({
      _: "utils",
      Vue: "vue",
      config: "config",
    }),
    ExtractHtml, ExtractStyle,
    // new webpack.ResolverPlugin(
    //     new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(".bower.json", ["main"])
    // )
  ],
  applyIndex: {
    rootPath: IS_DEV ? 'http://' + DEV_SERVER_IP + '/mars-guide/dist/' : ''
  },
  vue: {
    loaders: {
      css: ExtractStyle.extract("css"),
      stylus: ExtractStyle.extract("css!stylus"),
      html: 'pug',
      js: 'babel',
    },
  },
  stylus: {
      use: [require('nib')()],
      import: ['~nib/lib/nib/index.styl', '~styles/common.styl'],
      define: {
        'inline-image': require('stylus-inline-webpack')({limit: 50000})
      },
  }
};

function getLocalIP () {
  var ips = require('child_process').execSync("ifconfig | grep inet | grep -v inet6 | awk '{gsub(/addr:/,\"\");print $2}'").toString().trim().split("\n");
  console.log('My IPs: ' + ips)
  return ips[1]
}