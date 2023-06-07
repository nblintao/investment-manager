const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: './src/js/index.js',
    output: {
        filename: 'main.js',
        publicPath: 'dist',
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "./src/html",
                    to: `${__dirname}/dist`,
                },
            ],
        }),
    ],
    devServer: {
        static: {
            directory: `${__dirname}/dist`,
        },
    },
};