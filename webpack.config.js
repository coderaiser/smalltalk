'use strict';

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const dir = './lib';

const dist = path.resolve(__dirname, 'dist');
const devtool = 'source-map';

const rules = [{
    test: /\.css$/,
    loader: 'style-loader!css-loader!clean-css-loader',
}, {
    test: /\.(png|gif|svg|woff|woff2|eot|ttf)$/,
    loader: 'url-loader?limit=50000',
}];

const optimization = {
    minimize: true,
    minimizer: [
        new TerserPlugin({
            extractComments: true,
        }),
    ],
};

const filename = `[name].min.js`;

module.exports = {
    devtool,
    entry: {
        'smalltalk': `${dir}/smalltalk.js`,
        'smalltalk.native': `${dir}/smalltalk.native.js`,
    },
    optimization,
    output: {
        library: 'smalltalk',
        filename,
        path: dist,
        pathinfo: true,
        libraryTarget: 'var',
        devtoolModuleFilenameTemplate,
    },
    module: {
        rules,
    },
};

function devtoolModuleFilenameTemplate(info) {
    const resource = info.absoluteResourcePath.replace(__dirname + path.sep, '');
    return `file://smalltalk/${resource}`;
}
