'use strict';

const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const {optimize} = webpack;
const {UglifyJsPlugin} = optimize;

const dir = './lib';

const {env} = process;
const isPoly = env.BUILD_TYPE === 'poly';

const dist = path.resolve(__dirname, 'dist');
const devtool = 'source-map';

const plugins = [
    new UglifyJsPlugin({
        sourceMap: true,
        comments: false,
    })
];

const loaders = [{
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
}];

const filename = `[name]${isPoly ? '.poly' : ''}.min.js`;

module.exports = {
    devtool,
    entry: {
        smalltalk: `${dir}/smalltalk.js`,
        'smalltalk.native': `${dir}/smalltalk.native.js`,
    },
    output: {
        library: 'smalltalk',
        filename,
        path: dist,
        pathinfo: true,
        libraryTarget: 'var',
        devtoolModuleFilenameTemplate,
    },
    plugins,
    externals: [
        externals
    ],
    module: {
        loaders,
    },
};

function externals(context, request, fn) {
    if (isPoly)
        return fn();
    
    const list = [
        'es6-promise',
    ];
    
    if (list.includes(request))
        return fn(null, request);
    
    fn();
}

function devtoolModuleFilenameTemplate(info) {
    const resource = info.absoluteResourcePath.replace(__dirname + path.sep, '');
    return `file://smalltalk/${resource}`;
}

