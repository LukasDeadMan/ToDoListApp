import { matchRoute, normalizePath } from "./router";

describe("router helpers", () => {
  test("matches the task edit route and extracts params", () => {
    expect(matchRoute("/tasks/42/edit")).toMatchObject({
      name: "taskEdit",
      params: {
        taskId: "42",
      },
    });
  });

  test("normalizes root and nested paths", () => {
    expect(normalizePath("")).toBe("/");
    expect(normalizePath("/tasks/")).toBe("/tasks");
    expect(normalizePath("profile")).toBe("/profile");
  });

  test("returns notFound for unknown routes", () => {
    expect(matchRoute("/missing/path")).toMatchObject({
      name: "notFound",
      normalizedPath: "/missing/path",
    });
  });
});
