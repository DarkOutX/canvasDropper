
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// const distPath = path.resolve(`./dist`);
// const outputPath = distPath;
const cacheDirectory = path.resolve(`./build_cache/`);

const babelConfig = {
    cacheDirectory: path.join(cacheDirectory, 'babel/'),
    presets: [
        "@babel/preset-react",
    ],
};

const babelLoader = {
    loader: 'babel-loader',
    options: babelConfig,
};
const typeScriptLoader = {
    loader: 'ts-loader',
    options: {
        // ignoreDiagnostics: [2451, 2307, 2352, 2741, 2307],
    },
};
const cssLoader = {
    loader: 'css-loader',
    options: {
        importLoaders: 1,
    },
};
const imageWebpackLoader = {
    loader: 'image-webpack-loader',
    options: {
        bypassOnDebug: true,
        optipng: {
            optimizationLevel: 7,
        },
        gifsicle: {
            interlaced: false,
        },
    },
};
const MiniCssExtractPluginLoader = {
    loader: MiniCssExtractPlugin.loader,
    options: {
        publicPath: './'
    },
};

module.exports = {
    context: path.resolve(__dirname, '../../src'),
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                // use: ['babel-loader', 'source-map-loader'],
                use: [
                    babelLoader,
                ],
                // exclude: /node_modules/,
            },
            {
                test: /\.tsx?$/,
                use: [
                    babelLoader,
                    typeScriptLoader,
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
            /*
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use: [
                    'url-loader?limit=100000',
                ],
            },
            */
            {
                test: /\.css$/,
                use: [
                    // MiniCssExtractPluginLoader,
                    cssLoader,
                    'style-loader',
                    'resolve-url-loader',
                ],
            },
            {
                test: /\.(scss|sass)$/,
                use: [
                    'style-loader',
                    cssLoader,
                    'sass-loader',
                    // 'resolve-url-loader',
                ],
            },

            {
                test: /\.(ico|svg|gif|webp|mng|bpg|apng|png|jpg|jpeg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            hash: 'sha512',
                            digest: 'hex',
                            name: 'img/[hash].[ext]',
                        },
                    },
                    imageWebpackLoader,
                ],
            },
        ],
    },
    plugins: [
        // new MiniCssExtractPlugin({ ignoreOrder: true }),
        new HtmlWebpackPlugin({ template: 'index.html.ejs' }),
        new DefinePlugin({
            PRODUCTION: JSON.stringify(!!process.env.NODE_ENV),
        }),
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        fallback: {
            typescript: require.resolve("typescript"),
            util: false,
            fs: false,
            // events: false,
            domain: false,
        },
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
    },
    // cache: {
    //     type: 'filesystem',
    //     cacheDirectory: cacheDirectory,
    // },
};
