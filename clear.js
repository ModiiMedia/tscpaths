// eslint-disable-next-line import/no-extraneous-dependencies
const { removeSync } = require('fs-extra');

const dirs = ['./lib', './cjs', './coverage'];

// eslint-disable-next-line no-restricted-syntax
for (const dir of dirs) {
  removeSync(dir);
}
