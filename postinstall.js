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

function warnIfNoGetRandomValues() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'),
  );
  if ('react-native-get-random-values' in packageJson['dependencies']) return;
  throw new Error(
    'react-native-get-random-values is missing. It seems like you are ' +
      'installing @railgun-community/wallet in a React Native project. ' +
      'This requires the peer dependency react-native-get-random-values. ' +
      '\n' +
      'Please add it to your package.json dependencies and run npm install ' +
      '(or yarn) again.',
  );
}

if (isReactNativeProject) {
  patchCipherBase();
  warnIfNoGetRandomValues();
}
