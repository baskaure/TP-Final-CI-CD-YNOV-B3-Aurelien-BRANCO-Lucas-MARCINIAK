function formatPrice(cents) {
  if (typeof cents !== "number" || !Number.isInteger(cents)) {
    throw new TypeError("cents must be an integer");
  }
  if (cents < 0) {
    throw new RangeError("cents must be >= 0");
  }
  return (cents / 100).toFixed(2) + " €";
}

module.exports = { formatPrice };
