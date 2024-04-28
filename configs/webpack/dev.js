// development config
const {merge} = require('webpack-merge');
const commonConfig = require('./common');

const PORT = 8080;

module.exports = merge(commonConfig, {
    mode: 'development',
    entry: [
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://localhost:' + PORT,
        'webpack/hot/only-dev-server',
        './index.tsx',
    ],
    module: {
        rules: [],
    },
    devServer: {
        hot: true, // enable HMR on the server
        port: PORT,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
        },
        historyApiFallback: true,
    },
});
