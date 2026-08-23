function polyfillToSorted() {
  const impl = function(compareFn) {
    return Array.from(this).sort(compareFn);
  };
  if (!Array.prototype.toSorted) Array.prototype.toSorted = impl;
  if (typeof Set !== 'undefined' && !Set.prototype.toSorted) Set.prototype.toSorted = impl;
  if (typeof Map !== 'undefined' && !Map.prototype.toSorted) Map.prototype.toSorted = impl;
}
polyfillToSorted();

if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return Array.from(this).reverse();
  };
}
Object.defineProperty(process.versions, 'node', { value: '20.9.0', writable: true, configurable: true });
process.argv = ['node', 'next', 'dev', '--webpack'];
require('../../../node_modules/next/dist/bin/next');
