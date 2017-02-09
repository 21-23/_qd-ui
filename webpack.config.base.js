const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');

module.exports = {
    entry: {
        'login': './app/login/login-view.js',
        'game': './app/game/game-view.js',
        'game-master': './app/game-master/game-master-view.js',
        'landing': './app/landing/landing-view.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.styl?$/,
                loader: 'stylint-loader'
            },
            {
                test: /\.js?$/,
                include: [
                    path.resolve(__dirname, 'app'),
                ],
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['es2015']
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ]
            },
            {
                test: /\.styl?$/,
                include: [
                    path.resolve(__dirname, 'app'),
                ],
                use: [
                    'style-loader',
                    'css-loader',
                    'resolve-url-loader',
                    'stylus-loader',
                ]
            },
            {
                test: /\.otf?$/,
                include: [
                    path.resolve(__dirname, 'app'),
                ],
                use: [
                    'file-loader',
                ]
            },
            {
                test: /\.png?$/,
                include: [
                    path.resolve(__dirname, 'app'),
                ],
                use: [
                    'file-loader?name=[name].[ext]',
                ]
            },
        ]
    },
    resolve: {
        alias: {
            'common': path.resolve(__dirname, 'app/common'),
        }
    },
    plugins: [
        new WebpackNotifierPlugin(),
        new HtmlWebpackPlugin({
            filename: 'login.html',
            template: 'app/login/login.html',
            chunks: ['login']
        }),
        new HtmlWebpackPlugin({
            filename: 'game.html',
            template: 'app/game/game.html',
            chunks: ['game']
        }),
        new HtmlWebpackPlugin({
            filename: 'game-master.html',
            template: 'app/game-master/game-master.html',
            chunks: ['game-master']
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'app/landing/landing.html',
            chunks: ['landing']
        }),
    ],
};