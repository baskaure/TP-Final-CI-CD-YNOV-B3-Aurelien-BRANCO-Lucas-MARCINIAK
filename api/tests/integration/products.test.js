const request = require("supertest");
const app = require("../../src/app");
const db = require("../../src/db");

afterAll(async () => {
  await db.getPool().end();
});

describe("GET /products — intégration DB", () => {
  test("retourne 200 avec un tableau de produits", async () => {
    const res = await request(app).get("/products");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("source", "database");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("chaque produit contient les champs attendus", async () => {
    const res = await request(app).get("/products");

    for (const product of res.body.data) {
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("description");
      expect(product).toHaveProperty("price_cents");
      expect(typeof product.price_cents).toBe("number");
      expect(product.price_cents).toBeGreaterThan(0);
    }
  });

  test("les produits sont triés par id croissant", async () => {
    const res = await request(app).get("/products");

    const ids = res.body.data.map((p) => p.id);
    const sorted = [...ids].sort((a, b) => a - b);
    expect(ids).toEqual(sorted);
  });
});

describe("GET /health — intégration DB", () => {
  test("retourne 200 avec database: ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.checks.database).toBe("ok");
    expect(res.body.checks.api).toBe("ok");
  });

  test("contient un timestamp ISO valide", async () => {
    const res = await request(app).get("/health");

    expect(res.body).toHaveProperty("timestamp");
    expect(() => new Date(res.body.timestamp).toISOString()).not.toThrow();
  });
});
