const request = require("supertest");
const app = require("../../src/app");
const db = require("../../src/db");

afterAll(async () => {
  await db.getPool().end();
});

describe("Erreurs 404", () => {
  test("route inexistante retourne 404", async () => {
    const res = await request(app).get("/une-route-inexistante");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Route not found");
  });

  test("sous-route inconnue retourne 404", async () => {
    const res = await request(app).get("/api/inconnu");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Route not found");
  });

  test("méthode non supportée sur /products retourne 404", async () => {
    const res = await request(app).delete("/products");

    expect(res.status).toBe(404);
  });
});

describe("Erreurs 500", () => {
  beforeEach(() => {
    jest.spyOn(db, "query").mockRejectedValue(new Error("DB crash simulé"));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GET /products retourne 500 si la DB plante", async () => {
    const res = await request(app).get("/products");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal server error");
  });

  test("GET /health retourne 503 si la DB plante", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(503);
    expect(res.body.status).toBe("error");
    expect(res.body.checks.database).toBe("error");
  });
});
