'use strict';

const {run} = require('madrun');

module.exports = {
    'watch': () => 'nodemon --watch lib --watch test --exec',
    'watch:client': () => run('compile:client', '--watch'),
    'watch:client:dev': () => run('compile:client:dev', '--watch'),
    'watch:test': () => run('watch', 'npm test'),
    'watch:lint': () => run('watch', '\'npm run lint\''),
    'watch:lint:js': () => run('watch', '"run lint:js"'),
    'watch:coverage': () => run('watch', 'redrun coverage'),
    'watch:legacy': () => run('watch', 'redrun compile:legacy'),
    'coverage': () => 'nyc npm test',
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    'compile:legacy': () => 'babel -d legacy lib',
    'compile:client': () => 'webpack --progress --mode production',
    'compile:client:dev': () => 'webpack --progress --mode development',
    'build': () => run(['clean', 'init', 'build:*']),
    'build:js': () => run(['compile:*', 'legacy:*']),
    'legacy:index': () => 'echo "module.exports = require(\'./smalltalk\');" > legacy/index.js',
    'legacy:native': () => 'echo "module.exports = require(\'../legacy/smalltalk.native\');" > native/index.js',
    'clean': () => 'rimraf dist legacy native',
    'wisdom': () => run('build'),
    'lint:css': () => 'stylelint css/*.css',
    'lint:js': () => 'putout lib test madrun.js webpack.config.js',
    'lint': () => run('lint:*'),
    'fix:lint': () => run(['lint:js', 'lint:css'], '--fix'),
    'test': () => 'tape \'test/**/*.js\'',
    'test:update': () => 'UPDATE_FIXTURE=1 npm test',
    'init': () => 'mkdirp native',
};

