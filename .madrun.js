import {run, cutEnv} from 'madrun';
import {defineEnv} from 'supertape/env';

const env = defineEnv({
    css: true,
});

export default {
    'watch': () => 'nodemon --watch lib --watch test --exec',
    'watch:test': () => run('watch', 'npm test'),
    'watch:lint': async () => await run('watch', `'npm run lint'`),
    'watch:lint:js': () => run('watch', '"run lint:js"'),
    'watch:coverage': () => run('watch', 'redrun coverage'),
    'coverage': async () => [env, `c8 ${await cutEnv('test')}`],
    'report': () => 'c8 report --reporter=lcov',
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
    'test': () => [env, `tape --no-check-scopes 'test/**/*.js'`],
    'test:update': async () => [`await cutEnv('test')`, {
            UPDATE_FIXTURE: 1,
            ...env,
        }],
    'build': () => 'webpack --progress --mode production',
    'wisdom': () => run('build'),
    'wisdom:done': () => run('upload:*'),
    'upload:main': () => upload('dist/smalltalk.min.js'),
    'upload:main:map': () => upload('dist/smalltalk.min.js.map'),
    'upload:native': () => upload('dist/smalltalk.native.min.js'),
    'upload:native:map': () => upload('dist/smalltalk.native.min.js.map'),
};

function upload(name) {
    return 'putasset -o coderaiser -r smalltalk -t v`version`' + ` -f ${name}`;
}
