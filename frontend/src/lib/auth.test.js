import {
  buildLoginPayload,
  getPasswordChecklist,
  validatePasswordStrength,
} from "./auth";

describe("buildLoginPayload", () => {
  test("builds an email payload when the identifier contains @", () => {
    expect(buildLoginPayload("User@Example.com", "secret")).toEqual({
      email: "user@example.com",
      password: "secret",
    });
  });

  test("builds a nickname payload when the identifier is not an email", () => {
    expect(buildLoginPayload("my-nick", "secret")).toEqual({
      nickname: "my-nick",
      password: "secret",
    });
  });

  test("rejects a weak numeric password", () => {
    expect(validatePasswordStrength("12345678")).toBe(
      "Escolha uma senha menos previsivel."
    );
  });

  test("accepts a stronger password with mixed character classes", () => {
    expect(validatePasswordStrength("Teste123A")).toBe("");
  });

  test("builds a checklist showing which password rules are satisfied", () => {
    expect(getPasswordChecklist("Teste123A")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "length", valid: true }),
        expect.objectContaining({ id: "lowercase", valid: true }),
        expect.objectContaining({ id: "uppercase", valid: true }),
        expect.objectContaining({ id: "digit", valid: true }),
      ])
    );
  });
});
