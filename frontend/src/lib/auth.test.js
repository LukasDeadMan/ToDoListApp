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

  test("builds a nickname payload when the identifier starts with @", () => {
    expect(buildLoginPayload("@my-nick", "secret")).toEqual({
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

  test("rejects passwords with leading or trailing spaces", () => {
    expect(validatePasswordStrength("Teste123A ")).toBe(
      "Nao use espacos no inicio ou no fim da senha."
    );
  });

  test("builds a checklist showing which password rules are satisfied", () => {
    expect(getPasswordChecklist("Teste123A")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "length", valid: true }),
        expect.objectContaining({ id: "edge-spaces", valid: true }),
        expect.objectContaining({ id: "lowercase", valid: true }),
        expect.objectContaining({ id: "uppercase", valid: true }),
        expect.objectContaining({ id: "digit", valid: true }),
      ])
    );
  });
});
