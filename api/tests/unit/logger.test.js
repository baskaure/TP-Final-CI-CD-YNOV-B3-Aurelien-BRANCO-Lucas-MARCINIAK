const log = require("../../src/utils/logger");

describe("logger.sanitize()", () => {
  test("masque les champs sensibles", () => {
    const out = log.sanitize({ user: "lucas", password: "secret123" });

    expect(out.user).toBe("lucas");
    expect(out.password).toBe("***");
  });

  test("masque récursivement dans les objets imbriqués", () => {
    const out = log.sanitize({ db: { database_url: "postgres://x" } });

    expect(out.db.database_url).toBe("***");
  });

  test("parcourt les tableaux", () => {
    const out = log.sanitize([{ token: "abc" }, { name: "ok" }]);

    expect(out[0].token).toBe("***");
    expect(out[1].name).toBe("ok");
  });

  test("laisse les valeurs primitives intactes", () => {
    expect(log.sanitize("texte")).toBe("texte");
    expect(log.sanitize(42)).toBe(42);
    expect(log.sanitize(null)).toBe(null);
  });
});

describe("logger niveaux", () => {
  test("écrit info/warn sur stdout et error sur stderr", () => {
    const out = jest.spyOn(console, "log").mockImplementation(() => {});
    const err = jest.spyOn(console, "error").mockImplementation(() => {});

    log.info({ msg: "a" });
    log.warn({ msg: "b" });
    log.error({ msg: "c" });
    log.fatal({ msg: "d" });

    expect(out).toHaveBeenCalled();
    expect(err).toHaveBeenCalled();

    out.mockRestore();
    err.mockRestore();
  });
});
