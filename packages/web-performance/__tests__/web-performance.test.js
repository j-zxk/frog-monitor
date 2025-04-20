'use strict';

const webPerformance = require('..');
const assert = require('assert').strict;

assert.strictEqual(webPerformance(), 'Hello from webPerformance');
console.info('webPerformance tests passed');
