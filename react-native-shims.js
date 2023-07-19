/* eslint-disable */

// Wallet (and Engine) uses Buffer,
// which is not available in React Native.
global.Buffer ??= require('buffer').Buffer;

// Wallet uses ethereum-cryptography,
// which needs @noble/hashes,
// which needs crypto.getRandomValues,
// which is not available in React Native.
require('react-native-get-random-values');

// Engine uses AES encryption,
// which we shim with browserify-aes,
// which needs cipher-base,
// which needs stream-browserify,
// which needs process.nextTick,
// which is not available in React Native.
process.nextTick = setImmediate;

// Engine's getPrivateScalarFromPrivateKey uses @noble/ed25519 sha512,
// which needs (web) crypto.subtle.digest,
// which is not available in React Native.
const cryptoBrowserify = require('crypto-browserify');
global.crypto ??= {};
global.crypto.subtle ??= {};
global.crypto.subtle.digest ??= (algorithm, data) => {
  const algo = algorithm.toLowerCase().replace('-', '');
  return cryptoBrowserify.createHash(algo).update(data).digest();
};

/**
 * Other package.json dependencies and why we need them:
 * - assert:
 *   - engine uses circomlibjs which uses assert
 * - events:
 *   - engine uses EventEmitter;
 *   - engine uses levelup which uses EventEmitter
 * - stream-browserify:
 *   - engine uses AES encryption, which we shim with browserify-aes, which
 *     needs cipher-base, which needs stream
 */
