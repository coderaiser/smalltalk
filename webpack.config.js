import path, {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dir = './lib';

const dist = path.resolve(__dirname, 'dist');
const devtool = 'source-map';

const rules = [{
    test: /\.css$/,
    use: [
        'style-loader',
        'css-loader',
        'clean-css-loader',
    ],
}, {
    test: /\.(png|gif|svg|woff|woff2|eot|ttf)$/,
    use: [{
        loader: 'url-loader',
        options: {
            limit: Infinity,
        },
    }],
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

export default {
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
