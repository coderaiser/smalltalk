'use strict';

const {run} = require('madrun');
const {version} = require('./package');

module.exports = {
    'watch': () => 'nodemon --watch lib --watch test --exec',
    'watch:test': () => run('watch', 'npm test'),
    'watch:lint': () => run('watch', '\'npm run lint\''),
    'watch:lint:js': () => run('watch', '"run lint:js"'),
    'watch:coverage': () => run('watch', 'redrun coverage'),
    'coverage': () => 'nyc npm test',
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    'lint:css': () => 'stylelint css/*.css',
    'lint:js': () => 'putout lib test *.js',
    'lint': () => run('lint:*'),
    'fix:lint': () => run(['lint:js', 'lint:css'], '--fix'),
    'test': () => 'tape \'test/**/*.js\'',
    'test:update': () => 'UPDATE_FIXTURE=1 npm test',
    'build': () => 'webpack --progress --mode production',
    'wisdom': () => run(['build', 'upload:*']),
    'upload:main': () => upload('dist/smalltalk.min.js'),
    'upload:main:map': () => upload('dist/smalltalk.min.js.map'),
    'upload:native': () => upload('dist/smalltalk.native.min.js'),
    'upload:native:map': () => upload('dist/smalltalk.native.min.js.map'),
};

function upload(name) {
    return `putasset -o coderaiser -r smalltalk -t v${version} -f ${name}`;
}

