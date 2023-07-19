/* eslint-disable */
const fs = require('node:fs');
const path = require('node:path');

const cwd = process.env.INIT_CWD;
const reactNativeFiles = ['ios', 'android', 'metro.config.js'];
const isReactNativeProject = reactNativeFiles.every(file =>
  fs.existsSync(path.join(cwd, file)),
);

/**
 * Patch `cipher-base` so that `stream` is replaced with `stream-browserify`
 */
function patchCipherBase() {
  if (!fs.existsSync(path.join(cwd, 'node_modules'))) return;
  if (!fs.existsSync(path.join(cwd, 'node_modules', 'cipher-base'))) return;

  const cipherBasePackageJson = JSON.parse(
    fs.readFileSync(
      path.join(cwd, 'node_modules', 'cipher-base', 'package.json'),
      'utf8',
    ),
  );
  cipherBasePackageJson['react-native'] = {
    stream: 'stream-browserify',
  };
  fs.writeFileSync(
    path.join(cwd, 'node_modules', 'cipher-base', 'package.json'),
    JSON.stringify(cipherBasePackageJson, null, 2),
    'utf8',
  );
}

if (isReactNativeProject) {
  patchCipherBase();
}
