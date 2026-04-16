import { buildLoginPayload } from "./auth";

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
});
