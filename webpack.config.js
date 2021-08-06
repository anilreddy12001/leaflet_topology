/*
*   Webpack.config.js
*   Created By: Gowtham.S
*/

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const glob = require('glob');
const fs = require('fs');
const webpack = require('webpack');
const path = require("path");
const isProd = process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production'; //true or false;
const cssDev = ['style-loader', 'css-loader?sourceMap'];
const cssProd = ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: ['css-loader'],
    publicPath: '../'
})
const IS_WDS = /webpack-dev-server/.test(process.env.npm_lifecycle_script);
const cssConfig = isProd ? cssProd : cssDev;
const reactCDNLink = isProd ? 'https://unpkg.com/react@16.1.1/umd/react.production.min.js' : 'https://unpkg.com/react@16/umd/react.development.js'
const reactDOMCDNLink = isProd ? 'https://unpkg.com/react-dom@16.1.1/umd/react-dom.production.min.js' : 'https://unpkg.com/react-dom@16.1.1/umd/react-dom.development.js'
var plugins = [
    new HtmlWebpackPlugin({
        title: 'Sure UI Component',
        hash: true,
        template: './source/index.html'
    }),
    new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'react',
            entry: reactCDNLink,
            global: 'React',
          },
          {
            module: 'react-dom',
            entry: reactDOMCDNLink,
            global: 'ReactDOM',
          },
        ],
      }),
    new ExtractTextPlugin({
        filename: 'styles/[name].css',
        disable: !isProd,
        allChunks: true
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NamedModulesPlugin(),
    //new BundleAnalyzerPlugin(),
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'SUREUIComponents_externals',
    //     minChunks: module => module.context && module.context.indexOf('node_modules') !== -1,
    //     filename: 'js/SUREUIComponents_externals.min.js',
    // }),
    new webpack.HotModuleReplacementPlugin()
]

fs.readdirSync(path.join(__dirname, 'source', 'samples')).forEach(file => {
    if (file.indexOf(".htm") !== -1) {
        plugins.push(
            new HtmlWebpackPlugin({
                title: file.replace(".html", ""),
                hash: true,
                publicPath: IS_WDS ? '' : '../',
                template: path.join(__dirname, 'source', 'samples', file),
                filename: IS_WDS ? file : path.join('samples', file.replace("master", "index"))
            })
        )
    }
})
//devtool: isProd ? 'source-map':'cheap-module-eval-source-map',

const config = {
    devServer: {
        compress: true,
        contentBase: './',
        port: 3000,
        hot: true
    },
    devtool: isProd ? 'source-map' : 'cheap-module-eval-source-map',
    //devtool:'cheap-module-eval-source-map',
    entry: {
        SUREUIComponents: './source/js/sureUIComponents.js'
    },
    externals: {
        react: {
            commonjs: "react",
            commonjs2: "react",
            amd: "React",
            root: "React"
        },
        "react-dom": {
            commonjs: "react-dom",
            commonjs2: "react-dom",
            amd: "ReactDOM",
            root: "ReactDOM"
        }
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css/,
                use: cssConfig
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    'file-loader?name=images/[name].[ext]'
                ]
            },
            { test: /\.(woff2?)$/, use: 'url-loader?limit=10000&name=fonts/[name].[ext]' },
            { test: /\.(ttf|eot)$/, use: 'file-loader?name=fonts/[name].[ext]' },
        ]
    },
    resolve: {
        alias: {
            'react': path.resolve(path.join(__dirname, 'node_modules', 'react')),
            'react-dom': path.resolve(path.join(__dirname, 'node_modules', 'react-dom'))
        }
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'js/[name].js',
        libraryTarget: 'umd'
    },
    plugins: plugins
};



//Build sample html files

module.exports = config
