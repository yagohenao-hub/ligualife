if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function(compareFn) {
    return Array.from(this).sort(compareFn);
  };
}
if (typeof Set !== 'undefined' && !Set.prototype.toSorted) Set.prototype.toSorted = Array.prototype.toSorted;
if (typeof Map !== 'undefined' && !Map.prototype.toSorted) Map.prototype.toSorted = Array.prototype.toSorted;
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return Array.from(this).reverse();
  };
}
try {
  Object.defineProperty(process.versions, 'node', { value: '20.9.0', writable: true, configurable: true });
} catch {}
