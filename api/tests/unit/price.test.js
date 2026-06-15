const { formatPrice } = require("../../src/utils/price");

describe("formatPrice()", () => {
  describe("cas nominaux", () => {
    test("convertit des centimes en euros formatés", () => {
      expect(formatPrice(5990)).toBe("59.90 €");
    });

    test("gère les montants ronds", () => {
      expect(formatPrice(1000)).toBe("10.00 €");
    });

    test("gère un montant de 1 centime", () => {
      expect(formatPrice(1)).toBe("0.01 €");
    });

    test("gère zéro", () => {
      expect(formatPrice(0)).toBe("0.00 €");
    });

    test("gère les grands montants", () => {
      expect(formatPrice(129900)).toBe("1299.00 €");
    });
  });

  describe("cas d'erreur", () => {
    test("lève TypeError si cents n'est pas un entier", () => {
      expect(() => formatPrice(59.9)).toThrow(TypeError);
      expect(() => formatPrice("5990")).toThrow(TypeError);
      expect(() => formatPrice(null)).toThrow(TypeError);
    });

    test("lève RangeError si cents est négatif", () => {
      expect(() => formatPrice(-1)).toThrow(RangeError);
      expect(() => formatPrice(-100)).toThrow(RangeError);
    });
  });
});
